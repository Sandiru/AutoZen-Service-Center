package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.ServiceFee;
import com.example.automobile.service.system.entity.VehicleMake;
import com.example.automobile.service.system.entity.VehicleModel;
import com.example.automobile.service.system.entity.VehicleType;
import com.example.automobile.service.system.model.AppointmentSlot;
import com.example.automobile.service.system.repository.ServiceFeeRepository;
import com.example.automobile.service.system.repository.VehicleMakeRepository;
import com.example.automobile.service.system.repository.VehicleModelRepository;
import com.example.automobile.service.system.repository.VehicleTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
public class DataService {
    @Autowired
    VehicleTypeRepository vehicleTypeRepository;
    @Autowired
    VehicleMakeRepository vehicleMakeRepository;
    @Autowired
    VehicleModelRepository vehicleModelRepository;
    @Autowired
    ServiceFeeRepository serviceFeeRepository;
    @Autowired
    AppointmentService appointmentService;

    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }

    public List<VehicleType> getVehicleTypes(){
        return vehicleTypeRepository.findAll();
    }
    public List<VehicleMake> getVehicleMakes(){
        return vehicleMakeRepository.findAll();
    }
    public List<VehicleModel> getVehicleModels(){
        return vehicleModelRepository.findAll();
    }
    public VehicleType addVehicleType(VehicleType vehicleType){
        return vehicleTypeRepository.save(vehicleType);
    }
    public VehicleMake addVehicleMake(VehicleMake vehicleMake){
        return vehicleMakeRepository.save(vehicleMake);
    }
    public VehicleModel addVehicleModel(VehicleModel vehicleModel){
        VehicleMake vehicleMake=vehicleMakeRepository.findByName(vehicleModel.getMakeName());
        vehicleModel.setVehicleMake(vehicleMake);
        return vehicleModelRepository.save(vehicleModel);
    }
    public List<VehicleModel> getModelsByMake(String makeName){
        VehicleMake vehicleMake=vehicleMakeRepository.findByName(makeName);
        return vehicleModelRepository.findByVehicleMake(vehicleMake);
    }
    public VehicleModel updateVehicleModel(Long modelId, VehicleModel vehicleModel) {
        VehicleModel existingModel = vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleModel not found with id: " + modelId));

        VehicleMake vehicleMake=vehicleMakeRepository.findByName(vehicleModel.getMakeName());
        // Update fields
        existingModel.setName(vehicleModel.getName());
        existingModel.setVehicleMake(vehicleMake);

        return vehicleModelRepository.save(existingModel);
    }

    public void deleteVehicleModel(Long modelId) {
        VehicleModel model = vehicleModelRepository.findById(modelId)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleModel not found with id: " + modelId));

        vehicleModelRepository.delete(model);
    }
    public List<ServiceFee> getServicesForVehicle(String makeName, String modelName) {
        VehicleMake make = vehicleMakeRepository.findByName(makeName);
        VehicleModel model = vehicleModelRepository.findByNameAndVehicleMake(modelName, make);
        return serviceFeeRepository.findByModel(model.getName());
    }
    public List<AppointmentSlot> getAvailableAppointmentSlots(LocalDate date, List<String> serviceDescriptions, String makeName, String modelName) {

        // Find the vehicle model
        VehicleMake make = vehicleMakeRepository.findByName(makeName);
        VehicleModel model = vehicleModelRepository.findByNameAndVehicleMake(modelName, make);
        // Calculate total duration needed
        int totalDuration = 0;
        if (serviceDescriptions != null && !serviceDescriptions.isEmpty()) {
            for (String desc : serviceDescriptions) {
                ServiceFee fee = serviceFeeRepository.findByDescriptionAndModel(desc, model.getName());
                totalDuration += fee.getDurationMinutes();
            }
        } else {
            return Collections.emptyList();
        }

        return appointmentService.getAvailableSlots(date, totalDuration);
    }
}

