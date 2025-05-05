package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.ServiceFee;
import com.example.automobile.service.system.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceFeeRepository extends JpaRepository<ServiceFee,Long> {
    List<ServiceFee> findByModel(String model);
    ServiceFee findByDescriptionAndModel(String description,String model);
}
