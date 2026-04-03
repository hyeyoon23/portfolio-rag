package com.portfolio.service;

import jakarta.annotation.PostConstruct;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentInitService {

    private final VectorStore vectorStore;

    public DocumentInitService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @PostConstruct
    public void init() {
        vectorStore.add(List.of(
                new Document("혜윤은 React, TypeScript 기반 프론트엔드 개발자이다."),
                new Document("Devine 프로젝트에서 React Query와 Clerk를 사용했다.")
        ));
    }
}