package com.portfolio.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAI API 설정
 */
@Configuration
public class OpenAiConfig {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiConfig.class);

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.base-url}")
    private String baseUrl;

    @Value("${spring.ai.openai.chat.completions-path:/chat/completions}")
    private String completionsPath;

    /**
     * OpenAI API 클라이언트 빈 등록
     *
     * 이 빈을 수동으로 만들기 때문에 Spring AI의 OpenAiConnectionProperties/
     * OpenAiChatProperties 자동구성이 적용되지 않는다. base-url을 명시적으로
     * 넣어주지 않으면 OpenAiApi.Builder 기본값인 https://api.openai.com으로
     * 요청이 나가버려서, Gemini용 키/엔드포인트 설정이 전부 무시된다.
     */
    @Bean
    public OpenAiApi openAiApi() {
        logger.debug("OpenAI API 클라이언트 초기화 - baseUrl: {}", baseUrl);
        return OpenAiApi.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .completionsPath(completionsPath)
                .build();
    }
}
