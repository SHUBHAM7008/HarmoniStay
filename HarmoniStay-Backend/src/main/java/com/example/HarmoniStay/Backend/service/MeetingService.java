package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Meeting;
import com.example.HarmoniStay.Backend.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingService {

    @Autowired
    private MeetingRepository meetingRepository;

    public Meeting createMeeting(Meeting meeting) {
        meeting.setCreatedAt(new Date());
        return meetingRepository.save(meeting);
    }

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public List<Meeting> getMeetingsByType(String type) {
        return meetingRepository.findByType(type);
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
}
