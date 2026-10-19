package com.portfolio.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final MarkdownDocumentReader markdownDocumentReader;

    // VectorStore(Qdrant)는 지연 초기화한다: Qdrant가 일시적으로 응답하지 않아도
    // 서버 기동 자체가 실패하지 않고, 실제로 이 빈을 쓰는 요청이 들어올 때만 연결을 시도한다.
    public DocumentIngestionService(@Lazy VectorStore vectorStore,
                                    MarkdownDocumentReader markdownDocumentReader) {
        this.vectorStore = vectorStore;
        this.markdownDocumentReader = markdownDocumentReader;
    }

    public IngestionResult ingestAll() throws IOException {
        List<Document> documents = markdownDocumentReader.readAll();

        long fileCount = documents.stream()
                .map(doc -> doc.getMetadata().get("source"))
                .distinct()
                .count();

        vectorStore.add(documents);

        return new IngestionResult((int) fileCount, documents.size());
    }

    /**
     * 적재 결과 요약 - 등록된 원본 파일 수와, 그 파일들이 쪼개진 청크(Document) 총 개수.
     */
    public record IngestionResult(int fileCount, int chunkCount) {
    }
}
