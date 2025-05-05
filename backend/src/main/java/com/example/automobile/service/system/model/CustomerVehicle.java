package com.example.automobile.service.system.model;

import com.example.automobile.service.system.entity.Customer;
import com.example.automobile.service.system.entity.Vehicle;

public class CustomerVehicle {
    Customer customer;
    VehicleDTO vehicleDTO;

    public CustomerVehicle(Customer customer) {
        this.customer = customer;
    }

    public CustomerVehicle(Customer customer, VehicleDTO vehicleDTO) {
        this.customer = customer;
        this.vehicleDTO = vehicleDTO;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public VehicleDTO getVehicle() {
        return vehicleDTO;
    }

    public void setVehicle(VehicleDTO vehicleDTO) {
        this.vehicleDTO = vehicleDTO;
    }
}
