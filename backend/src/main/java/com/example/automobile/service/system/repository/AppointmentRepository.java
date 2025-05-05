package com.example.automobile.service.system.repository;

import com.example.automobile.service.system.entity.Appointment;
import com.example.automobile.service.system.entity.Vehicle;
import com.example.automobile.service.system.model.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment,Integer>, JpaSpecificationExecutor<Appointment> {
    List<Appointment> findByVehicle(Vehicle vehicle);
    List<Appointment> findByDate(LocalDate date);
    List<Appointment> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Appointment> findByStatus(AppointmentStatus status);
    List<Appointment> findByDateAndStatus(LocalDate date, AppointmentStatus status);

    List<Appointment> findByVehicleAndDateBetween(Vehicle vehicle, LocalDate startDate, LocalDate endDate);

    // Check for overlapping appointments for a given date and time range
    @Query("SELECT COUNT(a) > 0 FROM Appointment a " +
            "WHERE a.date = :date " +
            "AND a.status != com.example.automobile.service.system.model.AppointmentStatus.CANCELLED " + // Hardcode the enum value
            "AND ((a.startTime < :endTime AND a.endTime > :startTime))")
    boolean existsOverlappingAppointment(@Param("date") LocalDate date,
                                         @Param("startTime") LocalTime startTime,
                                         @Param("endTime") LocalTime endTime);



 }
