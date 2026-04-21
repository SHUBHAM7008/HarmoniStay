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

    public void sendMeetingSms(String phoneNumber, String message) {
        log.info("Meeting SMS step 3: entered SmsService (rawTo={}, rawFrom={})", phoneNumber, fromPhone);
        if (!StringUtils.hasText(phoneNumber) || !StringUtils.hasText(message)) {
            log.warn("Meeting SMS step 3: skip due to missing phone/message");
            return;
        }
        if (!StringUtils.hasText(fromPhone)) {
            log.warn("Meeting SMS step 3: skip because Twilio sender number is not configured");
            return;
        }

        String digits = phoneNumber.replaceAll("\\D", "");
        if (digits.length() < 10) {
            log.warn("Meeting SMS step 3: skip invalid recipient phone={} digits={}", phoneNumber, digits);
            return;
        }
        String to = digits.length() > 10 && digits.startsWith("91") ? "+" + digits : "+91" + digits;
        String from = fromPhone.trim();
        log.info("Meeting SMS step 4: Twilio request from={} to={} (rawTo={}, normalizedDigits={})",
                from, to, phoneNumber, digits);
        try {
            Message twilioMessage = Message.creator(
                    new PhoneNumber(to),
                    new PhoneNumber(from),
                    message
            ).create();
            log.info("Meeting SMS step 5: sent successfully sid={} from={} to={}",
                    twilioMessage.getSid(), from, to);
        } catch (Exception e) {
            log.error("Meeting SMS step 5: failed from={} to={} error={}", from, to, e.getMessage());
        }
    }
}
