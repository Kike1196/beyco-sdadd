package com.beyco.app.models;

import java.math.BigDecimal;
import java.time.LocalDate;

public class HistorialCurso {
    private int id;
    private String nombre;
    private String stps;
    private int horas;
    private LocalDate fecha;
    private String instructor;
    private String empresa;
    private String lugar;
    private BigDecimal costo;
    private String status;

    // Constructor vacío (IMPORTANTE para Jackson)
    public HistorialCurso() {
    }

    // Constructor con parámetros
    public HistorialCurso(int id, String nombre, String stps, int horas, LocalDate fecha,
                          String instructor, String empresa, String lugar,
                          BigDecimal costo, String status) {
        this.id = id;
        this.nombre = nombre;
        this.stps = stps;
        this.horas = horas;
        this.fecha = fecha;
        this.instructor = instructor;
        this.empresa = empresa;
        this.lugar = lugar;
        this.costo = costo;
        this.status = status;
    }

    // Getters y Setters (IMPORTANTE para Jackson)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getStps() { return stps; }
    public void setStps(String stps) { this.stps = stps; }
    
    public int getHoras() { return horas; }
    public void setHoras(int horas) { this.horas = horas; }
    
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    
    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
    
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    
    public BigDecimal getCosto() { return costo; }
    public void setCosto(BigDecimal costo) { this.costo = costo; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}