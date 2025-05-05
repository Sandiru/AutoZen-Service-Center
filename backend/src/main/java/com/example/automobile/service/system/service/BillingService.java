package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.*;
import com.example.automobile.service.system.model.BillingRequest;
import com.example.automobile.service.system.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class BillingService {
    @Autowired
    ServiceFeeRepository serviceFeeRepository;
    @Autowired
    PartRepository partRepository;
    @Autowired
    VehicleRepository vehicleRepository;
    @Autowired
    ServiceRecordRepository serviceRecordRepository;
    @Autowired
    CashierRepository cashierRepository;

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public List<ServiceFee> getServiceFees(){
        return serviceFeeRepository.findAll();
    }
    public ServiceFee addServiceFee(ServiceFee serviceFee){
        return serviceFeeRepository.save(serviceFee);
    }
    public ServiceFee updateServiceFee(Long feeId,ServiceFee serviceFee){
        ServiceFee existingFee = serviceFeeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceFee not found with id: " + feeId));

        // Update the fields
        existingFee.setFee(serviceFee.getFee());
        existingFee.setDescription(serviceFee.getDescription());
        existingFee.setMake(serviceFee.getMake());
        existingFee.setModel(serviceFee.getModel());
        existingFee.setDurationMinutes(serviceFee.getDurationMinutes());

        // Save and return the updated entity
        return serviceFeeRepository.save(existingFee);
    }
    public void deleteServiceFee(Long feeId) {
        ServiceFee existingFee = serviceFeeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceFee not found with id: " + feeId));

        serviceFeeRepository.delete(existingFee);
    }
    public List<Part> getPartsPrices(){
        return partRepository.findAll();
    }
    public ServiceRecord calculateAndSaveBill(BillingRequest billingRequest) {

        Vehicle vehicle = vehicleRepository.findById(billingRequest.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle id"));

        BigDecimal totalCost = BigDecimal.ZERO;
        StringBuilder detailsBuilder = new StringBuilder();

        // 1. Calculate cost from predefined services
        if (billingRequest.getSelectedServiceDescriptions() != null && !billingRequest.getSelectedServiceDescriptions().isEmpty()) {
            List<ServiceFee> predefinedFees = serviceFeeRepository.findByModel(vehicle.getModel().getName());
            Map<String, BigDecimal> feeMap = predefinedFees.stream()
                    .collect(Collectors.toMap(ServiceFee::getDescription, ServiceFee::getFee));

            for (String desc : billingRequest.getSelectedServiceDescriptions()) {
                BigDecimal fee = feeMap.get(desc);
                if (fee != null) {
                    totalCost = totalCost.add(fee);
                    detailsBuilder.append(desc).append(": Rs.").append(fee.setScale(2)).append("\n");
                }
            }
        }

        // 2. Calculate cost from custom items
        if (billingRequest.getCustomItems() != null && !billingRequest.getCustomItems().isEmpty()) {
            for (BillingRequest.CustomServiceItem item : billingRequest.getCustomItems()) {
                if (item.getCost() != null && item.getCost().compareTo(BigDecimal.ZERO) > 0 && item.getDescription() != null && !item.getDescription().isBlank()) {
                    totalCost = totalCost.add(item.getCost());
                    detailsBuilder.append(item.getDescription()).append(": Rs.").append(item.getCost().setScale(2)).append("\n");
                }
            }
        }

        // 3. Add parts cost
        if (billingRequest.getPartsCost() != null && billingRequest.getPartsCost().compareTo(BigDecimal.ZERO) > 0) {
            totalCost = totalCost.add(billingRequest.getPartsCost());
            detailsBuilder.append("Parts Cost: Rs.").append(billingRequest.getPartsCost().setScale(2)).append("\n");
        }

        // 4. Create and Save Service Record
        ServiceRecord serviceRecord = new ServiceRecord();
        serviceRecord.setVehicle(vehicle);
        serviceRecord.setServiceDateTime(LocalDateTime.now());
        serviceRecord.setTotalCost(totalCost.setScale(2));
        serviceRecord.setServiceDetails(detailsBuilder.toString().trim());
        return serviceRecordRepository.save(serviceRecord);


    }

    public String generateReceipt(Long serviceRecordId) {
        ServiceRecord record = serviceRecordRepository.findById(serviceRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceRecord id"));

        Vehicle vehicle = record.getVehicle();
        Customer customer = vehicle.getOwner();

        // Receipt generation
        StringBuilder receipt = new StringBuilder();
        receipt.append("========================================\n");
        receipt.append("         AutoZen Services Receipt       \n");
        receipt.append("========================================\n");
        receipt.append("Service Record ID: ").append(record.getId()).append("\n");
        receipt.append("Date & Time: ").append(record.getServiceDateTime().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))).append("\n");
        receipt.append("----------------------------------------\n");
        receipt.append("Customer Information:\n");
        receipt.append("  Name: ").append(customer.getName()).append("\n");
        receipt.append("  Phone: ").append(customer.getPhoneNo()).append("\n");
        receipt.append("  NIC: ").append(customer.getNicNo()).append("\n");
        receipt.append("----------------------------------------\n");
        receipt.append("Vehicle Information:\n");
        receipt.append("  ID: ").append(vehicle.getVehicleId()).append("\n");
        receipt.append("  Make: ").append(vehicle.getModel().getVehicleMake().getName()).append("\n");
        receipt.append("  Model: ").append(vehicle.getModel().getName()).append("\n");
        receipt.append("  Year: ").append(vehicle.getYear()).append("\n");
        receipt.append("  Chassis: ").append(vehicle.getChassisNo()).append("\n");
        receipt.append("----------------------------------------\n");
        receipt.append("Services & Parts:\n");

        if (record.getServiceDetails() != null && !record.getServiceDetails().isBlank()) {
            Stream.of(record.getServiceDetails().split("\n"))
                    .filter(line -> !line.trim().isEmpty())
                    .forEach(line -> receipt.append("  ").append(line).append("\n"));
        } else {
            receipt.append("  (No itemized details available)\n");
        }
        receipt.append("----------------------------------------\n");
        receipt.append(String.format("Total Amount: Rs.%.2f%n", record.getTotalCost()));
        receipt.append("========================================\n");
        receipt.append("          Thank you for choosing        \n");
        receipt.append("            AutoZen Services!           \n");
        receipt.append("========================================\n");

        return receipt.toString();
    }
}
