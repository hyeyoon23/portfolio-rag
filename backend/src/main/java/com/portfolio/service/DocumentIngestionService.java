package com.portfolio.service;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final MarkdownDocumentReader markdownDocumentReader;

    public DocumentIngestionService(VectorStore vectorStore,
                                    MarkdownDocumentReader markdownDocumentReader) {
        this.vectorStore = vectorStore;
        this.markdownDocumentReader = markdownDocumentReader;
    }

    public int ingestAll() throws IOException {
        List<Document> documents = markdownDocumentReader.readAll();
        vectorStore.add(documents);
        return documents.size();
    }
}