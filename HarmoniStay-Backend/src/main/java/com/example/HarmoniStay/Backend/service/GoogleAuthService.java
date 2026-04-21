package com.example.HarmoniStay.Backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

    @Value("${google.client.id:}")
    private String clientId;

    @Value("${google.client.secret:}")
    private String clientSecret;

    @Value("${google.redirect.uri:http://localhost:8888/oauth2/callback}")
    private String redirectUri;

    @Value("${google.calendar.access-token:}")
    private String configuredAccessToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    private String latestAccessToken;
    private String latestRefreshToken;
    private Long latestExpiresIn;
    private Instant latestUpdatedAt;

    public GoogleAuthService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String buildAuthorizationUrl() {
        validateOAuthConfig();
        return UriComponentsBuilder.fromHttpUrl(GOOGLE_AUTH_URL)
                .queryParam("client_id", clientId.trim())
                .queryParam("redirect_uri", redirectUri.trim())
                .queryParam("response_type", "code")
                .queryParam("scope", CALENDAR_SCOPE)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .toUriString();
    }

    public String getAccessToken(String code) {
        validateOAuthConfig();
        if (!StringUtils.hasText(code)) {
            throw new IllegalArgumentException("Authorization code is required");
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", clientId.trim());
        form.add("client_secret", clientSecret.trim());
        // Important: redirect_uri must exactly match the URI used in authorization request.
        form.add("redirect_uri", redirectUri.trim());
        // Important: authorization code can be exchanged only once by Google OAuth.
        form.add("grant_type", "authorization_code");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    GOOGLE_TOKEN_URL,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            String body = response.getBody();
            if (!StringUtils.hasText(body)) {
                log.error("Google token response body is null/empty");
                throw new IllegalStateException("Google token response is empty");
            }

            log.info("Google token response body: {}", body);
            JsonNode json = objectMapper.readTree(body);
            String accessToken = json.path("access_token").asText(null);
            String refreshToken = json.path("refresh_token").asText(null);
            long expiresIn = json.path("expires_in").asLong(0);

            if (!StringUtils.hasText(accessToken)) {
                log.error("Google token response missing access_token. Full body: {}", body);
                throw new IllegalStateException("Google token response missing access_token");
            }

            latestAccessToken = accessToken;
            latestRefreshToken = StringUtils.hasText(refreshToken) ? refreshToken : latestRefreshToken;
            latestExpiresIn = expiresIn;
            latestUpdatedAt = Instant.now();

            log.info("Google tokens parsed. expires_in={}, refresh_token_present={}",
                    latestExpiresIn, StringUtils.hasText(latestRefreshToken));
            return accessToken;
        } catch (HttpStatusCodeException e) {
            String errorBody = e.getResponseBodyAsString();
            log.error("Google token exchange failed. status={}, body={}", e.getStatusCode(), errorBody);
            if (errorBody != null && errorBody.contains("invalid_grant")) {
                throw new IllegalStateException("Google returned invalid_grant. The code may be expired, reused, or redirect_uri mismatch.");
            }
            throw new RuntimeException("Failed to exchange authorization code for token", e);
        } catch (Exception e) {
            log.error("Unexpected error during token exchange: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to exchange authorization code for token", e);
        }
    }

    public String getLatestAccessToken() {
        return latestAccessToken;
    }

    /**
     * Returns access token from memory/config only.
     * Refresh-token flow is intentionally disabled for now.
     */
    public synchronized String getValidAccessToken() {
        if (StringUtils.hasText(latestAccessToken) && isMemoryTokenValid()) {
            return latestAccessToken;
        }
        if (StringUtils.hasText(configuredAccessToken)) {
            latestAccessToken = configuredAccessToken.trim();
            // Unknown expiry from config; keep reusing configured token.
            latestUpdatedAt = Instant.now();
            latestExpiresIn = 3600L;
            return latestAccessToken;
        }
        throw new IllegalStateException("Google access token missing. Set google.calendar.access-token in application-local.properties");
    }

    private boolean isMemoryTokenValid() {
        if (latestUpdatedAt == null || latestExpiresIn == null || latestExpiresIn <= 0) {
            return false;
        }
        long elapsed = Instant.now().getEpochSecond() - latestUpdatedAt.getEpochSecond();
        return elapsed < Math.max(30, latestExpiresIn - 60);
    }

    private void validateOAuthConfig() {
        if (!StringUtils.hasText(clientId) || !StringUtils.hasText(clientSecret) || !StringUtils.hasText(redirectUri)) {
            throw new IllegalStateException("Google OAuth configuration missing (clientId/clientSecret/redirectUri)");
        }
    }
}
