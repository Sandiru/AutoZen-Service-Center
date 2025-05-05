package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.VehicleMake;
import com.example.automobile.service.system.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehicleModelRepository extends JpaRepository<VehicleModel,Long> {
    List<VehicleModel> findByVehicleMake(VehicleMake vehicleMake);
    VehicleModel findByNameAndVehicleMake(String name, VehicleMake vehicleMake);

}
