package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.Cashier;
import com.example.automobile.service.system.repository.CashierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CashierService {
    @Autowired
    CashierRepository cashierRepository;
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
    public Cashier addCashier(Cashier cashier) {
        return cashierRepository.save(cashier);
    }

    public List<Cashier> getAllCashiers() {
        return cashierRepository.findAll();
    }

    public Cashier updateCashier(Long cashierId, Cashier cashierDetails) {
        Cashier existingCashier = cashierRepository.findById(cashierId)
                .orElseThrow(() -> new ResourceNotFoundException("Cashier not found with ID: " + cashierId));

        existingCashier.setName(cashierDetails.getName());
        existingCashier.setEmail(cashierDetails.getEmail());
        existingCashier.setPhoneNo(cashierDetails.getPhoneNo());

        return cashierRepository.save(existingCashier);
    }

    public void deleteCashier(Long cashierId) {
        if (!cashierRepository.existsById(cashierId)) {
            throw new ResourceNotFoundException("Cashier not found with ID: " + cashierId);
        }
        cashierRepository.deleteById(cashierId);
    }
}
