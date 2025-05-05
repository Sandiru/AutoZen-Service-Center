package com.example.automobile.service.system.service;

import com.example.automobile.service.system.entity.UserAccount;
import com.example.automobile.service.system.exception.AuthenticationFailedException;
import com.example.automobile.service.system.model.AuthRequest;
import com.example.automobile.service.system.model.AuthResponse;
import com.example.automobile.service.system.model.RegisterRequest;
import com.example.automobile.service.system.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    UserAccountRepository userAccountRepository;


    public AuthResponse login(AuthRequest authRequest) {
        UserAccount user = userAccountRepository.findByUsername(authRequest.getUsername());
        if (user==null && !user.getPassword().equals(authRequest.getPassword())) {
            throw new AuthenticationFailedException("Invalid username or password.");
        }
        String token = "Token"+user.getRole();

        return new AuthResponse(user.getUsername(), user.getRole(), token);
    }

    public String registerUser(RegisterRequest registerRequest) {
        if (userAccountRepository.existsByUsername(registerRequest.getUsername())) {
            throw new IllegalArgumentException("Username '" + registerRequest.getUsername() + "' is already taken.");
        }

        UserAccount newUser = new UserAccount();
        newUser.setUsername(registerRequest.getUsername());
        newUser.setPassword(registerRequest.getPassword());
        newUser.setRole(registerRequest.getRole());
        userAccountRepository.save(newUser);
        return "User Successfully registered";
    }
}
