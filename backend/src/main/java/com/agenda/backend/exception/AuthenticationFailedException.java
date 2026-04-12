package com.agenda.backend.exception;

public class AuthenticationFailedException extends RuntimeException {

    public AuthenticationFailedException() {
        super("Credenciales inválidas");
    }
}
