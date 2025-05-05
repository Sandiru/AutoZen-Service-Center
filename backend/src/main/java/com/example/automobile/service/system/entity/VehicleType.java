package com.example.automobile.service.system.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class VehicleType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "vehicleType", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<VehicleMake> makes;

    public VehicleType() {
    }

    public VehicleType(Long id, String name, List<VehicleMake> makes) {
        this.id = id;
        this.name = name;
        this.makes = makes;
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

    public List<VehicleMake> getMakes() {
        return makes;
    }

    public void setMakes(List<VehicleMake> makes) {
        this.makes = makes;
    }
}
