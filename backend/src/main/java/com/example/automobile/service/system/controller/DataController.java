package com.example.automobile.service.system.controller;

import com.example.automobile.service.system.entity.*;
import com.example.automobile.service.system.model.AppointmentSlot;
import com.example.automobile.service.system.service.AppointmentService;
import com.example.automobile.service.system.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/data")
@CrossOrigin("*")
public class DataController {
    @Autowired
    DataService dataService;
    @Autowired
    AppointmentService appointmentService;

    @GetMapping("/vehicle-types")
    private List<VehicleType> getVehicleTypes(){
        return dataService.getVehicleTypes();
    }
    @GetMapping("/vehicle-makes")
    private List<VehicleMake> getVehicleMakes(){
        return dataService.getVehicleMakes();
    }
    @GetMapping("/vehicle-models")
    private List<VehicleModel> getVehicleModels(){
        return dataService.getVehicleModels();
    }
    @GetMapping("/services")
    public ResponseEntity<List<ServiceFee>> getPredefinedServices(
            @RequestParam String makeName,
            @RequestParam String modelName) {
        return ResponseEntity.ok(dataService.getServicesForVehicle(makeName, modelName));
    }

    // Endpoint to get available appointment slots for a date
    @GetMapping("/appointment-slots")
    public ResponseEntity<List<AppointmentSlot>> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam List<String> serviceDescriptions, // List of service descriptions
            @RequestParam String makeName, // Make needed for service lookup
            @RequestParam String modelName // Model needed for service lookup
    ) {
        return ResponseEntity.ok(dataService.getAvailableAppointmentSlots(date, serviceDescriptions, makeName, modelName));
    }
    @GetMapping("/holidays")
    private List<Holiday> getHolidays(){
        return appointmentService.getHolidays();
    }
}
