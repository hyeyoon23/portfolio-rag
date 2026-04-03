package com.portfolio.repository;

import com.portfolio.domain.dto.DocumentSearchResultDto;
import com.portfolio.exception.DocumentProcessingException;
import com.portfolio.service.DocumentLoaderService;
import com.portfolio.service.EmbeddingService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Markdown 문서를 읽어 청킹 후 인메모리 벡터 스토어에 저장
 */
@Slf4j
@Repository
public class InMemoryDocumentStore {

    private final DocumentLoaderService documentLoaderService;
    private final VectorStore vectorStore;

    public InMemoryDocumentStore(EmbeddingService embeddingService,
                                 DocumentLoaderService documentLoaderService) {
        this.documentLoaderService = documentLoaderService;
        this.vectorStore = SimpleVectorStore.builder(embeddingService.getEmbeddingModel()).build();
    }

    /**
     * 서버 시작 시 markdown 문서를 자동 적재
     */
    @PostConstruct
    public void init() {
        log.info("Markdown 문서 초기 적재 시작");

        try {
            addMarkdownDocument(
                    "projects-md",
                    "docs/projects.md",
                    Map.of(
                            "source", "projects.md",
                            "type", "markdown",
                            "category", "portfolio"
                    )
            );

            log.info("Markdown 문서 초기 적재 완료");
        } catch (Exception e) {
            log.error("Markdown 문서 초기 적재 실패", e);
            throw new DocumentProcessingException("초기 문서 적재 실패: " + e.getMessage(), e);
        }
    }

    /**
     * markdown 파일을 읽어 청킹 후 임베딩하여 저장
     */
    public void addMarkdownDocument(String id, String resourcePath, Map<String, Object> metadata) {
        log.debug("Markdown 문서 추가 시작 - ID: {}, resourcePath: {}", id, resourcePath);

        try {
            String fileText = documentLoaderService.readMarkdown(resourcePath);
            addDocument(id, fileText, metadata);
            log.info("Markdown 문서 추가 완료 - ID: {}", id);
        } catch (Exception e) {
            log.error("Markdown 문서 추가 실패 - ID: {}, resourcePath: {}", id, resourcePath, e);
            throw new DocumentProcessingException("Markdown 문서 처리 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 텍스트를 청킹 후 인메모리 벡터 스토어에 저장
     */
    public void addDocument(String id, String fileText, Map<String, Object> metadata) {
        log.debug("문서 추가 시작 - ID: {}, 내용 길이: {}", id, fileText.length());

        try {
            Map<String, Object> combinedMetadata = new HashMap<>(metadata);
            combinedMetadata.put("id", id);

            Document document = new Document(fileText, combinedMetadata);

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withChunkSize(512)
                    .withMinChunkSizeChars(200)
                    .withMinChunkLengthToEmbed(20)
                    .withMaxNumChunks(1000)
                    .withKeepSeparator(true)
                    .build();

            List<Document> chunks = splitter.split(document);

            log.debug("문서 청킹 완료 - ID: {}, 총 청크 수: {}", id, chunks.size());

            for (int i = 0; i < chunks.size(); i++) {
                Document chunk = chunks.get(i);
                chunk.getMetadata().put("chunkIndex", i);
                chunk.getMetadata().put("chunkSize", chunk.getText().length());
            }

            vectorStore.add(chunks);
            log.info("문서 저장 완료 - ID: {}, chunk 수: {}", id, chunks.size());

        } catch (Exception e) {
            log.error("문서 추가 실패 - ID: {}", id, e);
            throw new DocumentProcessingException("문서 임베딩 및 저장 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 질문과 유사한 문서 청크 검색
     */
    public List<DocumentSearchResultDto> similaritySearch(String query, int maxResults) {
        log.debug("유사도 검색 시작 - query: '{}', maxResults: {}", query, maxResults);

        try {
            SearchRequest request = SearchRequest.builder()
                    .query(query)
                    .topK(maxResults)
                    .build();

            List<Document> results = vectorStore.similaritySearch(request);
            if (results == null) {
                results = Collections.emptyList();
            }

            log.debug("유사도 검색 완료 - 결과 수: {}", results.size());

            return results.stream()
                    .map(result -> {
                        String docId = result.getMetadata().getOrDefault("id", "unknown").toString();

                        Map<String, Object> filteredMeta = result.getMetadata().entrySet().stream()
                                .filter(e -> !e.getKey().equals("id"))
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

                        double score = result.getScore() != null ? result.getScore() : 0.0;

                        return new DocumentSearchResultDto(
                                docId,
                                result.getText(),
                                filteredMeta,
                                score
                        );
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("유사도 검색 실패 - query: '{}'", query, e);
            throw new DocumentProcessingException("유사도 검색 중 오류 발생: " + e.getMessage(), e);
        }
    }
}