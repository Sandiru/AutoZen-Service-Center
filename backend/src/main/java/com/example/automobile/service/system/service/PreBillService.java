package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.ServiceFee;
import com.example.automobile.service.system.entity.VehicleMake;
import com.example.automobile.service.system.entity.VehicleModel;
import com.example.automobile.service.system.model.PreBillRequest;
import com.example.automobile.service.system.model.PreBillResponse;
import com.example.automobile.service.system.repository.ServiceFeeRepository;
import com.example.automobile.service.system.repository.VehicleMakeRepository;
import com.example.automobile.service.system.repository.VehicleModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PreBillService {
    @Autowired
    VehicleMakeRepository vehicleMakeRepository;
    @Autowired
    VehicleModelRepository vehicleModelRepository;
    @Autowired
    ServiceFeeRepository serviceFeeRepository;
    public PreBillResponse calculateEstimate(PreBillRequest requestDTO) {

        VehicleMake make = vehicleMakeRepository.findByName(requestDTO.getMake());
        VehicleModel model = vehicleModelRepository.findByNameAndVehicleMake(requestDTO.getModel(), make);

        BigDecimal totalEstimate = BigDecimal.ZERO;
        List<PreBillResponse.ServiceCostDetail> breakdown = new ArrayList<>();

        // 1. Calculate cost from predefined services
        if (requestDTO.getSelectedServiceDescriptions() != null && !requestDTO.getSelectedServiceDescriptions().isEmpty()) {
            List<ServiceFee> predefinedFees = serviceFeeRepository.findByModel(model.getName());
            Map<String, BigDecimal> feeMap = predefinedFees.stream()
                    .collect(Collectors.toMap(ServiceFee::getDescription, ServiceFee::getFee));

            for (String desc : requestDTO.getSelectedServiceDescriptions()) {
                BigDecimal fee = feeMap.get(desc);
                if (fee != null) {
                    totalEstimate = totalEstimate.add(fee);
                    breakdown.add(new PreBillResponse.ServiceCostDetail(desc, fee.setScale(2)));
                }
            }
        }

        // 2. Calculate cost from custom items
        if (requestDTO.getCustomItems() != null && !requestDTO.getCustomItems().isEmpty()) {
            for (PreBillRequest.CustomServiceItemDTO item : requestDTO.getCustomItems()) {
                if (item.getCost() != null && item.getCost().compareTo(BigDecimal.ZERO) > 0 && item.getDescription() != null && !item.getDescription().isBlank()) {
                    totalEstimate = totalEstimate.add(item.getCost());
                    breakdown.add(new PreBillResponse.ServiceCostDetail(item.getDescription(), item.getCost().setScale(2)));

                }
            }
        }

        // 3. Add estimated parts cost
        BigDecimal partsCost = requestDTO.getEstimatedPartsCost() != null ? requestDTO.getEstimatedPartsCost() : BigDecimal.ZERO;
        if (partsCost.compareTo(BigDecimal.ZERO) > 0) {
            totalEstimate = totalEstimate.add(partsCost);
            breakdown.add(new PreBillResponse.ServiceCostDetail("Estimated Parts Cost", partsCost.setScale(2)));

        }

        return new PreBillResponse(totalEstimate.setScale(2), breakdown, partsCost.setScale(2));
    }
}
