package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.dto.ChatMessageRequest;
import com.example.HarmoniStay.Backend.dto.ChatConversationSummary;
import com.example.HarmoniStay.Backend.model.ChatMessage;
import com.example.HarmoniStay.Backend.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/messages")
    public ChatMessage sendMessage(@RequestBody ChatMessageRequest request) {
        return chatService.saveMessage(request);
    }

    @GetMapping("/messages")
    public List<ChatMessage> getConversation(
            @RequestParam String memberA,
            @RequestParam String memberB
    ) {
        return chatService.getConversation(memberA, memberB);
    }

    @GetMapping("/unread/{memberId}")
    public List<ChatMessage> getUnreadMessages(@PathVariable String memberId) {
        return chatService.getUnreadMessages(memberId);
    }

    @GetMapping("/conversations/{memberId}")
    public List<ChatConversationSummary> getConversationSummaries(@PathVariable String memberId) {
        return chatService.getConversationSummaries(memberId);
    }

    @GetMapping("/unread/{memberId}/count")
    public Map<String, Long> getUnreadCount(@PathVariable String memberId) {
        return Map.of("count", chatService.countUnreadMessages(memberId));
    }

    @PutMapping("/read")
    public Map<String, Integer> markConversationRead(
            @RequestParam String currentMemberId,
            @RequestParam String otherMemberId
    ) {
        return Map.of("updated", chatService.markConversationRead(currentMemberId, otherMemberId));
    }
}
