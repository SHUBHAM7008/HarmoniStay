package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.FlatOwnershipHistory;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillCollectionRepository;
import com.example.HarmoniStay.Backend.repository.FlatOwnershipHistoryRepository;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlatServiceTest {

    @Mock
    private FlatRepository flatRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private FlatOwnershipHistoryRepository flatOwnershipHistoryRepository;

    @Mock
    private BillCollectionRepository billCollectionRepository;

    @InjectMocks
    private FlatService flatService;

    @Test
    void assignFlatToMemberClosesPreviousHistoryAndCreatesTransferRecord() throws Exception {
        Member previousOwner = new Member();
        previousOwner.setId("previous-owner");
        previousOwner.setFlatId("A-101");

        Member newOwner = new Member();
        newOwner.setId("new-owner");

        Flat flat = new Flat();
        flat.setId("flat-1");
        flat.setFlatNumber("A-101");
        flat.setOwner(previousOwner);

        FlatOwnershipHistory activeHistory = new FlatOwnershipHistory();
        activeHistory.setFlat(flat);
        activeHistory.setMember(previousOwner);
        activeHistory.setFirstDay(LocalDate.now().minusMonths(1));

        when(flatRepository.findById("flat-1")).thenReturn(Optional.of(flat));
        when(memberRepository.findById("new-owner")).thenReturn(Optional.of(newOwner));
        when(flatRepository.findByOwnerId("new-owner")).thenReturn(Optional.empty());
        when(flatOwnershipHistoryRepository.findFirstByFlatIdAndLastDayIsNullOrderByFirstDayDesc("flat-1"))
                .thenReturn(Optional.of(activeHistory));
        when(flatRepository.save(any(Flat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(flatOwnershipHistoryRepository.save(any(FlatOwnershipHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Flat result = flatService.assignFlatToMember("flat-1", "new-owner");

        assertThat(result.getOwner()).isSameAs(newOwner);
        assertThat(result.getStatus()).isEqualTo(Flat.Status.OCCUPIED);
        assertThat(previousOwner.getFlatId()).isNull();
        assertThat(newOwner.getFlatId()).isEqualTo("A-101");
        assertThat(activeHistory.getLastDay()).isEqualTo(LocalDate.now());

        ArgumentCaptor<FlatOwnershipHistory> historyCaptor = ArgumentCaptor.forClass(FlatOwnershipHistory.class);
        verify(flatOwnershipHistoryRepository, atLeastOnce()).save(historyCaptor.capture());
        List<FlatOwnershipHistory> savedHistories = historyCaptor.getAllValues();
        FlatOwnershipHistory newHistory = savedHistories.get(savedHistories.size() - 1);

        assertThat(newHistory.getFlat()).isSameAs(flat);
        assertThat(newHistory.getMember()).isSameAs(newOwner);
        assertThat(newHistory.getPreviousOwnerId()).isEqualTo("previous-owner");
        assertThat(newHistory.getNewOwnerId()).isEqualTo("new-owner");
        assertThat(newHistory.getTransferDate()).isEqualTo(LocalDate.now());
        assertThat(newHistory.getFirstDay()).isEqualTo(LocalDate.now());
        assertThat(newHistory.getLastDay()).isNull();
    }

    @Test
    void updateFlatTransfersOwnerWhenOwnerIdIsProvided() {
        Member newOwner = new Member();
        newOwner.setId("new-owner");

        Flat existing = new Flat();
        existing.setId("flat-1");
        existing.setFlatNumber("A-101");

        Flat input = new Flat();
        input.setFlatNumber("A-101");
        input.setWing("A");
        input.setFloor(1);
        input.setArea(750);
        input.setAmount(5000L);
        input.setType(Flat.FlatType.BHK2);
        input.setStatus(Flat.Status.VACANT);
        Member requestedOwner = new Member();
        requestedOwner.setId("new-owner");
        input.setOwner(requestedOwner);

        when(flatRepository.findById("flat-1")).thenReturn(Optional.of(existing));
        when(memberRepository.findById("new-owner")).thenReturn(Optional.of(newOwner));
        when(flatRepository.findByOwnerId("new-owner")).thenReturn(Optional.empty());
        when(flatOwnershipHistoryRepository.findFirstByFlatIdAndLastDayIsNullOrderByFirstDayDesc("flat-1"))
                .thenReturn(Optional.empty());
        when(flatRepository.save(any(Flat.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(flatOwnershipHistoryRepository.save(any(FlatOwnershipHistory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Flat result = flatService.updateFlat("flat-1", input);

        assertThat(result.getOwner()).isSameAs(newOwner);
        assertThat(result.getStatus()).isEqualTo(Flat.Status.OCCUPIED);
        assertThat(result.getWing()).isEqualTo("A");
        assertThat(newOwner.getFlatId()).isEqualTo("A-101");

        ArgumentCaptor<FlatOwnershipHistory> historyCaptor = ArgumentCaptor.forClass(FlatOwnershipHistory.class);
        verify(flatOwnershipHistoryRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getPreviousOwnerId()).isNull();
        assertThat(historyCaptor.getValue().getNewOwnerId()).isEqualTo("new-owner");
        assertThat(historyCaptor.getValue().getTransferDate()).isEqualTo(LocalDate.now());
    }
}
