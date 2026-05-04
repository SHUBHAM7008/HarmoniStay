package com.example.HarmoniStay.Backend.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    @Value("${twilio.phone.number:}")
    private String fromPhone;

    /**
     * Sends any transactional SMS via Twilio. Normalizes Indian numbers when digits look local.
     */
    public void sendSms(String phoneNumber, String message) {
        log.info("SMS: entered SmsService (rawTo={}, rawFrom={})", phoneNumber, fromPhone);
        if (!StringUtils.hasText(phoneNumber) || !StringUtils.hasText(message)) {
            log.warn("SMS: skip due to missing phone/message");
            return;
        }
        if (!StringUtils.hasText(fromPhone)) {
            log.warn("SMS: skip because Twilio sender number is not configured");
            return;
        }

        String digits = phoneNumber.replaceAll("\\D", "");
        if (digits.length() < 10) {
            log.warn("SMS: skip invalid recipient phone={} digits={}", phoneNumber, digits);
            return;
        }
        String to = digits.length() > 10 && digits.startsWith("91") ? "+" + digits : "+91" + digits;
        String from = fromPhone.trim();
        log.info("SMS: Twilio request from={} to={} (rawTo={}, normalizedDigits={})",
                from, to, phoneNumber, digits);
        try {
            Message twilioMessage = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(from),
                    message
            ).create();
            log.info("SMS: sent successfully sid={} from={} to={}",
                    twilioMessage.getSid(), from, to);
        } catch (Exception e) {
            log.error("SMS: failed from={} to={} error={}", from, to, e.getMessage());
        }
    }

    public void sendMeetingSms(String phoneNumber, String message) {
        log.info("Meeting SMS step 3: delegating to sendSms");
        sendSms(phoneNumber, message);
    }

    /**
     * Welcome SMS after member registration: login with flat number or email and the initial password.
     */
    public void sendMemberCredentialsSms(String phoneNumber, String flatNumber, String password, String email) {
        if (!StringUtils.hasText(phoneNumber)) {
            log.warn("Member welcome SMS: no phone number, skip");
            return;
        }
        StringBuilder body = new StringBuilder();
        body.append("HarmoniStay: Your account is ready. ");
        if (StringUtils.hasText(flatNumber)) {
            body.append("Flat No: ").append(flatNumber.trim()).append(". ");
        }
        if (StringUtils.hasText(password)) {
            body.append("Password: ").append(password.trim()).append(". ");
        }
        body.append("Sign in using Flat No or email as username.");
        if (StringUtils.hasText(email)) {
            body.append(" Email: ").append(email.trim()).append(".");
        }
        sendSms(phoneNumber, body.toString());
    }
}
