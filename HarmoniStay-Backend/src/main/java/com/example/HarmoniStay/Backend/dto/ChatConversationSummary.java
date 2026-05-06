package com.example.HarmoniStay.Backend.dto;

import java.time.Instant;

public class ChatConversationSummary {
    private String otherMemberId;
    private String lastMessage;
    private Instant lastMessageAt;
    private long unreadCount;

    public ChatConversationSummary(String otherMemberId, String lastMessage, Instant lastMessageAt, long unreadCount) {
        this.otherMemberId = otherMemberId;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
    }

    public String getOtherMemberId() { return otherMemberId; }
    public void setOtherMemberId(String otherMemberId) { this.otherMemberId = otherMemberId; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public Instant getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
}
