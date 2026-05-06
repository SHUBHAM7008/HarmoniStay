package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.senderId = :memberA AND m.recipientId = :memberB)
               OR (m.senderId = :memberB AND m.recipientId = :memberA)
            ORDER BY m.sentAt ASC
            """)
    List<ChatMessage> findConversation(@Param("memberA") String memberA, @Param("memberB") String memberB);

    List<ChatMessage> findByRecipientIdAndReadAtIsNullOrderBySentAtAsc(String recipientId);

    long countByRecipientIdAndReadAtIsNull(String recipientId);

    long countBySenderIdAndRecipientIdAndReadAtIsNull(String senderId, String recipientId);

    @Query("""
            SELECT m FROM ChatMessage m
            WHERE (m.senderId = :memberId OR m.recipientId = :memberId)
              AND m.sentAt = (
                  SELECT MAX(m2.sentAt) FROM ChatMessage m2
                  WHERE (m2.senderId = m.senderId AND m2.recipientId = m.recipientId)
                     OR (m2.senderId = m.recipientId AND m2.recipientId = m.senderId)
              )
            ORDER BY m.sentAt DESC
            """)
    List<ChatMessage> findLatestMessagesForMemberConversations(@Param("memberId") String memberId);

    @Modifying
    @Query("""
            UPDATE ChatMessage m
            SET m.readAt = :readAt
            WHERE m.senderId = :senderId
              AND m.recipientId = :recipientId
              AND m.readAt IS NULL
            """)
    int markConversationRead(
            @Param("senderId") String senderId,
            @Param("recipientId") String recipientId,
            @Param("readAt") Instant readAt
    );
}
