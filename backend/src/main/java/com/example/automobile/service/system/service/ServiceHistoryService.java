package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.Customer;
import com.example.automobile.service.system.entity.UserAccount;
import com.example.automobile.service.system.entity.ServiceRecord;
import com.example.automobile.service.system.entity.Vehicle;
import com.example.automobile.service.system.model.ServiceRecordDTO;
import com.example.automobile.service.system.repository.CustomerRepository;
import com.example.automobile.service.system.repository.UserAccountRepository;
import com.example.automobile.service.system.repository.ServiceRecordRepository;
import com.example.automobile.service.system.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Arrays.stream;

@Service
public class ServiceHistoryService {
    @Autowired
    VehicleRepository vehicleRepository;
    @Autowired
    ServiceRecordRepository serviceRecordRepository;
    @Autowired
    UserAccountRepository roleRepository;

    @Autowired
    CustomerRepository customerRepository;
    public List<ServiceRecordDTO> getHistoryByVehicleIdentifier(String vehicleIdentifier) {
        List<ServiceRecord> records;
        Vehicle vehicleOpt = vehicleRepository.findByVehicleId(vehicleIdentifier);
        if (vehicleOpt != null) {
            records = serviceRecordRepository.findByVehicleOrderByServiceDateTimeDesc(vehicleOpt);
        } else {
            vehicleOpt = vehicleRepository.findByChassisNo(vehicleIdentifier);
            if (vehicleOpt != null) {
                records = serviceRecordRepository.findByVehicleOrderByServiceDateTimeDesc(vehicleOpt);
            } else {
                return Collections.emptyList(); // Vehicle not found
            }
        }

        return records.stream()
                .map(this::toDTO) // map to DTOs
                .collect(Collectors.toList());
    }


    private ServiceRecordDTO toDTO(ServiceRecord record) {
        Vehicle vehicle = record.getVehicle();
        return new ServiceRecordDTO(
                record.getId(),
                vehicle.getVehicleId(),
                vehicle.getModel().getMakeName(),
                vehicle.getModel().getName(),
                record.getServiceDateTime(),
                record.getServiceDetails(),
                record.getTotalCost(),
                record.getProcessedByCashier()!=null?record.getProcessedByCashier().getName():null,
                record.getAppointment() != null ? record.getAppointment().getId() : null
        );
    }


    public List<ServiceRecord> getHistoryForUser(String username) {
        UserAccount user = roleRepository.findByUsername(username);

        Customer customer = customerRepository.findByNicNo(username);
        if (customer==null) {
            return Collections.emptyList();
        }

        // Find all vehicles owned by the customer
        List<Vehicle> vehicles = vehicleRepository.findByOwner(customer);
        if (vehicles.isEmpty()) {
            return Collections.emptyList();
        }

        // Fetch service records for all owned vehicles
        return vehicles.stream()
                .flatMap(vehicle -> serviceRecordRepository.findByVehicleOrderByServiceDateTimeDesc(vehicle).stream())
                .sorted((r1, r2) -> r2.getServiceDateTime().compareTo(r1.getServiceDateTime()))
                .collect(Collectors.toList());
    }

    public List<ServiceRecordDTO> searchHistory(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        // Use the combined search method from the repository
        List<ServiceRecord> records = serviceRecordRepository.searchHistory(query);
        return records.stream()
                .map(this::toDTO) // map to DTOs
                .collect(Collectors.toList());
    }
}
