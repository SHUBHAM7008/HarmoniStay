package com.example.HarmoniStay.Backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct; // Use javax.annotation.PostConstruct if older Spring
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class OTPService {

    @Value("${twilio.account.sid}")
    private String ACCOUNT_SID;

    @Value("${twilio.auth.token}")
    private String AUTH_TOKEN;

    @Value("${twilio.phone.number}")
    private String FROM_PHONE;

    private Map<String, String> otpStorage = new HashMap<>(); // phone -> otp

    @PostConstruct
    public void initTwilio() {
        // Now @Value fields are injected
        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
        System.out.println("Twilio initialized with SID: " + ACCOUNT_SID);
    }

    public String generateOTP(String phone) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(phone, otp);
        sendSMS(phone, otp);
        System.out.print("G OTP :"+otp);
        return otp;
    }

    private void sendSMS(String to, String otp) {
        Message.creator(
                new PhoneNumber(to),
                new PhoneNumber(FROM_PHONE),
                "Your HarmonyStay OTP is: " + otp
        ).create();
    }

    public boolean verifyOTP(String phone, String otp) {
        if (otpStorage.containsKey(phone) && otpStorage.get(phone).equals(otp)) {
            otpStorage.remove(phone);
            return true;
        }
        System.out.print("V OTP and Phone:"+otp+phone);
        return false;
    }
}
