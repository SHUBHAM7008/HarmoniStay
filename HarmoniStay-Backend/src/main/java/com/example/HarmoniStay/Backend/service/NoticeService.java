package com.example.HarmoniStay.Backend.service;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.HarmoniStay.Backend.model.Notice;
import com.example.HarmoniStay.Backend.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoticeService {

    @Value("${twilio.account.sid}")
    private String ACCOUNT_SID;

    @Value("${twilio.auth.token}")
    private String AUTH_TOKEN;

    @Value("${twilio.phone.number}")
    private String FROM_PHONE;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private MemberRepository memberRepository;

    public List<Notice> getAllNotices() {
        return noticeRepository.findAll();
    }

    public Notice addNotice(Notice notice) {
        // 1️⃣ Save the notice
        Notice savedNotice = noticeRepository.save(notice);

        // 2️⃣ Initialize Twilio
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);

        // 3️⃣ Fetch all members
        List<Member> members = memberRepository.findAll();

        // 4️⃣ SMS Message Template
        String messageBody = """
                📢 *HarmonyStay Community Notice*

                🏷️ Title: %s

                📝 Details: %s

                📅 Date: %s

                -- Team HarmonyStay 🏡
                """.formatted(
                savedNotice.getTitle(),
                savedNotice.getDescription(),
                java.time.LocalDate.now()
        );

        // 5️⃣ Send SMS to each member
        for (Member member : members) {
            if (member.getPhone() != null && !member.getPhone().isEmpty()) {
                try {
                    Message.creator(
                            new PhoneNumber("+91"+member.getPhone()),   // To
                            new PhoneNumber(FROM_PHONE),          // From
                            messageBody
                    ).create();

                    System.out.println("✅ SMS sent to: " + member.getPhone());

                } catch (Exception e) {
                    System.err.println("⚠️ Failed to send SMS to " + member.getPhone() + ": " + e.getMessage());
                }
            }
        }

        return savedNotice;
    }

    public void deleteNotice(String id) {
        noticeRepository.deleteById(id);
    }

    public Optional<Notice> getNoticeById(String id) {
        return noticeRepository.findById(id);
    }

    public Notice updateNotice(String id, Notice updatedNotice) {
        Optional<Notice> optional = noticeRepository.findById(id);
        if (optional.isPresent()) {
            Notice notice = optional.get();
            notice.setTitle(updatedNotice.getTitle());
            notice.setDescription(updatedNotice.getDescription());
            notice.setDate(updatedNotice.getDate());
            return noticeRepository.save(notice);
        }
        return null;
    }

}
