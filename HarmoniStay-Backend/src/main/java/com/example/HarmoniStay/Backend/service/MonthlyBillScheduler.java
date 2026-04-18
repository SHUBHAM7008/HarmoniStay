package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillRepository;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
@ConditionalOnProperty(name = "app.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class MonthlyBillScheduler {

    private static final Logger log = LoggerFactory.getLogger(MonthlyBillScheduler.class);

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.phone.number:}")
    private String fromPhone;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private FlatRepository flatRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    /** Twilio initialized lazily when credentials are present. */
    private final AtomicBoolean twilioInitialized = new AtomicBoolean(false);

    private boolean twilioConfigured() {
        return StringUtils.hasText(accountSid)
                && StringUtils.hasText(authToken)
                && StringUtils.hasText(fromPhone);
    }

    private void ensureTwilio() {
        if (!twilioConfigured()) {
            return;
        }
        if (twilioInitialized.compareAndSet(false, true)) {
            try {
                Twilio.init(accountSid, authToken);
                log.info("Twilio client initialized for scheduled SMS");
            } catch (Exception e) {
                log.error("Twilio init failed: {}", e.getMessage());
                twilioInitialized.set(false);
            }
        }
    }

    /**
     * Monthly maintenance bills: 1st of each month at 00:05 (Asia/Kolkata).
     * (Minute 5 avoids collision with other midnight jobs; cron is server TZ unless zone set.)
     */
    @Scheduled(cron = "0 * * * * ?", zone = "Asia/Kolkata")
    public void generateMonthlyBills() {
        log.info("Monthly bill generator started");
        String currentMonth = LocalDate.now().format(MONTH_FMT);
        List<Member> members = memberRepository.findAll();

        for (Member member : members) {
            if (member.getFlatId() == null || member.getFlatId().isBlank()) {
                continue;
            }
            if ("ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
                continue;
            }

            try {
                boolean exists = billRepository.existsByFlatNumberAndBillMonth(member.getFlatId(), currentMonth);
                if (exists) {
                    continue;
                }

                Bill bill = new Bill();
                bill.setUserId(member.getId());
                bill.setUserEmail(member.getEmail());
                bill.setFlatNumber(member.getFlatId());
                flatRepository.findByFlatNumber(member.getFlatId())
                        .ifPresent(flat -> bill.setFlatId(flat.getId()));
                bill.setAmount(1000.00);
                bill.setStatus("UNPAID");
                bill.setBillMonth(currentMonth);
                bill.setDescription("Auto-generated monthly maintenance bill");
                billRepository.save(bill);

                String sms = "HarmonyStay: Maintenance bill assigned for " + currentMonth + ". Please pay via the app.";
                sendSmsSafe(member.getPhone(), sms);
            } catch (Exception e) {
                log.error("Failed to generate bill for member {}: {}", member.getId(), e.getMessage());
            }
        }

        log.info("Monthly bill generator finished for {}", currentMonth);
    }

    /**
     * Payment reminders for unpaid bills this month — runs daily at 10:00 IST;
     * SMS is only sent on the configured day of month (default: 27).
     */
    @Scheduled(cron = "0 0 10 * * ?", zone = "Asia/Kolkata")
    public void sendPaymentReminders() {
        LocalDate today = LocalDate.now();
        int reminderDay = 27;
        if (today.getDayOfMonth() != reminderDay) {
            return;
        }

        String currentMonth = today.format(MONTH_FMT);
        log.info("Running payment reminder job for {} (day {})", currentMonth, reminderDay);

        List<Bill> unpaidBills;
        try {
            unpaidBills = billRepository.findByBillMonthAndStatus(currentMonth, "UNPAID");
        } catch (Exception e) {
            log.error("Failed to load unpaid bills: {}", e.getMessage());
            return;
        }

        for (Bill bill : unpaidBills) {
            try {
                Member member = bill.getUserId() != null
                        ? memberRepository.findById(bill.getUserId()).orElse(null)
                        : (bill.getUserEmail() != null
                                ? memberRepository.findByEmail(bill.getUserEmail()).orElse(null)
                                : null);
                if (member == null || !StringUtils.hasText(member.getPhone())) {
                    continue;
                }

                String message = String.format(
                        "Dear %s, your maintenance bill for %s is still unpaid. Please pay ₹%.2f via HarmonyStay before month-end.",
                        member.getFirstName() != null ? member.getFirstName() : "Member",
                        currentMonth,
                        bill.getAmount()
                );
                sendSmsSafe(member.getPhone(), message);
            } catch (Exception e) {
                log.warn("Reminder failed for bill {}: {}", bill.getId(), e.getMessage());
            }
        }
    }

    private void sendSmsSafe(String rawPhone, String body) {
        if (!StringUtils.hasText(rawPhone)) {
            return;
        }
        if (!twilioConfigured()) {
            log.debug("Skipping SMS (Twilio not configured): {}", body);
            return;
        }
        ensureTwilio();
        if (!twilioInitialized.get()) {
            return;
        }
        try {
            String digits = rawPhone.replaceAll("\\D", "");
            if (digits.length() < 10) {
                log.warn("Invalid phone, skip SMS: {}", rawPhone);
                return;
            }
            String to = digits.length() > 10 && digits.startsWith("91") ? "+" + digits : "+91" + digits;

            Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromPhone.trim()),
                    body
            ).create();
            log.info("SMS sent to {}", to);
        } catch (Exception e) {
            log.error("SMS failed: {}", e.getMessage());
        }
    }
}
