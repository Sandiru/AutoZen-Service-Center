package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
    User findByVehicleId(String vehicleId);
}
