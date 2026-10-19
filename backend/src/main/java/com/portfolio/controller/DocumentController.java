package com.portfolio.controller;

import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Lazy;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.ai.document.Document;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final VectorStore vectorStore;

    // VectorStore(Qdrant)는 지연 초기화한다: Qdrant가 일시적으로 응답하지 않아도
    // 서버 기동 자체가 실패하지 않고, 실제로 이 빈을 쓰는 요청이 들어올 때만 연결을 시도한다.
    public DocumentController(@Lazy VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @PostMapping
    public String addDocs() {
        vectorStore.add(List.of(
                new Document("테스트 문서입니다.")
        ));
        return "OK";
    }
}