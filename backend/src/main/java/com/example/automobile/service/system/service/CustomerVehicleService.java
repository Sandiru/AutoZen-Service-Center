package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.Customer;
import com.example.automobile.service.system.entity.Vehicle;
import com.example.automobile.service.system.entity.VehicleMake;
import com.example.automobile.service.system.entity.VehicleModel;
import com.example.automobile.service.system.exception.ResourceNotFoundException;
import com.example.automobile.service.system.model.CustomerVehicle;
import com.example.automobile.service.system.model.CustomerVehicleInput;
import com.example.automobile.service.system.model.VehicleDTO;
import com.example.automobile.service.system.repository.CustomerRepository;
import com.example.automobile.service.system.repository.VehicleMakeRepository;
import com.example.automobile.service.system.repository.VehicleModelRepository;
import com.example.automobile.service.system.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CustomerVehicleService {
    @Autowired
    VehicleRepository vehicleRepository;
    @Autowired
    CustomerRepository customerRepository;
    @Autowired
    VehicleMakeRepository vehicleMakeRepository;
    @Autowired
    VehicleModelRepository vehicleModelRepository;
    public Optional<CustomerVehicle> findCustomerAndVehicle(String vehicleIdentifier) {
        Vehicle vehicle = vehicleRepository.findByVehicleId(vehicleIdentifier);
        if (vehicle == null) {
            vehicle = vehicleRepository.findByChassisNo(vehicleIdentifier);
        }
        if(vehicle==null){
            return Optional.empty();
        }
        Customer customer = vehicle.getOwner();
        VehicleDTO vehicleDTO = new VehicleDTO();
        vehicleDTO.setId(vehicle.getId());
        vehicleDTO.setVehicleId(vehicle.getVehicleId());
        vehicleDTO.setModel(vehicle.getModel().getName());
        vehicleDTO.setMake(vehicle.getModel().getMakeName());
        vehicleDTO.setYear(vehicle.getYear());
        vehicleDTO.setChassisNo(vehicle.getChassisNo());
        CustomerVehicle customerVehicle=new CustomerVehicle(customer,vehicleDTO);

        /*Map<String, Object> result = new HashMap<>();
        result.put("customer", customer);
        result.put("vehicle", vehicle);*/
        return Optional.of(customerVehicle);
    }

    public CustomerVehicleInput saveOrUpdateCustomerAndVehicle(CustomerVehicleInput inputDTO) {

        // 1. Find or Create Customer
        Customer customer = customerRepository.findByNicNo(inputDTO.getNicNo());
        if (customer==null) {
            customer = customerRepository.findByPhoneNo(inputDTO.getPhoneNo());
        }


        if (customer!=null) {
            customer.setName(inputDTO.getCustomerName());
            customer.setAddress(inputDTO.getAddress());
            if (!customer.getPhoneNo().equals(inputDTO.getPhoneNo())) {
                if (customerRepository.existsByPhoneNo(inputDTO.getPhoneNo())) {
                    throw new IllegalArgumentException("Phone number " + inputDTO.getPhoneNo() + " is already associated with another customer.");
                }
                customer.setPhoneNo(inputDTO.getPhoneNo());
            }
            if (!customer.getNicNo().equals(inputDTO.getNicNo())) {
                if (customerRepository.existsByNicNo(inputDTO.getNicNo())) {
                    throw new IllegalArgumentException("NIC number " + inputDTO.getNicNo() + " is already associated with another customer.");
                }
                customer.setNicNo(inputDTO.getNicNo());
            }

        } else {
            // Create new customer
            if (customerRepository.existsByNicNo(inputDTO.getNicNo()) || customerRepository.existsByPhoneNo(inputDTO.getPhoneNo())) {
                throw new IllegalArgumentException("Customer with given NIC or Phone Number already exists.");
            }
            customer = new Customer();
            customer.setName(inputDTO.getCustomerName());
            customer.setAddress(inputDTO.getAddress());
            customer.setPhoneNo(inputDTO.getPhoneNo());
            customer.setNicNo(inputDTO.getNicNo());
        }
        customer = customerRepository.save(customer);

        // 2. Find or Create Vehicle
        Vehicle vehicle = vehicleRepository.findByVehicleId(inputDTO.getVehicleId());
        if (vehicle==null) {
            vehicle = vehicleRepository.findByChassisNo(inputDTO.getChassisNo());
        }

        if (vehicle!=null) {
            if (!vehicle.getOwner().getId().equals(customer.getId())) {
                vehicle.setOwner(customer);
            }
            VehicleMake make = findMake(inputDTO.getMake());
            VehicleModel model = findModel(inputDTO.getModel(), make);
            vehicle.setModel(model);
            vehicle.setYear(inputDTO.getYear());

            if (!vehicle.getVehicleId().equals(inputDTO.getVehicleId())) {
                if (vehicleRepository.existsByVehicleId(inputDTO.getVehicleId())) {
                    throw new IllegalArgumentException("Vehicle ID " + inputDTO.getVehicleId() + " is already in use.");
                }
                vehicle.setVehicleId(inputDTO.getVehicleId());
            }
            if (!vehicle.getChassisNo().equals(inputDTO.getChassisNo())) {
                if (vehicleRepository.existsByChassisNo(inputDTO.getChassisNo())) {
                    throw new IllegalArgumentException("Chassis Number " + inputDTO.getChassisNo() + " is already in use.");
                }
                vehicle.setChassisNo(inputDTO.getChassisNo());
            }

        } else {
            // Create new vehicle
            if (vehicleRepository.existsByVehicleId(inputDTO.getVehicleId()) || vehicleRepository.existsByChassisNo(inputDTO.getChassisNo())) {
                throw new IllegalArgumentException("Vehicle with given Vehicle ID or Chassis Number already exists.");
            }
            vehicle = new Vehicle();
            vehicle.setVehicleId(inputDTO.getVehicleId());
            vehicle.setChassisNo(inputDTO.getChassisNo());
            VehicleMake make = findMake(inputDTO.getMake());
            VehicleModel model = findModel(inputDTO.getModel(), make);
            vehicle.setModel(model);
            vehicle.setYear(inputDTO.getYear());
            vehicle.setOwner(customer);
        }
        vehicle = vehicleRepository.save(vehicle);
        return inputDTO;
    }

    public Customer updateCustomer(Long customerId, Customer customerDTO) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));


        Customer existingPhone = customerRepository.findByPhoneNo(customerDTO.getPhoneNo());
        if (existingPhone != null && !existingPhone.getId().equals(customerId)) {
            throw new IllegalArgumentException("Phone number already in use.");
        }

        Customer existingNic = customerRepository.findByNicNo(customerDTO.getNicNo());
        if (existingNic != null && !existingNic.getId().equals(customerId)) {
            throw new IllegalArgumentException("NIC number already in use.");
        }

        customer.setName(customerDTO.getName());
        customer.setAddress(customerDTO.getAddress());
        customer.setPhoneNo(customerDTO.getPhoneNo());
        customer.setNicNo(customerDTO.getNicNo());

        return customerRepository.save(customer);

    }


    public List<Vehicle> getVehicleSuggestions(String query) {
        return vehicleRepository.findSuggestions(query);
    }

    private VehicleMake findMake(String makeName) {
        return vehicleMakeRepository.findByName(makeName);
    }

    private VehicleModel findModel(String modelName, VehicleMake make) {
        return vehicleModelRepository.findByNameAndVehicleMake(modelName, make);
    }
}
