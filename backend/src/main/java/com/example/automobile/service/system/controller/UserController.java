package com.example.automobile.service.system.controller;

import com.example.automobile.service.system.entity.Appointment;
import com.example.automobile.service.system.entity.ServiceRecord;
import com.example.automobile.service.system.model.AppointmentBookingRequest;
import com.example.automobile.service.system.model.PreBillRequest;
import com.example.automobile.service.system.model.PreBillResponse;
import com.example.automobile.service.system.service.AppointmentService;
import com.example.automobile.service.system.service.PreBillService;
import com.example.automobile.service.system.service.ServiceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin("*")
public class UserController {
    @Autowired
    AppointmentService appointmentService;
    @Autowired
    ServiceHistoryService serviceHistoryService;
    @Autowired
    PreBillService preBillService;
    @PostMapping("/pre-bill")
    public ResponseEntity<PreBillResponse> calculatePreBill(@RequestBody PreBillRequest preBillRequest) {
        PreBillResponse response = preBillService.calculateEstimate(preBillRequest);
        return ResponseEntity.ok(response);
    }

    // --- Appointments ---
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentBookingRequest bookingRequest) {
        System.out.println(bookingRequest.getCustomerIdentifier());
        Appointment createdAppointment = appointmentService.bookAppointment(bookingRequest, bookingRequest.getCustomerIdentifier());
        return new ResponseEntity<>(createdAppointment, HttpStatus.CREATED);
    }

    // Get appointments for the logged-in user
    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getUserAppointments(String username) {
        List<Appointment> appointments = appointmentService.getAppointmentsForUser(username);
        return ResponseEntity.ok(appointments);
    }

    // --- Service History ---
    @GetMapping("/service-history")
    public ResponseEntity<List<ServiceRecord>> getServiceHistory(String username) {
        // The service needs to fetch vehicles associated with the user, then their history
        List<ServiceRecord> history = serviceHistoryService.getHistoryForUser(username);
        return ResponseEntity.ok(history);
    }
}
