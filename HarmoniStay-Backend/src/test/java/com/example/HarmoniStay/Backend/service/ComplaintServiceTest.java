package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Complaint;
import com.example.HarmoniStay.Backend.repository.ComplaintRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {

    @Mock
    private ComplaintRepository complaintRepository;

    @InjectMocks
    private ComplaintService complaintService;

    @Test
    void createComplaintSetsPendingStatusAndTimestamps() {
        Complaint complaint = new Complaint();
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Complaint result = complaintService.createComplaint(complaint);

        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getCreatedAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
        verify(complaintRepository).save(complaint);
    }

    @Test
    void updateStatusSavesAdminFeedbackWhenProvided() {
        Complaint complaint = new Complaint();
        complaint.setStatus("PENDING");
        when(complaintRepository.findById("complaint-1")).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Complaint result = complaintService.updateStatus("complaint-1", "RESOLVED", "Fixed");

        assertThat(result.getStatus()).isEqualTo("RESOLVED");
        assertThat(result.getAdminFeedback()).isEqualTo("Fixed");
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    void submitMemberFeedbackTrimsDescriptionAndSavesRating() {
        Complaint complaint = new Complaint();
        complaint.setUserId("member-1");
        when(complaintRepository.findById("complaint-1")).thenReturn(Optional.of(complaint));
        when(complaintRepository.save(any(Complaint.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Complaint result = complaintService.submitMemberFeedback("complaint-1", "member-1", 5, "  Great work  ");

        assertThat(result.getMemberFeedbackRating()).isEqualTo(5);
        assertThat(result.getMemberFeedbackDescription()).isEqualTo("Great work");
        assertThat(result.getMemberFeedbackAt()).isNotNull();
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    void submitMemberFeedbackRejectsDifferentUser() {
        Complaint complaint = new Complaint();
        complaint.setUserId("member-1");
        when(complaintRepository.findById("complaint-1")).thenReturn(Optional.of(complaint));

        assertThatThrownBy(() -> complaintService.submitMemberFeedback("complaint-1", "member-2", 4, "Thanks"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("You are not allowed to give feedback for this complaint");

        verify(complaintRepository, never()).save(any());
    }

    @Test
    void submitMemberFeedbackRejectsRatingOutsideOneToFive() {
        Complaint complaint = new Complaint();
        complaint.setUserId("member-1");
        when(complaintRepository.findById("complaint-1")).thenReturn(Optional.of(complaint));

        assertThatThrownBy(() -> complaintService.submitMemberFeedback("complaint-1", "member-1", 6, "Thanks"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Rating must be between 1 and 5");

        verify(complaintRepository, never()).save(any());
    }

    @Test
    void deleteComplaintDelegatesToRepository() {
        complaintService.deleteComplaint("complaint-1");

        ArgumentCaptor<String> idCaptor = ArgumentCaptor.forClass(String.class);
        verify(complaintRepository).deleteById(idCaptor.capture());
        assertThat(idCaptor.getValue()).isEqualTo("complaint-1");
    }
}
