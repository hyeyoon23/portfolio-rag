package com.portfolio.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * DOCS_DIR(환경변수) 아래의 모든 .md 파일(하위 폴더 포함)을 읽어
 * "## " 소제목 단위로 청크를 나눠 Document 목록으로 변환한다.
 *
 * 청크 분할 규칙:
 *  - 문서 제목은 첫 번째 "# " 줄(H1)에서 가져온다. 없으면 파일명을 제목으로 쓴다.
 *  - "## "(H2)로 시작하는 줄마다 새 섹션을 연다. 첫 H2가 나오기 전의 내용은
 *    "개요" 섹션으로 취급한다(내용이 없으면 버린다).
 *  - 코드 펜스(``` 또는 ~~~) 안에서는 #으로 시작하는 줄이 있어도 헤더로 보지 않는다.
 *  - 섹션 본문이 2000자를 넘으면 글자 수가 아니라 빈 줄(문단 경계)에서만 나눠
 *    여러 청크로 쪼갠다. 문단 하나가 그 자체로 2000자를 넘으면 그대로 둔다
 *    (문단 중간은 절대 자르지 않는다).
 *  - 각 청크 맨 앞에 "[문서 제목 > 소제목]" 줄을 붙여, 청크 하나만 검색돼도
 *    어느 문서/섹션 이야기인지 알 수 있게 한다.
 *
 * 등록 전에 전체 파일을 먼저 읽어 "[채우기" 플레이스홀더가 남아있는지부터
 * 검사한다. 하나라도 있으면 어떤 벡터스토어 쓰기도 하지 않고 즉시 실패한다.
 */
@Slf4j
@Service
public class MarkdownDocumentReader {

    private static final int MAX_CHUNK_CHARS = 2000;
    private static final String PLACEHOLDER_MARKER = "[채우기";
    private static final String OVERVIEW_SECTION = "개요";

    private final String docsDirProperty;

    public MarkdownDocumentReader(@Value("${DOCS_DIR:}") String docsDirProperty) {
        this.docsDirProperty = docsDirProperty;
    }

    public List<Document> readAll() throws IOException {
        Path docsDir = resolveDocsDir();
        List<Path> mdFiles = findMarkdownFiles(docsDir);

        if (mdFiles.isEmpty()) {
            throw new IllegalStateException("DOCS_DIR 안에 .md 파일이 없습니다: " + docsDir);
        }

        // 먼저 전체 파일을 다 읽어두고, 전부 검사를 통과한 뒤에만 청크 분할로 넘어간다.
        // (한 파일이라도 플레이스홀더가 남아 있으면 아무것도 등록하지 않는다.)
        Map<Path, String> fileContents = new LinkedHashMap<>();
        for (Path path : mdFiles) {
            String raw = Files.readString(path, StandardCharsets.UTF_8);
            fileContents.put(path, normalizeLineEndings(raw));
        }

        validateNoPlaceholders(docsDir, fileContents);

        List<Document> documents = new ArrayList<>();
        for (Map.Entry<Path, String> entry : fileContents.entrySet()) {
            String relativeSource = docsDir.relativize(entry.getKey()).toString().replace('\\', '/');
            documents.addAll(chunkFile(relativeSource, entry.getValue()));
        }

        log.info("마크다운 적재 준비 완료: 파일 {}개, 청크 {}개", mdFiles.size(), documents.size());
        return documents;
    }

    private Path resolveDocsDir() {
        if (docsDirProperty == null || docsDirProperty.isBlank()) {
            throw new IllegalStateException(
                    "DOCS_DIR 환경변수가 설정되지 않았습니다. 예) "
                            + "SPRING_PROFILES_ACTIVE=ingest DOCS_DIR=/path/to/docs ./gradlew bootRun");
        }

        Path docsDir = Path.of(docsDirProperty).toAbsolutePath().normalize();
        if (!Files.isDirectory(docsDir)) {
            throw new IllegalStateException("DOCS_DIR 경로가 존재하지 않거나 디렉터리가 아닙니다: " + docsDir);
        }
        return docsDir;
    }

    private List<Path> findMarkdownFiles(Path docsDir) throws IOException {
        try (Stream<Path> walk = Files.walk(docsDir)) {
            return walk.filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase(Locale.ROOT).endsWith(".md"))
                    .sorted()
                    .collect(Collectors.toList());
        }
    }

    private void validateNoPlaceholders(Path docsDir, Map<Path, String> fileContents) {
        List<String> violations = new ArrayList<>();

        for (Map.Entry<Path, String> entry : fileContents.entrySet()) {
            String relativeSource = docsDir.relativize(entry.getKey()).toString().replace('\\', '/');
            String[] lines = entry.getValue().split("\n", -1);

            for (int i = 0; i < lines.length; i++) {
                if (lines[i].contains(PLACEHOLDER_MARKER)) {
                    violations.add(relativeSource + ":" + (i + 1));
                }
            }
        }

        if (!violations.isEmpty()) {
            String detail = String.join("\n  - ", violations);
            throw new IllegalStateException(
                    "다음 위치에 아직 채우지 않은 내용(\"" + PLACEHOLDER_MARKER + "\")이 남아 있어 등록을 중단합니다:\n  - "
                            + detail);
        }
    }

    private String normalizeLineEndings(String text) {
        return text.replace("\r\n", "\n").replace("\r", "\n");
    }

    private List<Document> chunkFile(String relativeSource, String content) {
        String[] rawLines = content.split("\n", -1);

        String title = extractTitle(rawLines, relativeSource);
        List<Section> sections = splitIntoSections(rawLines);

        List<Document> documents = new ArrayList<>();
        int chunkIndex = 0;

        for (Section section : sections) {
            String body = String.join("\n", section.bodyLines).strip();
            if (body.isEmpty()) {
                continue;
            }

            for (String part : splitByParagraphBoundary(body)) {
                String prefixedContent = "[" + title + " > " + section.heading + "]\n\n" + part;
                String idSeed = relativeSource + "" + section.heading + "" + chunkIndex;
                String id = UUID.nameUUIDFromBytes(idSeed.getBytes(StandardCharsets.UTF_8)).toString();

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("source", relativeSource);
                metadata.put("section", section.heading);
                metadata.put("chunkIndex", chunkIndex);

                documents.add(Document.builder()
                        .id(id)
                        .text(prefixedContent)
                        .metadata(metadata)
                        .build());

                chunkIndex++;
            }
        }

        return documents;
    }

    private String extractTitle(String[] lines, String relativeSource) {
        boolean inFence = false;
        for (String line : lines) {
            String t = line.strip();
            if (isFenceLine(t)) {
                inFence = !inFence;
                continue;
            }
            if (inFence) {
                continue;
            }
            if (t.startsWith("# ") && !t.startsWith("##")) {
                return stripTrailingHashes(t.substring(2).strip());
            }
        }

        String fileName = relativeSource.substring(relativeSource.lastIndexOf('/') + 1);
        return fileName.toLowerCase(Locale.ROOT).endsWith(".md")
                ? fileName.substring(0, fileName.length() - 3)
                : fileName;
    }

    private List<Section> splitIntoSections(String[] lines) {
        List<Section> sections = new ArrayList<>();
        Section current = new Section(OVERVIEW_SECTION, new ArrayList<>());
        boolean inFence = false;

        for (String line : lines) {
            String t = line.strip();

            if (isFenceLine(t)) {
                inFence = !inFence;
                current.bodyLines.add(line);
                continue;
            }

            if (!inFence && t.startsWith("## ") && !t.startsWith("###")) {
                sections.add(current);
                String heading = stripTrailingHashes(t.substring(3).strip());
                current = new Section(heading, new ArrayList<>());
                continue;
            }

            if (!inFence && t.startsWith("# ") && !t.startsWith("##")) {
                // 문서 제목 줄은 섹션 본문에 포함하지 않는다 (extractTitle에서 이미 사용).
                continue;
            }

            current.bodyLines.add(line);
        }
        sections.add(current);

        return sections;
    }

    private boolean isFenceLine(String trimmedLine) {
        return trimmedLine.startsWith("```") || trimmedLine.startsWith("~~~");
    }

    private String stripTrailingHashes(String heading) {
        return heading.replaceAll("\\s*#+\\s*$", "");
    }

    private List<String> splitByParagraphBoundary(String body) {
        if (body.length() <= MAX_CHUNK_CHARS) {
            return List.of(body);
        }

        String[] paragraphs = body.split("\n\\s*\n+");
        List<String> chunks = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        for (String paragraph : paragraphs) {
            int candidateLen = current.isEmpty()
                    ? paragraph.length()
                    : current.length() + 2 + paragraph.length();

            if (!current.isEmpty() && candidateLen > MAX_CHUNK_CHARS) {
                chunks.add(current.toString());
                current = new StringBuilder(paragraph);
            } else {
                if (!current.isEmpty()) {
                    current.append("\n\n");
                }
                current.append(paragraph);
            }
        }

        if (!current.isEmpty()) {
            chunks.add(current.toString());
        }

        return chunks;
    }

    private static final class Section {
        private final String heading;
        private final List<String> bodyLines;

        private Section(String heading, List<String> bodyLines) {
            this.heading = heading;
            this.bodyLines = bodyLines;
        }
    }
}
