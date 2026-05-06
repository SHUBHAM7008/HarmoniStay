package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillRepository;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
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
class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private FlatRepository flatRepository;

    @InjectMocks
    private BillService billService;

    @Test
    void addBillDefaultsBlankStatusToUnpaid() {
        Bill bill = new Bill();
        bill.setStatus(" ");
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bill result = billService.addBill(bill);

        assertThat(result.getStatus()).isEqualTo("UNPAID");
        verify(billRepository).save(bill);
    }

    @Test
    void addBillWithEmailAndFlatNumberLinksMemberAndFlat() {
        Member member = new Member();
        member.setId("member-1");
        Flat flat = new Flat();
        flat.setId("flat-1");
        Bill bill = new Bill();
        bill.setUserEmail("owner@harmonistay.test");
        bill.setFlatNumber("A-101");

        when(memberRepository.findFirstByEmailOrderByCreatedAtDesc("owner@harmonistay.test")).thenReturn(Optional.of(member));
        when(flatRepository.findByFlatNumber("A-101")).thenReturn(Optional.of(flat));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bill result = billService.addBillWithEmailAndFlatNumber(bill);

        assertThat(result.getUserId()).isEqualTo("member-1");
        assertThat(result.getFlatId()).isEqualTo("flat-1");
        assertThat(result.getStatus()).isEqualTo("UNPAID");
    }

    @Test
    void addBillWithEmailAndFlatNumberThrowsWhenMemberMissing() {
        Bill bill = new Bill();
        bill.setUserEmail("missing@harmonistay.test");
        when(memberRepository.findFirstByEmailOrderByCreatedAtDesc("missing@harmonistay.test")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billService.addBillWithEmailAndFlatNumber(bill))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Member not found with email: missing@harmonistay.test");
    }

    @Test
    void updateBillMarksPaidAndStoresTransactionId() {
        Bill bill = new Bill();
        bill.setStatus("UNPAID");
        bill.setOverdueSmsSent(false);
        when(billRepository.findById("bill-1")).thenReturn(Optional.of(bill));
        when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Bill result = billService.updateBill("bill-1", "txn-123");

        assertThat(result.getStatus()).isEqualTo("PAID");
        assertThat(result.getTransactionId()).isEqualTo("txn-123");
        assertThat(result.isOverdueSmsSent()).isTrue();
    }

    @Test
    void updateBillThrowsWhenBillDoesNotExist() {
        when(billRepository.findById("missing-bill")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> billService.updateBill("missing-bill", "txn-123"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Bill not found");
    }
}
