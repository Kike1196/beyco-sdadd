// src/main/java/com/beyco/app/models/EmpresaDTO.java
package com.beyco.app.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EmpresaDTO {
    @JsonProperty("id")
    private int id;
    
    @JsonProperty("nombre")
    private String nombre;

    // Constructor vacío (obligatorio para Jackson)
    public EmpresaDTO() {}

    // Constructor
    public EmpresaDTO(int id, String nombre) {
        this.id = id;
        this.nombre = nombre;
    }

    // Getters
    public int getId() { return id; }
    public String getNombre() { return nombre; }

    // Setters
    public void setId(int id) { this.id = id; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}