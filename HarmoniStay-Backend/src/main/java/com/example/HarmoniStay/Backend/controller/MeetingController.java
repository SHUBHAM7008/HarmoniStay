package com.example.HarmoniStay.Backend.controller;

import com.example.HarmoniStay.Backend.model.Meeting;
import com.example.HarmoniStay.Backend.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingService.getAllMeetings();
    }

    @GetMapping("/type/{type}")
    public List<Meeting> getByType(@PathVariable String type) {
        return meetingService.getMeetingsByType(type);
    }

    @GetMapping("/member-feed")
    public List<Meeting> getMemberFeed() {
        return meetingService.getMemberMeetingsFeed();
    }

    @GetMapping("/{id}")
    public Optional<Meeting> getById(@PathVariable String id) {
        return meetingService.getById(id);
    }

    @PostMapping
    public Meeting create(
            @RequestBody Meeting meeting,
            @RequestHeader(value = "X-User-Email", required = false) String loggedUserEmail
    ) {
        if (loggedUserEmail != null && !loggedUserEmail.isBlank()) {
            meeting.setCreatedBy(loggedUserEmail.trim());
        }
        return meetingService.createMeeting(meeting);
    }

    @PutMapping("/{id}")
    public Meeting update(@PathVariable String id, @RequestBody Meeting meeting) {
        return meetingService.updateMeeting(id, meeting);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        meetingService.deleteMeeting(id);
    }
}
