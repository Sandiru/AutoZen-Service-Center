package com.example.automobile.service.system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
public class ServiceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonBackReference
    private Vehicle vehicle;

    private LocalDateTime serviceDateTime;
    @Lob
    private String serviceDetails;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id")
    private Cashier processedByCashier;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    public ServiceRecord() {
    }

    public ServiceRecord(Long id, Vehicle vehicle, LocalDateTime serviceDateTime, String serviceDetails, BigDecimal totalCost, Cashier processedByCashier, Appointment appointment) {
        this.id = id;
        this.vehicle = vehicle;
        this.serviceDateTime = serviceDateTime;
        this.serviceDetails = serviceDetails;
        this.totalCost = totalCost;
        this.processedByCashier = processedByCashier;
        this.appointment = appointment;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public LocalDateTime getServiceDateTime() {
        return serviceDateTime;
    }

    public void setServiceDateTime(LocalDateTime serviceDateTime) {
        this.serviceDateTime = serviceDateTime;
    }

    public String getServiceDetails() {
        return serviceDetails;
    }

    public void setServiceDetails(String serviceDetails) {
        this.serviceDetails = serviceDetails;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public Cashier getProcessedByCashier() {
        return processedByCashier;
    }

    public void setProcessedByCashier(Cashier processedByCashier) {
        this.processedByCashier = processedByCashier;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }
}
