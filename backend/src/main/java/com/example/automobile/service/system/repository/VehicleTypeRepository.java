package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleTypeRepository extends JpaRepository<VehicleType,Long> {
    List<VehicleType> findAll();
}
