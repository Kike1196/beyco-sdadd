// src/main/java/com/beyco/app/models/CatalogoCurso.java
package com.beyco.app.models;

import java.math.BigDecimal;

public class CatalogoCurso {
    private int id;
    private String nombre;
    private String stps;
    private BigDecimal precio;
    private int horas;
    private boolean examenPractico;
    private String estatus;

    // Constructor
    public CatalogoCurso(int id, String nombre, String stps, BigDecimal precio, int horas, boolean examenPractico, String estatus) {
        this.id = id;
        this.nombre = nombre;
        this.stps = stps;
        this.precio = precio;
        this.horas = horas;
        this.examenPractico = examenPractico;
        this.estatus = estatus;
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getStps() { return stps; }
    public void setStps(String stps) { this.stps = stps; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
    public int getHoras() { return horas; }
    public void setHoras(int horas) { this.horas = horas; }
    public boolean isExamenPractico() { return examenPractico; }
    public void setExamenPractico(boolean examenPractico) { this.examenPractico = examenPractico; }
    public String getEstatus() { return estatus; }
    public void setEstatus(String estatus) { this.estatus = estatus; }
}