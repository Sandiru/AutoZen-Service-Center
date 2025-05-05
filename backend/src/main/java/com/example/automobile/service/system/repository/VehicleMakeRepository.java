package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.VehicleMake;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleMakeRepository extends JpaRepository<VehicleMake,Long> {
    VehicleMake findByName(String name);
}
