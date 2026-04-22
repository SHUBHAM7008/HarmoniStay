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
    @Scheduled(cron = "0 5 0 1 * ?", zone = "Asia/Kolkata")
    public void generateMonthlyBills() {
        log.info("Monthly bill generator started");
        String currentMonth = LocalDate.now().format(MONTH_FMT);
        List<Member> members = memberRepository.findAll();
        log.info("Monthly bill generator evaluating {} members for {}", members.size(), currentMonth);

        for (Member member : members) {
            if (member.getFlatId() == null || member.getFlatId().isBlank()) {
                log.debug("Skip member {}: flatId missing", member.getId());
                continue;
            }
            if ("ACCOUNTANT".equalsIgnoreCase(member.getRole())) {
                log.debug("Skip member {}: role ACCOUNTANT", member.getId());
                continue;
            }

            try {
                log.info("Processing member {} (flat {}, phone {})",
                        member.getId(), member.getFlatId(), member.getPhone());
                boolean exists = billRepository.existsByFlatNumberAndBillMonth(member.getFlatId(), currentMonth);
                if (exists) {
                    log.info("Skip member {}: bill already exists for {}", member.getId(), currentMonth);
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
                log.info("Bill created for member {} (billMonth {}, amount {})",
                        member.getId(), currentMonth, bill.getAmount());

                String sms = "HarmonyStay: Maintenance bill assigned for " + currentMonth + ". Please pay via the app.";
                log.info("Attempting assignment SMS for member {} to phone {}", member.getId(), member.getPhone());
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
            log.info("Loaded {} unpaid bills for reminders in {}", unpaidBills.size(), currentMonth);
        } catch (Exception e) {
            log.error("Failed to load unpaid bills: {}", e.getMessage());
            return;
        }

        for (Bill bill : unpaidBills) {
            try {
                log.info("Processing reminder for bill {} (userId {}, email {}, amount {})",
                        bill.getId(), bill.getUserId(), bill.getUserEmail(), bill.getAmount());
                Member member = bill.getUserId() != null
                        ? memberRepository.findById(bill.getUserId()).orElse(null)
                        : (bill.getUserEmail() != null
                                ? memberRepository.findByEmail(bill.getUserEmail()).orElse(null)
                                : null);
                if (member == null || !StringUtils.hasText(member.getPhone())) {
                    log.warn("Skip reminder for bill {}: member/phone missing", bill.getId());
                    continue;
                }

                String message = String.format(
                        "Dear %s, your maintenance bill for %s is still unpaid. Please pay ₹%.2f via HarmonyStay before month-end.",
                        member.getFirstName() != null ? member.getFirstName() : "Member",
                        currentMonth,
                        bill.getAmount()
                );
                log.info("Attempting reminder SMS for bill {} to member {} phone {}",
                        bill.getId(), member.getId(), member.getPhone());
                sendSmsSafe(member.getPhone(), message);
            } catch (Exception e) {
                log.warn("Reminder failed for bill {}: {}", bill.getId(), e.getMessage());
            }
        }
    }

    /**
     * Overdue reminders: daily at 09:30 IST.
     * Sends SMS once for bills unpaid after due date.
     */
    @Scheduled(cron = "0 30 9 * * ?", zone = "Asia/Kolkata")
    public void sendOverdueDueDateAlerts() {
        LocalDate today = LocalDate.now();
        List<Bill> overdueBills;
        try {
            overdueBills = billRepository.findPendingOverdueBillsForSms("UNPAID", today);
            log.info("Loaded {} overdue unpaid bills for due-date alerts (today={})", overdueBills.size(), today);
        } catch (Exception e) {
            log.error("Failed loading overdue due-date alerts: {}", e.getMessage());
            return;
        }

        for (Bill bill : overdueBills) {
            try {
                Member member = bill.getUserId() != null
                        ? memberRepository.findById(bill.getUserId()).orElse(null)
                        : (bill.getUserEmail() != null
                        ? memberRepository.findByEmail(bill.getUserEmail()).orElse(null)
                        : null);
                if (member == null || !StringUtils.hasText(member.getPhone())) {
                    log.warn("Skip overdue alert for bill {}: member/phone missing", bill.getId());
                    continue;
                }

                String message = String.format(
                        "HarmonyStay: Your bill for flat %s was due on %s and is still unpaid. Please pay immediately.",
                        bill.getFlatNumber() != null ? bill.getFlatNumber() : "N/A",
                        bill.getDueDate() != null ? bill.getDueDate().toString() : "N/A"
                );
                sendSmsSafe(member.getPhone(), message);
                bill.setOverdueSmsSent(true);
                billRepository.save(bill);
                log.info("Overdue due-date SMS sent for bill {} to member {}", bill.getId(), member.getId());
            } catch (Exception e) {
                log.warn("Overdue due-date SMS failed for bill {}: {}", bill.getId(), e.getMessage());
            }
        }
    }

    private void sendSmsSafe(String rawPhone, String body) {
        log.info("SMS step 1: entered sendSmsSafe (rawPhone={})", rawPhone);
        if (!StringUtils.hasText(rawPhone)) {
            log.warn("SMS step 2: skip - phone missing/blank");
            return;
        }
        if (!twilioConfigured()) {
            log.warn("SMS step 2: skip - Twilio not configured (sidSet={}, tokenSet={}, fromSet={})",
                    StringUtils.hasText(accountSid), StringUtils.hasText(authToken), StringUtils.hasText(fromPhone));
            return;
        }
        log.info("SMS step 2: Twilio config present, initializing client if needed");
        ensureTwilio();
        if (!twilioInitialized.get()) {
            log.error("SMS step 3: Twilio initialization not ready, aborting send");
            return;
        }
        try {
            String digits = rawPhone.replaceAll("\\D", "");
            log.info("SMS step 4: normalized phone digits={}", digits);
            if (digits.length() < 10) {
                log.warn("Invalid phone, skip SMS: {}", rawPhone);
                return;
            }
            String to = digits.length() > 10 && digits.startsWith("91") ? "+" + digits : "+91" + digits;
            log.info("SMS step 5: resolved destination={}, from={}", to, fromPhone.trim());

            Message twilioMessage = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(fromPhone.trim()),
                    body
            ).create();
            log.info("SMS step 6: sent successfully to {} with sid={}", to, twilioMessage.getSid());
        } catch (Exception e) {
            log.error("SMS step 6: send failed - {} ({})", e.getMessage(), e.getClass().getSimpleName());
        }
    }
}
