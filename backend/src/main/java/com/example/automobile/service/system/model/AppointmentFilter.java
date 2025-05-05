package com.example.automobile.service.system.model;

import java.time.LocalDate;

public class AppointmentFilter {
    private LocalDate startDate;
    private LocalDate endDate;
    private String vehicleId;
    private String chassisNo;
    private String customerName;
    private AppointmentStatus status;

    public AppointmentFilter() {
    }

    public AppointmentFilter(LocalDate startDate, LocalDate endDate, String vehicleId,
                             String chassisNo, String customerName, AppointmentStatus status) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.vehicleId = vehicleId;
        this.chassisNo = chassisNo;
        this.customerName = customerName;
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getChassisNo() {
        return chassisNo;
    }

    public void setChassisNo(String chassisNo) {
        this.chassisNo = chassisNo;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
