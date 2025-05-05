package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.ServiceRecord;
import com.example.automobile.service.system.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRecordRepository extends JpaRepository<ServiceRecord,Long> {
    List<ServiceRecord> findByVehicleOrderByServiceDateTimeDesc(Vehicle vehicle);
    @org.springframework.data.jpa.repository.Query("SELECT sr FROM ServiceRecord sr JOIN sr.vehicle v JOIN v.owner c " +
            "WHERE LOWER(v.vehicleId) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(v.chassisNo) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(c.nicNo) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY sr.serviceDateTime DESC")
    List<ServiceRecord> searchHistory(@org.springframework.data.repository.query.Param("query") String query);
}
