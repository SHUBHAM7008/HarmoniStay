package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.dto.ChatMessageRequest;
import com.example.HarmoniStay.Backend.model.ChatMessage;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.ChatMessageRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private ChatService chatService;

    @Test
    void saveMessageValidatesMembersAndPersistsTrimmedContent() {
        ChatMessageRequest request = new ChatMessageRequest();
        request.setSenderId("member-1");
        request.setRecipientId("member-2");
        request.setContent("  Hello there  ");

        when(memberRepository.findById("member-1")).thenReturn(Optional.of(new Member()));
        when(memberRepository.findById("member-2")).thenReturn(Optional.of(new Member()));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessage result = chatService.saveMessage(request);

        assertThat(result.getSenderId()).isEqualTo("member-1");
        assertThat(result.getRecipientId()).isEqualTo("member-2");
        assertThat(result.getContent()).isEqualTo("Hello there");
        assertThat(result.getSentAt()).isNotNull();
        verify(chatMessageRepository).save(any(ChatMessage.class));
    }

    @Test
    void saveMessageRejectsSelfChat() {
        ChatMessageRequest request = new ChatMessageRequest();
        request.setSenderId("member-1");
        request.setRecipientId("member-1");
        request.setContent("Hello");

        assertThatThrownBy(() -> chatService.saveMessage(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Sender and recipient must be different");
    }
}
