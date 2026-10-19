package com.portfolio.config;

import com.portfolio.service.DocumentIngestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * DOCS_DIR 아래의 마크다운 문서를 Qdrant에 적재하는 1회성 로컬 배치.
 *
 * "ingest" 스프링 프로필이 켜져 있을 때만 이 빈이 등록되고 실행된다.
 * 배포 환경(Render 등)은 이 프로필을 쓰지 않으므로 이 러너는 절대 동작하지 않는다.
 *
 * 실행 방법:
 *   SPRING_PROFILES_ACTIVE=ingest DOCS_DIR=/path/to/docs ./gradlew bootRun
 */
@Slf4j
@Profile("ingest")
@Component
public class DocumentIngestionRunner implements CommandLineRunner {

    private final DocumentIngestionService documentIngestionService;

    public DocumentIngestionRunner(DocumentIngestionService documentIngestionService) {
        this.documentIngestionService = documentIngestionService;
    }

    @Override
    public void run(String... args) {
        try {
            DocumentIngestionService.IngestionResult result = documentIngestionService.ingestAll();
            log.info("문서 적재 완료: 파일 {}개, 청크 {}개", result.fileCount(), result.chunkCount());
            System.exit(0);
        } catch (IllegalStateException e) {
            // DOCS_DIR 미설정/빈 폴더, 채우지 않은 플레이스홀더 등 - 사용자가 바로 고칠 수 있는 입력 오류.
            log.error("문서 적재 중단: {}", e.getMessage());
            System.exit(1);
        } catch (Exception e) {
            log.error("문서 적재 실패", e);
            System.exit(1);
        }
    }
}
