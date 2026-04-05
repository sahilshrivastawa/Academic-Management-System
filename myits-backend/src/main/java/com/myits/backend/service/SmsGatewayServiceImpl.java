package com.myits.backend.service;

import com.myits.backend.exception.ApiException;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsGatewayServiceImpl implements SmsGatewayService {

    private final HttpClient httpClient;

    @Value("${otp.sms.provider:MOCK}")
    private String provider;

    @Value("${otp.sms.twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${otp.sms.twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${otp.sms.twilio.from-number:}")
    private String twilioFromNumber;

    public SmsGatewayServiceImpl() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public void sendOtpSms(String mobileNo, String otp) {
        String recipientNumber = normalizeRecipientNumber(mobileNo);
        String normalizedProvider = provider == null ? "MOCK" : provider.trim().toUpperCase();

        if ("TWILIO".equals(normalizedProvider)) {
            sendViaTwilio(recipientNumber, otp);
            return;
        }

        System.out.println("[MOCK-SMS] OTP for " + recipientNumber + " is " + otp);
    }

    private void sendViaTwilio(String mobileNo, String otp) {
        validateTwilioConfig();

        String message = "Your MyITS OTP is " + otp + ". It is valid for 5 minutes.";
        String twilioUrl = "https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json";

        String formBody = "To=" + encode(mobileNo)
                + "&From=" + encode(twilioFromNumber)
                + "&Body=" + encode(message);

        String basicAuth = Base64.getEncoder().encodeToString((twilioAccountSid + ":" + twilioAuthToken)
                .getBytes(StandardCharsets.UTF_8));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(twilioUrl))
                .timeout(Duration.ofSeconds(20))
                .header("Authorization", "Basic " + basicAuth)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException("Failed to send OTP via Twilio. Status: "
                        + response.statusCode() + ". " + extractTwilioError(response.body()));
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException("Failed to send OTP via Twilio: " + ex.getMessage());
        } catch (IOException ex) {
            throw new ApiException("Failed to send OTP via Twilio: " + ex.getMessage());
        }
    }

    private String extractTwilioError(String responseBody) {
        if (isBlank(responseBody)) {
            return "No response body from Twilio.";
        }

        String message = extractJsonField(responseBody, "message");
        String code = extractJsonField(responseBody, "code");

        if (!isBlank(message) && !isBlank(code)) {
            return "Twilio error " + code + ": " + message;
        }

        if (!isBlank(message)) {
            return "Twilio error: " + message;
        }

        String compact = responseBody.replaceAll("\\s+", " ").trim();
        return compact.length() > 240 ? compact.substring(0, 240) + "..." : compact;
    }

    private String extractJsonField(String json, String field) {
        String pattern = "\\\"" + field + "\\\"\\s*:\\s*(\\\"([^\\\"]*)\\\"|[0-9]+)";
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (!matcher.find()) {
            return null;
        }

        String quoted = matcher.group(2);
        if (quoted != null) {
            return quoted;
        }

        return matcher.group(1);
    }

    private void validateTwilioConfig() {
        if (isBlank(twilioAccountSid) || isBlank(twilioAuthToken) || isBlank(twilioFromNumber)) {
            throw new ApiException("Twilio SMS gateway is selected but configuration is missing");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizeRecipientNumber(String mobileNo) {
        if (isBlank(mobileNo)) {
            throw new ApiException("Mobile number is required to send OTP");
        }
        return mobileNo.trim().replace(" ", "").replace("-", "");
    }
}
