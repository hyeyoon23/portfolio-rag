package com.portfolio.controller;

import com.portfolio.domain.dto.*;
import com.portfolio.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * RAG API 컨트롤러
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/rag")
@Tag(name = "RAG API", description = "Retrieval-Augmented Generation 기능을 위한 API")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @Operation(summary = "RAG 질의 수행",
            description = "사용자 질문에 대해 관련 문서를 검색하고 RAG 기반 응답을 생성합니다.")
    @ApiResponse(responseCode = "200", description = "질의 성공",
            content = @Content(schema = @Schema(implementation = ApiResponseDto.class)))
    @ApiResponse(responseCode = "400", description = "잘못된 요청")
    @ApiResponse(responseCode = "500", description = "서버 오류")
    @PostMapping("/query")
    public ResponseEntity<ApiResponseDto<QueryResponseDto>> queryWithRag(
            @RequestBody QueryRequestDto request) {

        if (request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponseDto.failure("질의가 비어있습니다."));
        }

        try {
            QueryResponseDto response = ragService.ask(
                    request.getQuery(),
                    request.getMaxResults(),
                    request.getModel()
            );

            return ResponseEntity.ok(ApiResponseDto.success(response));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.failure("질의 처리 중 오류: " + e.getMessage()));
        }
    }
}
