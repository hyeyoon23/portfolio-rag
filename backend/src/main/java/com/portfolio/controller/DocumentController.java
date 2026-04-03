package com.portfolio.controller;

import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.ai.document.Document;
import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final VectorStore vectorStore;

    public DocumentController(VectorStore vectorStore) {
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