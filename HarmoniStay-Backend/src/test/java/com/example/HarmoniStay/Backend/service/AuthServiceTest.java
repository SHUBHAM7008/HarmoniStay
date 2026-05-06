package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Accountant;
import com.example.HarmoniStay.Backend.model.Admin;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.AccountantRepository;
import com.example.HarmoniStay.Backend.repository.AdminRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private AccountantRepository accountantRepository;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginAdminReturnsAdminWhenPasswordMatches() {
        Admin admin = new Admin();
        admin.setEmail("admin@harmonistay.test");
        admin.setPassword("secret");
        when(adminRepository.findByEmail("admin@harmonistay.test")).thenReturn(Optional.of(admin));

        Admin result = authService.loginAdmin("admin@harmonistay.test", "secret");

        assertThat(result).isSameAs(admin);
    }

    @Test
    void loginMemberSupportsTrimmedFlatIdAndRejectsAccountantRole() {
        Member member = new Member();
        member.setFlatId("A-101");
        member.setPassword("pass123");
        member.setRole("MEMBER");
        when(memberRepository.findFirstByFlatIdOrderByCreatedAtDesc("A-101")).thenReturn(Optional.of(member));

        Member result = authService.loginMember(" A-101 ", " pass123 ");

        assertThat(result).isSameAs(member);
        verify(memberRepository).findFirstByFlatIdOrderByCreatedAtDesc("A-101");
    }

    @Test
    void loginMemberFallsBackToEmailWhenFlatIdNotFound() {
        Member member = new Member();
        member.setEmail("owner@harmonistay.test");
        member.setPassword("pass123");
        member.setRole("OWNER");
        when(memberRepository.findFirstByFlatIdOrderByCreatedAtDesc("owner@harmonistay.test")).thenReturn(Optional.empty());
        when(memberRepository.findFirstByEmailOrderByCreatedAtDesc("owner@harmonistay.test")).thenReturn(Optional.of(member));

        Member result = authService.loginMember("owner@harmonistay.test", "pass123");

        assertThat(result).isSameAs(member);
    }

    @Test
    void loginMemberRejectsAccountantRoleFromMembersTable() {
        Member member = new Member();
        member.setPassword("pass123");
        member.setRole("ACCOUNTANT");
        when(memberRepository.findFirstByFlatIdOrderByCreatedAtDesc("A-102")).thenReturn(Optional.of(member));

        Member result = authService.loginMember("A-102", "pass123");

        assertThat(result).isNull();
    }

    @Test
    void loginSecurityReturnsDummySecurityForTemporaryCredentials() {
        Member result = authService.loginSecurity(" SECURITY@HARMONISTAY.LOCAL ", " security ");

        assertThat(result).isNotNull();
        assertThat(result.getRole()).isEqualTo("SECURITY");
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        verifyNoInteractions(memberRepository);
    }

    @Test
    void loginAccountantRequiresActiveStatusAndMatchingPassword() {
        Accountant accountant = new Accountant();
        accountant.setEmail("accounts@harmonistay.test");
        accountant.setPassword("secret");
        accountant.setStatus("ACTIVE");
        when(accountantRepository.findByEmail("accounts@harmonistay.test")).thenReturn(Optional.of(accountant));

        Accountant result = authService.loginAccountant(" accounts@harmonistay.test ", "secret");

        assertThat(result).isSameAs(accountant);
    }
}
