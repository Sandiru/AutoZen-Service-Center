package com.example.automobile.service.system.controller;

import com.example.automobile.service.system.entity.Customer;
import com.example.automobile.service.system.entity.ServiceRecord;
import com.example.automobile.service.system.entity.Vehicle;
import com.example.automobile.service.system.model.BillingRequest;
import com.example.automobile.service.system.model.CustomerVehicleInput;
import com.example.automobile.service.system.model.ServiceRecordDTO;
import com.example.automobile.service.system.service.BillingService;
import com.example.automobile.service.system.service.CustomerVehicleService;
import com.example.automobile.service.system.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cashier")
@CrossOrigin("*")
public class CashierController {
    @Autowired
    CustomerVehicleService customerVehicleService;
    @Autowired
    BillingService billingService;
    @Autowired
    ServiceHistoryService serviceHistoryService;

    @GetMapping("/customer-vehicle")
    public ResponseEntity<?> findCustomerVehicle(
            @RequestParam(required = true) String vehicleIdentifier) {
        return customerVehicleService.findCustomerAndVehicle(vehicleIdentifier)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/customer-vehicle")
    public ResponseEntity<?> addOrUpdateCustomerVehicle(@RequestBody CustomerVehicleInput inputDTO) {
        // Service layer handles the logic of finding/creating/updating
        CustomerVehicleInput savedData = customerVehicleService.saveOrUpdateCustomerAndVehicle(inputDTO);
        return new ResponseEntity<>(savedData, HttpStatus.OK); // Return OK for both create/update success
    }

    // Separate endpoint for just updating customer details if needed (using Customer ID)
    @PutMapping("/customers/{customerId}")
    public ResponseEntity<Customer> updateCustomerData(@PathVariable Long customerId, @RequestBody Customer customerDTO) {
        return ResponseEntity.ok(customerVehicleService.updateCustomer(customerId, customerDTO));
    }

    // Endpoint for providing suggestions as cashier types in the search box
    @GetMapping("/customer-vehicle/suggestions")
    public ResponseEntity<List<Vehicle>> getVehicleSuggestions(@RequestParam String query) {
        return ResponseEntity.ok(customerVehicleService.getVehicleSuggestions(query));
    }


    // --- Billing ---
    @PostMapping("/billing/calculate")
    public ResponseEntity<ServiceRecord> calculateAndFinalizeBill(@RequestBody BillingRequest billingRequest) {
        // The service will calculate the total, create the ServiceRecord, and return it
        ServiceRecord finalizedBill = billingService.calculateAndSaveBill(billingRequest);
        return new ResponseEntity<>(finalizedBill, HttpStatus.CREATED);
    }

    // --- Print Receipt ---
    @GetMapping("/billing/receipt/{serviceRecordId}")
    public ResponseEntity<String> printReceipt(@PathVariable Long serviceRecordId) {
        // TODO: Implement receipt generation and potentially printing logic
        String receiptContent = billingService.generateReceipt(serviceRecordId);
        // This is just an example response, could be JSON, PDF stream, etc.
        return ResponseEntity.ok("Receipt generated for Service Record: " + serviceRecordId + "\n" + receiptContent);
    }

    // --- Service History ---
    @GetMapping("/history")
    public ResponseEntity<List<ServiceRecordDTO>> getVehicleHistory(@RequestParam(required = true) String vehicleIdentifier) {
        List<ServiceRecordDTO> history = serviceHistoryService.getHistoryByVehicleIdentifier(vehicleIdentifier);
        return ResponseEntity.ok(history);
    }


    @GetMapping("/history/search")
    public ResponseEntity<List<ServiceRecordDTO>> searchVehicleHistory(@RequestParam(required = true) String query) {
        List<ServiceRecordDTO> history = serviceHistoryService.searchHistory(query);
        return ResponseEntity.ok(history);
    }
}
