package com.portfolio.service;

import com.portfolio.domain.dto.DocumentResponseDto;
import com.portfolio.domain.dto.DocumentSearchResultDto;
import com.portfolio.domain.dto.QueryResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * 문서 검색과 검색 결과를 기반으로 한 RAG 응답 생성 담당
 */
@Slf4j
@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatService chatService;

    public RagService(VectorStore vectorStore, ChatService chatService) {
        this.vectorStore = vectorStore;
        this.chatService = chatService;
    }

    /**
     * 질문과 유사한 문서 청크를 벡터 DB에서 검색
     */
    public List<DocumentSearchResultDto> retrieve(String question, int maxResults) {
        log.debug("검색 시작: '{}', 최대 결과 수: {}", question, maxResults);

        List<Document> documents = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(maxResults)
                        .build()
        );

        if (documents == null || documents.isEmpty()) {
            log.info("Vector DB 검색 결과 없음: '{}'", question);
            return List.of();
        }

        return IntStream.range(0, documents.size())
                .mapToObj(i -> DocumentSearchResultDto.from(documents.get(i), i))
                .toList();
    }

    /**
     * VectorStore Document를 내부 DTO로 변환
     */
    private DocumentSearchResultDto toSearchResultDto(Document document, int index) {
        Map<String, Object> metadata = document.getMetadata() != null
                ? document.getMetadata()
                : Map.of();

        String id = String.valueOf(
                metadata.getOrDefault("id", "doc-" + index)
        );

        double score = extractScore(metadata);

        return new DocumentSearchResultDto(
                id,
                document.getText(),
                score,
                metadata
        );
    }

    /**
     * metadata에 similarity score가 있으면 사용, 없으면 기본값 0.0
     */
    private double extractScore(Map<String, Object> metadata) {
        Object scoreObj = metadata.get("score");

        if (scoreObj instanceof Number number) {
            return number.doubleValue();
        }

        if (scoreObj instanceof String str) {
            try {
                return Double.parseDouble(str);
            } catch (NumberFormatException ignored) {
            }
        }

        return 0.0;
    }

    /**
     * 검색된 청크를 컨텍스트로 조합하여 LLM 응답 생성
     */
    public String generateAnswerWithContexts(String question, List<DocumentSearchResultDto> relevantDocs, String model) {
        log.debug("RAG 응답 생성 시작: '{}', 모델: {}", question, model);

        if (relevantDocs == null || relevantDocs.isEmpty()) {
            log.info("관련 정보를 찾을 수 없음: '{}'", question);
            return "관련 정보를 찾을 수 없습니다. 다른 질문을 시도해 주세요.";
        }

        String context = IntStream.range(0, relevantDocs.size())
                .mapToObj(i -> "[" + (i + 1) + "] " + relevantDocs.get(i).getContent())
                .collect(Collectors.joining("\n\n"));

        String systemPrompt = """
                당신은 Hyeyoon의 포트폴리오 기반 정보를 답변하는 AI 어시스턴트입니다.
                반드시 제공된 정보 안에서만 답변하세요.
                주어진 정보에 답이 없다면 추측하지 말고 모른다고 답하세요.
                답변은 간결하지만 구체적으로 작성하세요.
                가능하면 프로젝트명, 역할, 기술 스택, 주요 성과를 중심으로 설명하세요.
                답변 마지막에 사용한 정보의 출처 번호 [1], [2] 등을 반드시 포함하세요.

                정보:
                """ + context;

        try {
            var response = chatService.openAiChat(question, systemPrompt, model);

            String aiAnswer = (response != null && response.getResult() != null)
                    ? response.getResult().getOutput().getText()
                    : "응답을 생성할 수 없습니다.";

            StringBuilder sourceInfo = new StringBuilder("\n\n참고 문서:\n");
            for (int i = 0; i < relevantDocs.size(); i++) {
                String source = String.valueOf(
                        relevantDocs.get(i).getMetadata().getOrDefault("source", "Unknown source")
                );
                sourceInfo.append("[")
                        .append(i + 1)
                        .append("] ")
                        .append(source)
                        .append("\n");
            }

            return aiAnswer + sourceInfo;

        } catch (Exception e) {
            log.error("AI 모델 호출 중 오류 발생: {}", e.getMessage(), e);
            return "AI 모델 호출 중 오류가 발생했습니다. 검색 결과만 제공합니다:\n\n" +
                    relevantDocs.stream()
                            .map(DocumentSearchResultDto::getContent)
                            .collect(Collectors.joining("\n\n"));
        }
    }

    /**
     * 최종 RAG 응답 DTO 생성
     */
    public QueryResponseDto ask(String question, int maxResults, String model) {
        List<DocumentSearchResultDto> relevantDocs = retrieve(question, maxResults);
        String answer = generateAnswerWithContexts(question, relevantDocs, model);

        List<DocumentResponseDto> relevantDocuments = relevantDocs.stream()
                .map(doc -> new DocumentResponseDto(
                        doc.getId(),
                        doc.getScore(),
                        doc.getContent(),
                        doc.getMetadata()
                ))
                .toList();

        return new QueryResponseDto(question, answer, relevantDocuments);
    }
}