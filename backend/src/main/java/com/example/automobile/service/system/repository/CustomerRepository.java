package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Customer;
import jakarta.persistence.Column;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Customer findByNicNo(String username);
    Customer findByPhoneNo(String phoneNo);
    Boolean existsByPhoneNo(String phoneNo);
    Boolean existsByNicNo(String nicNo);
}
