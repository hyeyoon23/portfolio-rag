package com.portfolio.service;

import org.springframework.ai.document.Document;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class MarkdownDocumentReader {

    public List<Document> readAll() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:docs/*.md");

        List<Document> documents = new ArrayList<>();

        for (Resource resource : resources) {
            String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

            documents.add(new Document(
                    content,
                    Map.of("source", resource.getFilename())
            ));
        }

        return documents;
    }
}