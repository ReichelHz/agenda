package com.agenda.backend.model;

public enum ServiceModality {
    PRESENCIAL,
    VIRTUAL,
    AMBAS;

    public boolean allowsPresencial() {
        return this == PRESENCIAL || this == AMBAS;
    }

    public boolean allowsVirtual() {
        return this == VIRTUAL || this == AMBAS;
    }
}
