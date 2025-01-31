package com.budgetbuddy.project.repositories;

import com.budgetbuddy.project.entities.DirectTreasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository 
public interface DirectTreasureRepository extends JpaRepository<DirectTreasure, Long> {
    Optional<DirectTreasure> findByName(String name);
}
