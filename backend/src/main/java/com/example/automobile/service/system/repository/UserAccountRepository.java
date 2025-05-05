package com.example.automobile.service.system.repository;


import com.example.automobile.service.system.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount,Long> {
    UserAccount findByUsernameAndPassword(String username, String Password);
    UserAccount findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByUsernameAndPassword(String username,String password);
}
