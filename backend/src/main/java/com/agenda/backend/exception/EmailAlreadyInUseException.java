package com.agenda.backend.exception;

public class EmailAlreadyInUseException extends RuntimeException {

    public EmailAlreadyInUseException() {
        super("El correo electrónico ya está registrado");
    }
}
