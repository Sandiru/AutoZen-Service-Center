package com.example.automobile.service.system.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class User {
    @Id
    private String vehicleId;
    private String name;
    private String Address;
    private String phoneNo;
    private String nicNo;

    public User() {
    }

    public User(String vehicle_id, String name, String address, String phone_no, String nic_no) {
        this.vehicleId = vehicle_id;
        this.name = name;
        Address = address;
        this.phoneNo = phone_no;
        this.nicNo = nic_no;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return Address;
    }

    public void setAddress(String address) {
        Address = address;
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
