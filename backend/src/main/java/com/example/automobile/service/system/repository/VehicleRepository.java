package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Customer;
import com.example.automobile.service.system.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle,Long> {
    Vehicle findByVehicleId(String vehicleId);

    List<Vehicle> findByOwner(Customer customer);

    Vehicle findByChassisNo(String chassisNo);

    Boolean existsByVehicleId(String vehicleId);

    Boolean existsByChassisNo(String chassisNo);
    @Query("SELECT v FROM Vehicle v JOIN v.owner o " +
            "WHERE LOWER(v.vehicleId) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(v.chassisNo) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(o.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Vehicle> findSuggestions(@Param("query") String query);
}
