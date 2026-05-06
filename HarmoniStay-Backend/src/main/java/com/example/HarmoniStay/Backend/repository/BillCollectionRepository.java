package com.example.HarmoniStay.Backend.repository;

import com.example.HarmoniStay.Backend.model.BillCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BillCollectionRepository extends JpaRepository<BillCollection, String> {
    @Modifying
    @Query("UPDATE BillCollection bc SET bc.flat = null WHERE bc.flat.id = :flatId")
    void clearFlatReferences(@Param("flatId") String flatId);
}
