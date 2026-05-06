package com.example.HarmoniStay.Backend.websocket;

import com.example.HarmoniStay.Backend.dto.ChatMessageRequest;
import com.example.HarmoniStay.Backend.model.ChatMessage;
import com.example.HarmoniStay.Backend.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper;
    private final Map<String, WebSocketSession> sessionsByMemberId = new ConcurrentHashMap<>();

    public ChatWebSocketHandler(ChatService chatService, ObjectMapper objectMapper) {
        this.chatService = chatService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String memberId = resolveMemberId(session.getUri());
        if (memberId == null || memberId.isBlank()) {
            session.close(CloseStatus.BAD_DATA.withReason("memberId query parameter is required"));
            return;
        }
        session.getAttributes().put("memberId", memberId);
        sessionsByMemberId.put(memberId, session);
        sendToSession(session, Map.of("type", "CONNECTED", "memberId", memberId));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        ChatMessageRequest request = objectMapper.readValue(textMessage.getPayload(), ChatMessageRequest.class);
        Object sessionMemberId = session.getAttributes().get("memberId");
        if (sessionMemberId != null) {
            request.setSenderId(sessionMemberId.toString());
        }

        ChatMessage saved = chatService.saveMessage(request);
        Map<String, Object> event = Map.of("type", "MESSAGE", "message", saved);

        sendToSession(session, event);
        WebSocketSession recipientSession = sessionsByMemberId.get(saved.getRecipientId());
        if (recipientSession != null && recipientSession.isOpen()) {
            sendToSession(recipientSession, event);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Object memberId = session.getAttributes().get("memberId");
        if (memberId != null) {
            sessionsByMemberId.remove(memberId.toString(), session);
        }
    }

    private void sendToSession(WebSocketSession session, Object payload) throws IOException {
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
        }
    }

    private String resolveMemberId(URI uri) {
        if (uri == null) {
            return null;
        }
        return UriComponentsBuilder.fromUri(uri)
                .build()
                .getQueryParams()
                .getFirst("memberId");
    }
}
