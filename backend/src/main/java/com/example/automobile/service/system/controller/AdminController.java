package com.example.automobile.service.system.controller;

import com.example.automobile.service.system.entity.*;
import com.example.automobile.service.system.model.AppointmentFilter;
import com.example.automobile.service.system.model.AppointmentStatus;
import com.example.automobile.service.system.service.AppointmentService;
import com.example.automobile.service.system.service.BillingService;
import com.example.automobile.service.system.service.CashierService;
import com.example.automobile.service.system.service.DataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {
    @Autowired
    AppointmentService appointmentService;
    @Autowired
    DataService vehicleService;
    @Autowired
    BillingService billCalculationService;
    @Autowired
    CashierService cashierService;

    @GetMapping("/holidays")
    private List<Holiday> getHolidays(){
        return appointmentService.getHolidays();
    }

    @PostMapping("/holidays")
    private Holiday addHoliday(@RequestBody Holiday holiday){
        return appointmentService.setHolidays(holiday);
    }

    @DeleteMapping("/holidays/{id}")
    private String getAvailableSlots(@PathVariable Long id){
        return appointmentService.removeHolidays(id);
    }

    @PutMapping("/holidays/{id}")
    public ResponseEntity<Holiday> updateHoliday(@PathVariable Long id, @RequestBody Holiday holiday) {
        return ResponseEntity.ok(appointmentService.updateHoliday(id, holiday));
    }


    @PostMapping("/vehicles/types")
    public ResponseEntity<VehicleType> addVehicleType(@RequestBody VehicleType vehicleType) {
        return new ResponseEntity<>(vehicleService.addVehicleType(vehicleType), HttpStatus.CREATED);
    }

    @GetMapping("/vehicles/types")
    public ResponseEntity<List<VehicleType>> getAllVehicleTypes() {
        return ResponseEntity.ok(vehicleService.getVehicleTypes());
    }

    @PostMapping("/vehicles/makes")
    public ResponseEntity<VehicleMake> addVehicleMake(@RequestBody VehicleMake vehicleMake) {
        return new ResponseEntity<>(vehicleService.addVehicleMake(vehicleMake), HttpStatus.CREATED);
    }

    @GetMapping("/vehicles/makes")
    public ResponseEntity<List<VehicleMake>> getAllVehicleMakes() {
        return ResponseEntity.ok(vehicleService.getVehicleMakes());
    }

    @PostMapping("/vehicles/models")
    public ResponseEntity<VehicleModel> addVehicleModel(@RequestBody VehicleModel vehicleModel) {
        return new ResponseEntity<>(vehicleService.addVehicleModel(vehicleModel), HttpStatus.CREATED);
    }

    @GetMapping("/vehicles/models")
    public ResponseEntity<List<VehicleModel>> getModelsByMake(@RequestParam String makeName) {
        return ResponseEntity.ok(vehicleService.getModelsByMake(makeName));
    }

    @GetMapping("/vehicles/catalog")
    public ResponseEntity<List<VehicleType>> getVehicleCatalog() {
        return ResponseEntity.ok(vehicleService.getVehicleTypes());
    }

    @PutMapping("/vehicles/models/{modelId}")
    public ResponseEntity<VehicleModel> updateVehicleModel(@PathVariable Long modelId, @RequestBody VehicleModel vehicleModel) {
        return ResponseEntity.ok(vehicleService.updateVehicleModel(modelId, vehicleModel));
    }

    @DeleteMapping("/vehicles/models/{modelId}")
    public ResponseEntity<Void> deleteVehicleModel(@PathVariable Long modelId) {
        vehicleService.deleteVehicleModel(modelId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/service-fees")
    public ResponseEntity<ServiceFee> addServiceFee(@RequestBody ServiceFee serviceFee) {
        return new ResponseEntity<>(billCalculationService.addServiceFee(serviceFee), HttpStatus.CREATED);
    }

    @GetMapping("/service-fees")
    public ResponseEntity<List<ServiceFee>> getAllServiceFees() {
        return ResponseEntity.ok(billCalculationService.getServiceFees());
    }

    @PutMapping("/service-fees/{feeId}")
    public ResponseEntity<ServiceFee> updateServiceFee(@PathVariable Long feeId, @RequestBody ServiceFee serviceFee) {
        return ResponseEntity.ok(billCalculationService.updateServiceFee(feeId, serviceFee));
    }

    @DeleteMapping("/service-fees/{feeId}")
    public ResponseEntity<Void> deleteServiceFee(@PathVariable Long feeId) {
        billCalculationService.deleteServiceFee(feeId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cashiers")
    public ResponseEntity<Cashier> addCashier(@RequestBody Cashier cashier) {
        System.out.println(cashier.getPhoneNo());
        return new ResponseEntity<>(cashierService.addCashier(cashier), HttpStatus.CREATED);
    }

    @GetMapping("/cashiers")
    public ResponseEntity<List<Cashier>> getAllCashiers() {
        return ResponseEntity.ok(cashierService.getAllCashiers());
    }

    @PutMapping("/cashiers/{cashierId}")
    public ResponseEntity<Cashier> updateCashier(@PathVariable Long cashierId, @RequestBody Cashier cashier) {
        return ResponseEntity.ok(cashierService.updateCashier(cashierId, cashier));
    }

    @DeleteMapping("/cashiers/{cashierId}")
    public ResponseEntity<Void> deleteCashier(@PathVariable Long cashierId) {
        cashierService.deleteCashier(cashierId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String vehicleId, // Search by internal vehicle ID
            @RequestParam(required = false) String chassisNo,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) AppointmentStatus status
    ) {
        AppointmentFilter filters = new AppointmentFilter(startDate, endDate, vehicleId, chassisNo, customerName, status);
        return ResponseEntity.ok(appointmentService.filterAppointments(filters));
    }

}
