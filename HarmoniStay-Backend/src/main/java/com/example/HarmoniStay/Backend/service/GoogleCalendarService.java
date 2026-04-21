package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Meeting;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final Logger log = LoggerFactory.getLogger(GoogleCalendarService.class);
    private static final String GOOGLE_CALENDAR_EVENTS_API = "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;
    private final GoogleAuthService googleAuthService;

    public GoogleCalendarService(ObjectMapper objectMapper, GoogleAuthService googleAuthService) {
        this.objectMapper = objectMapper;
        this.googleAuthService = googleAuthService;
    }

    public String createMeetLink() {
        return createMeetLink(null);
    }

    public String createMeetLink(Meeting meeting) {
        String accessToken = googleAuthService.getValidAccessToken();

        Date startDate = meeting != null && meeting.getScheduledDate() != null
                ? meeting.getScheduledDate()
                : new Date();
        Date endDate = new Date(startDate.getTime() + 60L * 60L * 1000L);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("summary", meeting != null && StringUtils.hasText(meeting.getTitle())
                ? meeting.getTitle()
                : "HarmonyStay Meeting");
        payload.put("description", meeting != null ? meeting.getDescription() : null);

        Map<String, Object> start = new LinkedHashMap<>();
        start.put("dateTime", toIso(startDate));
        start.put("timeZone", "Asia/Kolkata");
        payload.put("start", start);

        Map<String, Object> end = new LinkedHashMap<>();
        end.put("dateTime", toIso(endDate));
        end.put("timeZone", "Asia/Kolkata");
        payload.put("end", end);

        Map<String, Object> conferenceData = new LinkedHashMap<>();
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("requestId", UUID.randomUUID().toString());
        Map<String, Object> key = new LinkedHashMap<>();
        key.put("type", "hangoutsMeet");
        request.put("conferenceSolutionKey", key);
        conferenceData.put("createRequest", request);
        payload.put("conferenceData", conferenceData);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    GOOGLE_CALENDAR_EVENTS_API,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode entryPoints = root.path("conferenceData").path("entryPoints");
            if (entryPoints.isArray() && !entryPoints.isEmpty()) {
                String uri = entryPoints.get(0).path("uri").asText(null);
                if (StringUtils.hasText(uri)) {
                    return uri;
                }
            }

            log.warn("Google Calendar event created but Meet URI missing in response");
            return null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Google Meet link", e);
        }
    }

    private String toIso(Date date) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Kolkata"));
        return sdf.format(date);
    }
}
