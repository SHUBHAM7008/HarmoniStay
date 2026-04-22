package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Meeting;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.MeetingRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {

    private static final Logger log = LoggerFactory.getLogger(MeetingService.class);

    @Autowired
    private MeetingRepository meetingRepository;

    @Autowired
    private GoogleCalendarService googleCalendarService;

    @Autowired
    private SmsService smsService;

    @Autowired
    private MemberRepository memberRepository;

    public Meeting createMeeting(Meeting meeting) {
        String resolvedLoggedUser = resolveLoggedUserEmail();
        if (StringUtils.hasText(resolvedLoggedUser)) {
            meeting.setCreatedBy(resolvedLoggedUser);
            log.info("Meeting create: createdBy resolved from logged user context='{}'", resolvedLoggedUser);
        }
        log.info("Meeting create request: title='{}', type='{}', createdBy='{}', scheduledDate={}",
                meeting.getTitle(), meeting.getType(), meeting.getCreatedBy(), meeting.getScheduledDate());
        meeting.setCreatedAt(new Date());
        try {
            String meetLink = googleCalendarService.createMeetLink(meeting);
            if (StringUtils.hasText(meetLink)) {
                meeting.setMeetingLink(meetLink);
            }
        } catch (Exception e) {
            log.error("Failed to create Google Meet link for meeting '{}': {}", meeting.getTitle(), e.getMessage());
        }

        Meeting savedMeeting = meetingRepository.save(meeting);

        if (StringUtils.hasText(savedMeeting.getMeetingLink())) {
            log.info("Meeting SMS step 1: meetingLink present for meetingId={}, createdBy={}",
                    savedMeeting.getId(), savedMeeting.getCreatedBy());

            if (!StringUtils.hasText(savedMeeting.getCreatedBy())) {
                List<Member> allMembers = memberRepository.findAll();
                log.warn("Meeting SMS debug: createdBy is null/blank in saved meeting. Total members in DB={}", allMembers.size());
                for (Member member : allMembers) {
                    log.info("Meeting SMS debug member: id={}, email={}, phone={}",
                            member.getId(), member.getEmail(), member.getPhone());
                }
            }

            Optional<Member> creator = StringUtils.hasText(savedMeeting.getCreatedBy())
                    ? memberRepository.findByEmail(savedMeeting.getCreatedBy())
                    : Optional.empty();
            if (creator.isPresent() && StringUtils.hasText(creator.get().getPhone())) {
                log.info("Meeting SMS step 2: resolved recipient phone={} for memberId={}",
                        creator.get().getPhone(), creator.get().getId());
                String smsBody = "Your meeting is scheduled. Join here: " + savedMeeting.getMeetingLink();
                smsService.sendMeetingSms(creator.get().getPhone(), smsBody);
            } else {
                log.warn("Meeting SMS step 2: skipped recipient resolution (createdBy={}, creatorFound={}, creatorPhone={})",
                        savedMeeting.getCreatedBy(),
                        creator.isPresent(),
                        creator.isPresent() ? creator.get().getPhone() : "null");
            }
        } else {
            log.warn("Meeting SMS step 1: skipped because meetingLink is missing for meetingId={}", savedMeeting.getId());
        }

        return savedMeeting;
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public List<Meeting> getMeetingsByType(String type) {
        return meetingRepository.findByType(type);
    }

    public List<Meeting> getMemberMeetingsFeed() {
        List<Meeting> upcoming = meetingRepository.findTop5ByScheduledDateGreaterThanEqualOrderByScheduledDateAsc(new Date());
        if (upcoming != null && !upcoming.isEmpty()) {
            return upcoming;
        }
        // Fallback: if no upcoming meetings exist, show latest past meetings.
        return meetingRepository.findTop5ByOrderByScheduledDateDesc();
    }

    public Optional<Meeting> getById(String id) {
        return meetingRepository.findById(id);
    }

    public Meeting updateMeeting(String id, Meeting updated) {
        Meeting m = meetingRepository.findById(id).orElseThrow();
        if (updated.getTitle() != null) m.setTitle(updated.getTitle());
        if (updated.getType() != null) m.setType(updated.getType());
        if (updated.getDescription() != null) m.setDescription(updated.getDescription());
        if (updated.getScheduledDate() != null) m.setScheduledDate(updated.getScheduledDate());
        if (updated.getVenue() != null) m.setVenue(updated.getVenue());
        if (updated.getMinutes() != null) m.setMinutes(updated.getMinutes());
        return meetingRepository.save(m);
    }

    public void deleteMeeting(String id) {
        meetingRepository.deleteById(id);
    }

    private String resolveLoggedUserEmail() {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (!(attrs instanceof ServletRequestAttributes servletAttrs)) {
            return null;
        }
        HttpServletRequest request = servletAttrs.getRequest();
        if (request == null) {
            return null;
        }

        String fromHeader = firstNonBlank(
                request.getHeader("X-User-Email"),
                request.getHeader("x-user-email"),
                request.getHeader("X-Logged-User"),
                request.getHeader("x-logged-user")
        );
        if (StringUtils.hasText(fromHeader)) {
            return fromHeader.trim();
        }

        HttpSession session = request.getSession(false);
        if (session != null) {
            Object sessionEmail = session.getAttribute("userEmail");
            if (sessionEmail == null) sessionEmail = session.getAttribute("email");
            if (sessionEmail == null) sessionEmail = session.getAttribute("loggedInUser");
            if (sessionEmail instanceof String s && StringUtils.hasText(s)) {
                return s.trim();
            }
        }

        return null;
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
