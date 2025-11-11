// models/PagoInstructor.java
package com.beyco.app.models;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PagoInstructor {
    private int id;
    private int instructorId;
    private LocalDate fechaPago;
    private BigDecimal monto;
    private int horasImpartidas;
    private String estatus;
    private String comprobante;
    private String observaciones;

    // Constructores
    public PagoInstructor() {}

    public PagoInstructor(int instructorId, LocalDate fechaPago, BigDecimal monto, 
                         int horasImpartidas, String estatus, String comprobante, String observaciones) {
        this.instructorId = instructorId;
        this.fechaPago = fechaPago;
        this.monto = monto;
        this.horasImpartidas = horasImpartidas;
        this.estatus = estatus;
        this.comprobante = comprobante;
        this.observaciones = observaciones;
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getInstructorId() { return instructorId; }
    public void setInstructorId(int instructorId) { this.instructorId = instructorId; }

    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }

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

    @Override
    public String toString() {
        return "PagoInstructor{" +
                "id=" + id +
                ", instructorId=" + instructorId +
                ", fechaPago=" + fechaPago +
                ", monto=" + monto +
                ", horasImpartidas=" + horasImpartidas +
                ", estatus='" + estatus + '\'' +
                ", comprobante='" + comprobante + '\'' +
                ", observaciones='" + observaciones + '\'' +
                '}';
    }
}