package com.example.automobile.service.system.model;

import java.math.BigDecimal;
import java.util.List;

public class PreBillRequest {
    private String make;
    private String model;

    private List<String> selectedServiceDescriptions;

    private List<CustomServiceItemDTO> customItems;

    private BigDecimal estimatedPartsCost = BigDecimal.ZERO;


    public static class CustomServiceItemDTO {

        private String description;
        private BigDecimal cost = BigDecimal.ZERO;

        public CustomServiceItemDTO() {
        }

        public CustomServiceItemDTO(String description, BigDecimal cost) {
            this.description = description;
            this.cost = cost;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public BigDecimal getCost() {
            return cost;
        }

        public void setCost(BigDecimal cost) {
            this.cost = cost;
        }
    }

    public PreBillRequest() {
    }

    public PreBillRequest(String make, String model, List<String> selectedServiceDescriptions, List<CustomServiceItemDTO> customItems, BigDecimal estimatedPartsCost) {
        this.make = make;
        this.model = model;
        this.selectedServiceDescriptions = selectedServiceDescriptions;
        this.customItems = customItems;
        this.estimatedPartsCost = estimatedPartsCost;
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

    public List<String> getSelectedServiceDescriptions() {
        return selectedServiceDescriptions;
    }

    public void setSelectedServiceDescriptions(List<String> selectedServiceDescriptions) {
        this.selectedServiceDescriptions = selectedServiceDescriptions;
    }

    public List<CustomServiceItemDTO> getCustomItems() {
        return customItems;
    }

    public void setCustomItems(List<CustomServiceItemDTO> customItems) {
        this.customItems = customItems;
    }

    public BigDecimal getEstimatedPartsCost() {
        return estimatedPartsCost;
    }

    public void setEstimatedPartsCost(BigDecimal estimatedPartsCost) {
        this.estimatedPartsCost = estimatedPartsCost;
    }
}
