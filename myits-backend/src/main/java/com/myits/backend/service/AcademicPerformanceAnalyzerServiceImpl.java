package com.myits.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myits.backend.dto.AcademicPerformanceCourseDto;
import com.myits.backend.dto.AcademicPerformanceRequestDto;
import com.myits.backend.dto.AcademicPerformanceResponseDto;
import com.myits.backend.exception.ApiException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AcademicPerformanceAnalyzerServiceImpl implements AcademicPerformanceAnalyzerService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${ai.performance.service.url:http://localhost:8001/analyze-performance}")
    private String aiPerformanceServiceUrl;

    public AcademicPerformanceAnalyzerServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public AcademicPerformanceResponseDto analyze(AcademicPerformanceRequestDto request) {
        validateInput(request);

        Map<String, Object> payload = new HashMap<>();
        payload.put("attendance", request.getAttendance());
        payload.put("activity", request.getActivity());
        payload.put("courses", toCoursePayload(request.getCourses()));

        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(aiPerformanceServiceUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiException("Performance analyzer AI service returned error: " + response.statusCode());
            }

            JsonNode jsonNode = objectMapper.readTree(response.body());
            return AcademicPerformanceResponseDto.builder()
                    .performanceLevel(jsonNode.path("performance_level").asText("UNKNOWN"))
                    .weakSubject(jsonNode.path("weak_subject").asText("No major weak subject"))
                    .recommendation(jsonNode.path("recommendation").asText("No recommendation available"))
                    .build();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException("Failed to call performance analyzer AI service: " + ex.getMessage());
        } catch (IOException ex) {
            throw new ApiException("Failed to call performance analyzer AI service: " + ex.getMessage());
        }
    }

    private List<Map<String, Object>> toCoursePayload(List<AcademicPerformanceCourseDto> courses) {
        return courses.stream()
                .map(course -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("course_name", course.getCourseName());
                    item.put("score", course.getScore());
                    return item;
                })
                .toList();
    }

    private void validateInput(AcademicPerformanceRequestDto request) {
        if (request == null) {
            throw new ApiException("Request is required");
        }
        if (request.getAttendance() == null || request.getAttendance() < 0 || request.getAttendance() > 100) {
            throw new ApiException("attendance must be between 0 and 100");
        }
        if (request.getActivity() == null || request.getActivity() < 0 || request.getActivity() > 100) {
            throw new ApiException("activity must be between 0 and 100");
        }
        if (request.getCourses() == null || request.getCourses().isEmpty()) {
            throw new ApiException("courses are required");
        }
        boolean invalidCourse = request.getCourses().stream()
                .anyMatch(course -> course.getCourseName() == null
                        || course.getCourseName().isBlank()
                        || course.getScore() == null
                        || course.getScore() < 0
                        || course.getScore() > 100);
        if (invalidCourse) {
            throw new ApiException("Each course requires courseName and score between 0 and 100");
        }
    }
}
