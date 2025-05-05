package com.example.automobile.service.system.model;

public class VehicleDTO {
    private Long id;
    private String vehicleId;
    private String make;
    private String model;
    private Integer year;
    private String chassisNo;

    public VehicleDTO() {
    }

    public VehicleDTO(Long id, String vehicleId, String make, String model, Integer year, String chassisNo) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.make = make;
        this.model = model;
        this.year = year;
        this.chassisNo = chassisNo;
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
}
