package com.agenda.backend.controller.dto;

import com.agenda.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class RegisterUserRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo invalido")
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, message = "La contrasena debe tener al menos 8 caracteres")
    private String password;

    private Role role;
    
    // Campos extra para paciente
    private String phone;
    private LocalDate birthDate;
}
