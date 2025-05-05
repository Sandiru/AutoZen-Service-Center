package com.example.automobile.service.system.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class AppointmentBookingRequest {
    private LocalDate date;
    private LocalTime startTime;

    private String vehicleIdentifier;

    private String make;
    private String model;
    private Integer year;


    private String customerIdentifier;


    private String customerName;
    private String customerAddress;
    private BigDecimal advanceFee;
    private String customerPhoneNo;

    private List<String> selectedServiceDescriptions;

    public AppointmentBookingRequest() {
    }

    public AppointmentBookingRequest(LocalDate date, LocalTime startTime, String vehicleIdentifier, String make, String model, Integer year, String customerIdentifier, String customerName, String customerAddress, BigDecimal advanceFee, String customerPhoneNo, List<String> selectedServiceDescriptions) {
        this.date = date;
        this.startTime = startTime;
        this.vehicleIdentifier = vehicleIdentifier;
        this.make = make;
        this.model = model;
        this.year = year;
        this.customerIdentifier = customerIdentifier;
        this.customerName = customerName;
        this.customerAddress = customerAddress;
        this.advanceFee = advanceFee;
        this.customerPhoneNo = customerPhoneNo;
        this.selectedServiceDescriptions = selectedServiceDescriptions;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public String getVehicleIdentifier() {
        return vehicleIdentifier;
    }

    public void setVehicleIdentifier(String vehicleIdentifier) {
        this.vehicleIdentifier = vehicleIdentifier;
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

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getCustomerIdentifier() {
        return customerIdentifier;
    }

    public void setCustomerIdentifier(String customerIdentifier) {
        this.customerIdentifier = customerIdentifier;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public BigDecimal getAdvanceFee() {
        return advanceFee;
    }

    public void setAdvanceFee(BigDecimal advanceFee) {
        this.advanceFee = advanceFee;
    }

    public String getCustomerPhoneNo() {
        return customerPhoneNo;
    }

    public void setCustomerPhoneNo(String customerPhoneNo) {
        this.customerPhoneNo = customerPhoneNo;
    }

    public List<String> getSelectedServiceDescriptions() {
        return selectedServiceDescriptions;
    }

    public void setSelectedServiceDescriptions(List<String> selectedServiceDescriptions) {
        this.selectedServiceDescriptions = selectedServiceDescriptions;
    }
}
