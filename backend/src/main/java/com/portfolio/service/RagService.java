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
            너는 Hyeyoon의 포트폴리오를 기반으로 답변하는 AI다.
            
            다음 규칙을 반드시 지켜라:
            
            1. 각 문장은 줄바꿈으로 구분할 것
            2. 한 문장마다 줄바꿈(Enter)을 넣을 것
            3. 3~5문장으로 작성
            4. 자연스러운 자기소개 톤 유지
            5. 참고 문서, 번호 표시 금지
            6. 없는 내용은 추측하지 말고 간단히 모른다고 답변
            7. 귀여운 이모티콘을 적절하게 추가
            
            답변 스타일:
            - 면접에서 말하듯 자연스럽게
            - "~했습니다", "~경험이 있습니다" 형태
            - 너무 딱딱하지 않게
            
            문서:
            """ + context;

        try {
            var response = chatService.openAiChat(question, systemPrompt, model);

            String aiAnswer = (response != null && response.getResult() != null)
                    ? response.getResult().getOutput().getText()
                    : "응답을 생성할 수 없습니다.";

            return aiAnswer;

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