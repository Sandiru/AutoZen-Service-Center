package com.example.automobile.service.system.model;

import java.math.BigDecimal;
import java.util.List;

public class BillingRequest {
    private Long vehicleId;

    private List<String> selectedServiceDescriptions;

    private List<CustomServiceItem> customItems;

    private BigDecimal partsCost = BigDecimal.ZERO;
    private String processedByCashierName;

    public static class CustomServiceItem {
        private String description;

        private BigDecimal cost;

        public CustomServiceItem() {
        }

        public CustomServiceItem(String description, BigDecimal cost) {
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
    public BillingRequest() {
    }

    public BillingRequest(Long vehicleId, List<String> selectedServiceDescriptions, List<CustomServiceItem> customItems, BigDecimal partsCost, String processedByCashierName) {
        this.vehicleId = vehicleId;
        this.selectedServiceDescriptions = selectedServiceDescriptions;
        this.customItems = customItems;
        this.partsCost = partsCost;
        this.processedByCashierName = processedByCashierName;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public List<String> getSelectedServiceDescriptions() {
        return selectedServiceDescriptions;
    }

    public void setSelectedServiceDescriptions(List<String> selectedServiceDescriptions) {
        this.selectedServiceDescriptions = selectedServiceDescriptions;
    }

    public List<CustomServiceItem> getCustomItems() {
        return customItems;
    }

    public void setCustomItems(List<CustomServiceItem> customItems) {
        this.customItems = customItems;
    }

    public BigDecimal getPartsCost() {
        return partsCost;
    }

    public void setPartsCost(BigDecimal partsCost) {
        this.partsCost = partsCost;
    }

    public String getProcessedByCashierName() {
        return processedByCashierName;
    }

    public void setProcessedByCashierName(String processedByCashierName) {
        this.processedByCashierName = processedByCashierName;
    }
}
