// models/HonorariosInstructorDTO.java
package com.beyco.app.models;

import java.math.BigDecimal;
import java.util.List;

public class HonorariosInstructorDTO {
    private int instructorId;
    private String instructorNombre;
    private String instructorEmail;
    private List<PagoInstructor> cursosPendientes;
    private BigDecimal totalPendiente;
    private int totalHoras;

    // Constructores, Getters y Setters...
    public HonorariosInstructorDTO() {}

    public HonorariosInstructorDTO(int instructorId, String instructorNombre, String instructorEmail) {
        this.instructorId = instructorId;
        this.instructorNombre = instructorNombre;
        this.instructorEmail = instructorEmail;
    }

    // Getters y Setters
    public int getInstructorId() { return instructorId; }
    public void setInstructorId(int instructorId) { this.instructorId = instructorId; }

    public String getInstructorNombre() { return instructorNombre; }
    public void setInstructorNombre(String instructorNombre) { this.instructorNombre = instructorNombre; }

    public String getInstructorEmail() { return instructorEmail; }
    public void setInstructorEmail(String instructorEmail) { this.instructorEmail = instructorEmail; }

    public List<PagoInstructor> getCursosPendientes() { return cursosPendientes; }
    public void setCursosPendientes(List<PagoInstructor> cursosPendientes) { 
        this.cursosPendientes = cursosPendientes; 
    }

    public BigDecimal getTotalPendiente() { return totalPendiente; }
    public void setTotalPendiente(BigDecimal totalPendiente) { this.totalPendiente = totalPendiente; }

    public int getTotalHoras() { return totalHoras; }
    public void setTotalHoras(int totalHoras) { this.totalHoras = totalHoras; }
}