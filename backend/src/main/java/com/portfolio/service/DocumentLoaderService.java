package com.portfolio.service;

import com.portfolio.exception.DocumentProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
public class DocumentLoaderService {

    public String readMarkdown(String resourcePath) {
        log.debug("Markdown 파일 읽기 시작: {}", resourcePath);

        ClassPathResource resource = new ClassPathResource(resourcePath);

        try (InputStream inputStream = resource.getInputStream()) {
            String content = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
            log.debug("Markdown 파일 읽기 완료 - 길이: {}", content.length());
            return content;
        } catch (IOException e) {
            log.error("Markdown 파일 읽기 실패: {}", resourcePath, e);
            throw new DocumentProcessingException("Markdown 파일 읽기 실패: " + e.getMessage(), e);
        }
    }
}