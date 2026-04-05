package com.myits.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myits.backend.dto.AttendancePredictionRequestDto;
import com.myits.backend.dto.AttendancePredictionResponseDto;
import com.myits.backend.exception.ApiException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AttendancePredictionServiceImpl implements AttendancePredictionService {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${ai.attendance.service.url:http://localhost:8001/predict-attendance}")
    private String aiAttendanceServiceUrl;

    public AttendancePredictionServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public AttendancePredictionResponseDto predictAttendance(AttendancePredictionRequestDto request) {
        validateInput(request);

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("past_attendance_list", request.getPastAttendanceList());

            String requestBody = objectMapper.writeValueAsString(payload);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(aiAttendanceServiceUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                throw new ApiException("Attendance AI service returned error: " + response.statusCode());
            }

            JsonNode jsonNode = objectMapper.readTree(response.body());
            return AttendancePredictionResponseDto.builder()
                    .predictedAttendance(jsonNode.path("predicted_attendance").asDouble())
                    .riskLevel(jsonNode.path("risk_level").asText("UNKNOWN"))
                    .aiWarning(jsonNode.path("ai_warning").asText("No warning available."))
                    .build();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException("Failed to call attendance AI service: " + ex.getMessage());
        } catch (IOException ex) {
            throw new ApiException("Failed to call attendance AI service: " + ex.getMessage());
        }
    }

    private void validateInput(AttendancePredictionRequestDto request) {
        if (request == null || request.getPastAttendanceList() == null || request.getPastAttendanceList().isEmpty()) {
            throw new ApiException("pastAttendanceList is required");
        }

        boolean hasOutOfRangeValue = request.getPastAttendanceList().stream()
                .anyMatch(value -> value == null || value < 0 || value > 100);

        if (hasOutOfRangeValue) {
            throw new ApiException("Attendance values must be between 0 and 100");
        }
    }
}
