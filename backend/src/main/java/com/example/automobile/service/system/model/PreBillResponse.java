package com.example.automobile.service.system.model;

import java.math.BigDecimal;
import java.util.List;

public class PreBillResponse {
    private BigDecimal estimatedTotal;
    private List<ServiceCostDetail> serviceBreakdown;
    private BigDecimal partsCostEstimate;

    public static class ServiceCostDetail {
        private String description;
        private BigDecimal cost;

        public ServiceCostDetail() {
        }

        public ServiceCostDetail(String description, BigDecimal cost) {
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
    public PreBillResponse() {
    }

    public PreBillResponse(BigDecimal estimatedTotal, List<ServiceCostDetail> serviceBreakdown, BigDecimal partsCostEstimate) {
        this.estimatedTotal = estimatedTotal;
        this.serviceBreakdown = serviceBreakdown;
        this.partsCostEstimate = partsCostEstimate;
    }

    public BigDecimal getEstimatedTotal() {
        return estimatedTotal;
    }

    public void setEstimatedTotal(BigDecimal estimatedTotal) {
        this.estimatedTotal = estimatedTotal;
    }

    public List<ServiceCostDetail> getServiceBreakdown() {
        return serviceBreakdown;
    }

    public void setServiceBreakdown(List<ServiceCostDetail> serviceBreakdown) {
        this.serviceBreakdown = serviceBreakdown;
    }

    public BigDecimal getPartsCostEstimate() {
        return partsCostEstimate;
    }

    public void setPartsCostEstimate(BigDecimal partsCostEstimate) {
        this.partsCostEstimate = partsCostEstimate;
    }
}
