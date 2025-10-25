package com.example.HarmoniStay.Backend.service;

import com.example.HarmoniStay.Backend.model.Flat;
import com.example.HarmoniStay.Backend.model.Member;
import com.example.HarmoniStay.Backend.repository.FlatRepository;
import com.example.HarmoniStay.Backend.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class FlatService {

    @Autowired
    private FlatRepository flatRepository;

    @Autowired
    private MemberRepository memberRepository;

    public List<Flat> getAllFlats() {
        return flatRepository.findAll();
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Flat createFlat(Flat flat) {
        flat.setCreatedAt(new Date());
        flat.setUpdatedAt(new Date());
        if(flat.getOwnershipHistory() == null) {
            flat.setOwnershipHistory(new ArrayList<>());
        }
        return flatRepository.save(flat);
    }

    public Flat assignFlatToMember(String flatId, String memberId) throws Exception {
        Flat flat = flatRepository.findById(flatId)
                .orElseThrow(() -> new Exception("Flat not found"));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new Exception("Member not found"));

        // Assign owner
        flat.setOwner(member);
        flat.setStatus(Flat.Status.OCCUPIED);
        flat.setUpdatedAt(new Date());

        return flatRepository.save(flat);
    }

    public Flat getFlatbyId(String flatId){
        return flatRepository.findByFlatNumber(flatId).orElse(null);
    }

    public void updateFlatStatus(String flatId, Flat.Status status) {
        Optional<Flat> optionalFlat = flatRepository.findByFlatNumber(flatId);
       System.out.println("in update ");
        if (optionalFlat.isPresent()) {
            System.out.println("in if "+optionalFlat);
            Flat flat = optionalFlat.get();
            flat.setStatus(status);
            flatRepository.save(flat);
        }
    }
}
