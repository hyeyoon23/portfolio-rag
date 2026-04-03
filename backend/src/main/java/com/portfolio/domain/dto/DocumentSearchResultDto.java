package com.portfolio.domain.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.ai.document.Document;

import java.util.Map;

@Schema(description = "문서 검색 결과")
public class DocumentSearchResultDto {

    @Schema(description = "문서 ID")
    private final String id;

    @Schema(description = "문서 내용")
    private final String content;

    @Schema(description = "유사도 점수")
    private final double score;

    @Schema(description = "문서 메타데이터")
    private final Map<String, Object> metadata;

    public DocumentSearchResultDto(String id, String content, double score, Map<String, Object> metadata) {
        this.id = id;
        this.content = content;
        this.score = score;
        this.metadata = metadata;
    }

    public String getId() { return id; }
    public String getContent() { return content; }
    public double getScore() { return score; }
    public Map<String, Object> getMetadata() { return metadata; }

    /**
     * Spring AI Document → DTO 변환 (핵심 ⭐)
     */
    public static DocumentSearchResultDto from(Document document, int index) {
        Map<String, Object> metadata = document.getMetadata() != null
                ? document.getMetadata()
                : Map.of();

        String id = String.valueOf(
                metadata.getOrDefault("id", "doc-" + index)
        );

        double score = extractScore(metadata);

        return new DocumentSearchResultDto(
                id,
                document.getText(),
                score,
                metadata
        );
    }

    /**
     * score 안전하게 추출
     */
    private static double extractScore(Map<String, Object> metadata) {
        Object scoreObj = metadata.get("score");

        if (scoreObj instanceof Number number) {
            return number.doubleValue();
        }

        if (scoreObj instanceof String str) {
            try {
                return Double.parseDouble(str);
            } catch (NumberFormatException ignored) {}
        }

        return 0.0;
    }

    /**
     * 응답용 DTO 변환
     */
    public DocumentResponseDto toDocumentResponseDto() {
        String truncated = content.length() > 500
                ? content.substring(0, 500) + "..."
                : content;

        return new DocumentResponseDto(id, score, truncated, metadata);
    }
}