package com.beyco.app.models;

import java.math.BigDecimal;
import java.time.LocalDate;

public class Curso {
    private int id;
    private String nombre;
    private String stps;
    private int horas;
    private LocalDate fechaIngreso;
    private String empresa;
    private String instructor;
    private String lugar;
    private int empresaId;
    private int instructorId;
    private BigDecimal precio;
    private boolean examenPractico;

    private BigDecimal costo;
    private String status;

    // Constructor vacío (IMPORTANTE)
    public Curso() {
    }

    // Constructor con parámetros
    public Curso(int id, String nombre, String stps, int horas, LocalDate fechaIngreso, 
                 String empresa, String instructor, String lugar, BigDecimal precio) {
        this.id = id;
        this.nombre = nombre;
        this.stps = stps;
        this.horas = horas;
        this.fechaIngreso = fechaIngreso;
        this.empresa = empresa;
        this.instructor = instructor;
        this.lugar = lugar;
        this.precio = precio;
    }

    // Getters y setters (todos deben estar)
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getStps() { return stps; }
    public void setStps(String stps) { this.stps = stps; }
    public int getHoras() { return horas; }
    public void setHoras(int horas) { this.horas = horas; }
    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }
    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }
    public String getInstructor() { return instructor; }
    public void setInstructor(String instructor) { this.instructor = instructor; }
    public String getLugar() { return lugar; }
    public void setLugar(String lugar) { this.lugar = lugar; }
    public int getEmpresaId() { return empresaId; }
    public void setEmpresaId(int empresaId) { this.empresaId = empresaId; }
    public int getInstructorId() { return instructorId; }
    public void setInstructorId(int instructorId) { this.instructorId = instructorId; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public boolean getExamenPractico() { return examenPractico; }
    public void setExamenPractico(boolean examenPractico) { this.examenPractico = examenPractico; }

    public BigDecimal getCosto() { return costo; }
    public void setCosto(BigDecimal costo) { this.costo = costo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}