package com.example.automobile.service.system.model;

public class CustomerVehicleInput {
    private String vehicleId; // License plate
    private String make;

    private String model;
    private Integer year;
    private String chassisNo;

    // Customer Details
    private String customerName;
    private String address;
    private String phoneNo;
    private String nicNo;

    public CustomerVehicleInput() {
    }

    public CustomerVehicleInput(String vehicleId, String make, String model, Integer year, String chassisNo, String customerName, String address, String phoneNo, String nicNo) {
        this.vehicleId = vehicleId;
        this.make = make;
        this.model = model;
        this.year = year;
        this.chassisNo = chassisNo;
        this.customerName = customerName;
        this.address = address;
        this.phoneNo = phoneNo;
        this.nicNo = nicNo;
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

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
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

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhoneNo() {
        return phoneNo;
    }

    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }

    public String getNicNo() {
        return nicNo;
    }

    public void setNicNo(String nicNo) {
        this.nicNo = nicNo;
    }
}
