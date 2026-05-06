package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.dto.ChatMessageRequest;
import com.example.HarmoniStay.Backend.dto.ChatConversationSummary;
import com.example.HarmoniStay.Backend.model.ChatMessage;
import com.example.HarmoniStay.Backend.repository.ChatMessageRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MemberRepository memberRepository;

    public ChatService(ChatMessageRepository chatMessageRepository, MemberRepository memberRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.memberRepository = memberRepository;
    }

    public ChatMessage saveMessage(ChatMessageRequest request) {
        validateMessage(request);

        ChatMessage message = new ChatMessage();
        message.setSenderId(request.getSenderId().trim());
        message.setRecipientId(request.getRecipientId().trim());
        message.setContent(request.getContent().trim());
        message.setSentAt(Instant.now());
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getConversation(String memberA, String memberB) {
        if (!StringUtils.hasText(memberA) || !StringUtils.hasText(memberB)) {
            throw new IllegalArgumentException("Both member ids are required");
        }
        return chatMessageRepository.findConversation(memberA.trim(), memberB.trim());
    }

    public List<ChatMessage> getUnreadMessages(String memberId) {
        if (!StringUtils.hasText(memberId)) {
            throw new IllegalArgumentException("Member id is required");
        }
        return chatMessageRepository.findByRecipientIdAndReadAtIsNullOrderBySentAtAsc(memberId.trim());
    }

    public long countUnreadMessages(String memberId) {
        if (!StringUtils.hasText(memberId)) {
            return 0;
        }
        return chatMessageRepository.countByRecipientIdAndReadAtIsNull(memberId.trim());
    }

    public List<ChatConversationSummary> getConversationSummaries(String memberId) {
        if (!StringUtils.hasText(memberId)) {
            throw new IllegalArgumentException("Member id is required");
        }
        String currentMemberId = memberId.trim();
        List<ChatConversationSummary> summaries = new ArrayList<>();
        for (ChatMessage message : chatMessageRepository.findLatestMessagesForMemberConversations(currentMemberId)) {
            String otherMemberId = currentMemberId.equals(message.getSenderId())
                    ? message.getRecipientId()
                    : message.getSenderId();
            long unreadCount = chatMessageRepository.countBySenderIdAndRecipientIdAndReadAtIsNull(
                    otherMemberId,
                    currentMemberId
            );
            summaries.add(new ChatConversationSummary(
                    otherMemberId,
                    message.getContent(),
                    message.getSentAt(),
                    unreadCount
            ));
        }
        return summaries;
    }

    @Transactional
    public int markConversationRead(String currentMemberId, String otherMemberId) {
        if (!StringUtils.hasText(currentMemberId) || !StringUtils.hasText(otherMemberId)) {
            throw new IllegalArgumentException("Both member ids are required");
        }
        return chatMessageRepository.markConversationRead(
                otherMemberId.trim(),
                currentMemberId.trim(),
                Instant.now()
        );
    }

    private void validateMessage(ChatMessageRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Message body is required");
        }
        if (!StringUtils.hasText(request.getSenderId())) {
            throw new IllegalArgumentException("Sender id is required");
        }
        if (!StringUtils.hasText(request.getRecipientId())) {
            throw new IllegalArgumentException("Recipient id is required");
        }
        if (!StringUtils.hasText(request.getContent())) {
            throw new IllegalArgumentException("Message content is required");
        }
        if (request.getSenderId().trim().equals(request.getRecipientId().trim())) {
            throw new IllegalArgumentException("Sender and recipient must be different");
        }
        if (memberRepository.findById(request.getSenderId().trim()).isEmpty()) {
            throw new IllegalArgumentException("Sender member not found");
        }
        if (memberRepository.findById(request.getRecipientId().trim()).isEmpty()) {
            throw new IllegalArgumentException("Recipient member not found");
        }
    }
}
