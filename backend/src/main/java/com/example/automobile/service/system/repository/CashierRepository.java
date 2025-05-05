package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Cashier;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CashierRepository extends JpaRepository<Cashier,Long> {
    Cashier findByName(String name);
}
