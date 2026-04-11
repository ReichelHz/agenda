package com.agenda.backend.controller.dto;

import com.agenda.backend.model.Appointment;
import com.agenda.backend.model.AppointmentStatus;
import com.agenda.backend.model.LocationType;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentResponse {
    private Long id;
    private String reservationCode;
    private String patientName;
    private String patientEmail;
    private String professionalName;
    private String serviceName;
    private LocalDate date;
    private LocalTime time;
    private AppointmentStatus status;
    private LocationType locationType;
    private String address;
    private BigDecimal totalPrice;

    public static AppointmentResponse from(Appointment appointment) {
        AppointmentResponse response = new AppointmentResponse();
        response.setId(appointment.getId());
        response.setReservationCode(appointment.getReservationCode());
        response.setPatientName(appointment.getPatientName());
        response.setPatientEmail(appointment.getPatientEmail());
        response.setProfessionalName(appointment.getProfessional().getUser().getName());
        response.setServiceName(appointment.getService().getName());
        response.setDate(appointment.getDate());
        response.setTime(appointment.getTime());
        response.setStatus(appointment.getStatus());
        response.setLocationType(appointment.getLocationType());
        response.setAddress(appointment.getAddress());
        response.setTotalPrice(appointment.getTotalPrice());
        return response;
    }
}
