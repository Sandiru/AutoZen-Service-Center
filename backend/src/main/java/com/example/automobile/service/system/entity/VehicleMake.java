package com.example.automobile.service.system.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class VehicleMake {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @ManyToOne
    @JoinColumn(name = "vehicle_type_id")
    @JsonBackReference
    private VehicleType vehicleType;

    @OneToMany(mappedBy = "vehicleMake", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<VehicleModel> models;

    public VehicleMake() {
    }

    public VehicleMake(Long id, String name, VehicleType vehicleType, List<VehicleModel> models) {
        this.id = id;
        this.name = name;
        this.vehicleType = vehicleType;
        this.models = models;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public List<VehicleModel> getModels() {
        return models;
    }

    public void setModels(List<VehicleModel> models) {
        this.models = models;
    }
}
