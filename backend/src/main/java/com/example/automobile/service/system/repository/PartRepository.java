package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartRepository extends JpaRepository<Part,Long> {
    Part findById(String partId);
    List<Part> findAll();
}
