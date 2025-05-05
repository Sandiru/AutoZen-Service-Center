package com.example.automobile.service.system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "model_id", nullable = false)
    @JsonBackReference
    private VehicleModel model;
    private Integer year;
    private String chassisNo;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonBackReference
    private Customer owner;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ServiceRecord> serviceHistory;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Appointment> appointments;
    public Vehicle() {
    }

    public Vehicle(Long id, String vehicleId, VehicleModel model, Integer year, String chassisNo, Customer owner, List<ServiceRecord> serviceHistory, List<Appointment> appointments) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.model = model;
        this.year = year;
        this.chassisNo = chassisNo;
        this.owner = owner;
        this.serviceHistory = serviceHistory;
        this.appointments = appointments;
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

    public VehicleModel getModel() {
        return model;
    }

    public void setModel(VehicleModel model) {
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

    public Customer getOwner() {
        return owner;
    }

    public void setOwner(Customer owner) {
        this.owner = owner;
    }

    public List<ServiceRecord> getServiceHistory() {
        return serviceHistory;
    }

    public void setServiceHistory(List<ServiceRecord> serviceHistory) {
        this.serviceHistory = serviceHistory;
    }

    public List<Appointment> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<Appointment> appointments) {
        this.appointments = appointments;
    }
}
