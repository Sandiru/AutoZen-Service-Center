package com.example.automobile.service.system.exception;

import org.springframework.http.HttpStatus;
//import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.UNAUTHORIZED) // 401 Unauthorized
public class AuthenticationFailedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AuthenticationFailedException(String msg, Throwable cause) {
        super(msg, cause);
    }

    public AuthenticationFailedException(String msg) {
        super(msg);
    }
}
