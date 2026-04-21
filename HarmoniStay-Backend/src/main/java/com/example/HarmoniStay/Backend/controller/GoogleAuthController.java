package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.service.GoogleAuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:8888/oauth2/callback")
public class GoogleAuthController {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthController.class);

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/auth/google")
    public ResponseEntity<Void> authGoogle() {
        String authUrl = googleAuthService.buildAuthorizationUrl();
        return ResponseEntity.status(302).location(URI.create(authUrl)).build();
    }

    @GetMapping("/oauth2/callback")
    public ResponseEntity<Map<String, String>> oauth2Callback(@RequestParam("code") String code) {
        String accessToken = googleAuthService.getAccessToken(code);
        log.info("Google OAuth access token: {}", accessToken);
        return ResponseEntity.ok(Map.of(
                "message", "Google OAuth successful",
                "access_token", accessToken
        ));
    }
}
