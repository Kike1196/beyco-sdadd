// models/PagoInstructor.java
package com.beyco.app.models;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PagoInstructor {
    private int id;
    private int instructorId;
    private String instructorNombre;
    private String cursoNombre; // Este campo vendría de otra tabla o se almacenaría aquí
    private LocalDate fechaPago;
    private LocalDate fechaCurso; // Fecha en que se impartió el curso
    private BigDecimal monto;
    private int horasImpartidas;
    private String estatus; // "pendiente", "pagado", "cancelado"
    private String comprobante;
    private String observaciones;

    // Constructores
    public PagoInstructor() {}

    public PagoInstructor(int instructorId, String cursoNombre, LocalDate fechaCurso, 
                         BigDecimal monto, int horasImpartidas, String estatus) {
        this.instructorId = instructorId;
        this.cursoNombre = cursoNombre;
        this.fechaCurso = fechaCurso;
        this.monto = monto;
        this.horasImpartidas = horasImpartidas;
        this.estatus = estatus;
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getInstructorId() { return instructorId; }
    public void setInstructorId(int instructorId) { this.instructorId = instructorId; }

    public String getInstructorNombre() { return instructorNombre; }
    public void setInstructorNombre(String instructorNombre) { this.instructorNombre = instructorNombre; }

    public String getCursoNombre() { return cursoNombre; }
    public void setCursoNombre(String cursoNombre) { this.cursoNombre = cursoNombre; }

    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }

    public LocalDate getFechaCurso() { return fechaCurso; }
    public void setFechaCurso(LocalDate fechaCurso) { this.fechaCurso = fechaCurso; }

    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }

    public int getHorasImpartidas() { return horasImpartidas; }
    public void setHorasImpartidas(int horasImpartidas) { this.horasImpartidas = horasImpartidas; }

    public String getEstatus() { return estatus; }
    public void setEstatus(String estatus) { this.estatus = estatus; }

    public String getComprobante() { return comprobante; }
    public void setComprobante(String comprobante) { this.comprobante = comprobante; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
}