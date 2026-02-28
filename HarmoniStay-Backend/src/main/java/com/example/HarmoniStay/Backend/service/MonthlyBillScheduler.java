package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Bill;
import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.BillRepository;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class MonthlyBillScheduler {

    @Value("${twilio.account.sid}")
    private String ACCOUNT_SID;

    @Value("${twilio.auth.token}")
    private String AUTH_TOKEN;

    @Value("${twilio.phone.number}")
    private String FROM_PHONE;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private FlatRepository flatRepository;

    // Format like 2025-10
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

    // Run at 00:00 on the 1st day of every month
    @Scheduled(cron = "0 0 0 1 * ?")
    public void generateMonthlyBills() {
        System.out.println("Running Monthly Bill Generator...");

        List<Member> members = memberRepository.findAll();
        String currentMonth = LocalDate.now().format(formatter);
        members.forEach(System.out::println);
        for (Member member : members) {
            if (member.getFlatId() == null) continue;

            // Check if bill already exists for this flat and month
            boolean exists = billRepository.existsByFlatNumberAndBillMonth(member.getFlatId(), currentMonth);
            if (exists) continue;

            Bill bill = new Bill();
            bill.setUserId(member.getId());
            bill.setUserEmail(member.getEmail());
            bill.setFlatNumber(member.getFlatId());
            flatRepository.findByFlatNumber(member.getFlatId())
                    .ifPresent(flat -> bill.setFlatId(flat.getId()));
            bill.setAmount(1000.00); // Set your default maintenance charge here
            bill.setStatus("UNPAID");
            bill.setBillMonth(currentMonth);
            bill.setDescription("Auto-generated monthly maintenance bill");

            billRepository.save(bill);
            sendSMS(member.getPhone(), " Maintenance Bill is assigned for " + currentMonth);
        }

        System.out.println("Monthly bills generated successfully for " + currentMonth);
    }

    @Scheduled(cron = "0 54 14 * * ?")
    public void sendRemainder(){
        LocalDate today = LocalDate.now();

        // Only send reminder on 27th of each month
        if (today.getDayOfMonth() != 30) return;

        String currentMonth = today.format(formatter);
        System.out.println("Running payment reminder job for " + currentMonth + "...");

        List<Bill> unpaidBills = billRepository.findByBillMonthAndStatus(currentMonth, "UNPAID");
        for (Bill bill : unpaidBills) {
            Member member = bill.getUserId() != null
                    ? memberRepository.findById(bill.getUserId()).orElse(null)
                    : memberRepository.findByEmail(bill.getUserEmail()).orElse(null);
            if (member == null || member.getPhone() == null) continue;

            String message = String.format(
                    "Dear %s, your maintenance bill for %s is still unpaid. Please clear the ₹%.2f before month-end. - HarmonyStay",
                    member.getFirstName(), currentMonth, bill.getAmount()
            );
            sendSMS(member.getPhone(), message);
            System.out.println("Reminder sent to " + member.getPhone());
        }

    }

    private void sendSMS(String to, String msg) {
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
        Message.creator(
                new PhoneNumber("+91"+to),
                new PhoneNumber(FROM_PHONE),
                msg
        ).create();
    }

}
