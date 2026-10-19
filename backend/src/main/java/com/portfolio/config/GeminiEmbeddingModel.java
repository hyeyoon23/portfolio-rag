package com.portfolio.config;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Primary
@Component
public class GeminiEmbeddingModel implements EmbeddingModel {

    private static final int MAX_BATCH = 100;

    private final RestClient restClient = RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
    private final String apiKey;
    private final String model;
    private final int dimensions;

    public GeminiEmbeddingModel(
            @Value("${GEMINI_API_KEY}") String apiKey,
            @Value("${gemini.embedding.model:gemini-embedding-001}") String model,
            @Value("${gemini.embedding.dimensions:768}") int dimensions) {
        this.apiKey = apiKey;
        this.model = model;
        this.dimensions = dimensions;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> inputs = request.getInstructions();
        List<Embedding> embeddings = new ArrayList<>();

        for (int start = 0; start < inputs.size(); start += MAX_BATCH) {
            List<String> batch = inputs.subList(start, Math.min(start + MAX_BATCH, inputs.size()));

            List<Map<String, Object>> requests = batch.stream()
                    .map(text -> Map.<String, Object>of(
                            "model", "models/" + model,
                            "content", Map.of("parts", List.of(Map.of("text", text))),
                            "outputDimensionality", dimensions))
                    .toList();

            JsonNode response = restClient.post()
                    .uri("/models/{model}:batchEmbedContents", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("requests", requests))
                    .retrieve()
                    .body(JsonNode.class);

            for (JsonNode item : response.get("embeddings")) {
                JsonNode values = item.get("values");
                float[] vector = new float[values.size()];
                for (int i = 0; i < vector.length; i++) {
                    vector[i] = (float) values.get(i).asDouble();
                }
                embeddings.add(new Embedding(vector, embeddings.size()));
            }
        }
        return new EmbeddingResponse(embeddings);
    }

    @Override
    public float[] embed(Document document) {
        return embed(document.getText());
    }

    @Override
    public int dimensions() {
        return dimensions;
    }
}