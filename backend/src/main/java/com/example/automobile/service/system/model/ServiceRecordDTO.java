package com.example.automobile.service.system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ServiceRecordDTO {
    private Long id;
    private String vehicleId;
    private String make;
    private String model;
    private LocalDateTime serviceDateTime;
    private String serviceDetails;
    private BigDecimal totalCost;
    private String processedByCashierName;
    private Long appointmentId;

    public ServiceRecordDTO() {
    }

    public ServiceRecordDTO(Long id, String vehicleId, String make, String model, LocalDateTime serviceDateTime, String serviceDetails, BigDecimal totalCost, String processedByCashierName, Long appointmentId) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.make = make;
        this.model = model;
        this.serviceDateTime = serviceDateTime;
        this.serviceDetails = serviceDetails;
        this.totalCost = totalCost;
        this.processedByCashierName = processedByCashierName;
        this.appointmentId = appointmentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
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

    public String getProcessedByCashierName() {
        return processedByCashierName;
    }

    public void setProcessedByCashierName(String processedByCashierName) {
        this.processedByCashierName = processedByCashierName;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }
}
