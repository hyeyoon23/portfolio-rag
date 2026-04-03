package com.portfolio.config;

import com.portfolio.service.DocumentIngestionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class DocumentIngestionRunner implements CommandLineRunner {

    private final DocumentIngestionService documentIngestionService;
    private final Environment environment;

    public DocumentIngestionRunner(DocumentIngestionService documentIngestionService,
                                   Environment environment) {
        this.documentIngestionService = documentIngestionService;
        this.environment = environment;
    }

    @Override
    public void run(String... args) throws Exception {
        String ingestEnabled = environment.getProperty("app.ingest.enabled", "false");

        if (!Boolean.parseBoolean(ingestEnabled)) {
            return;
        }

        int count = documentIngestionService.ingestAll();
        System.out.println("문서 적재 완료: " + count + "건");

        System.exit(0);
    }
}