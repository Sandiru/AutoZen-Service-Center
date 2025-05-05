package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday,Long> {
    Holiday findByDate(LocalDate date);
    List<Holiday> findAllByDate(LocalDate date);
}
