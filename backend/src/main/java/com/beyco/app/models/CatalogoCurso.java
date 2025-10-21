package com.beyco.app.models;

public class CatalogoCurso {
    private int id;
    private String nombre;
    private String stps;
    private int horas;
    private double costo;
    private boolean examenPractico;
    
    // Constructores
    public CatalogoCurso() {}
    
    public CatalogoCurso(int id, String nombre, String stps, int horas, double costo, boolean examenPractico) {
        this.id = id;
        this.nombre = nombre;
        this.stps = stps;
        this.horas = horas;
        this.costo = costo;
        this.examenPractico = examenPractico;
    }
    
    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getStps() { return stps; }
    public void setStps(String stps) { this.stps = stps; }
    
    public int getHoras() { return horas; }
    public void setHoras(int horas) { this.horas = horas; }
    
    public double getCosto() { return costo; }
    public void setCosto(double costo) { this.costo = costo; }
    
    public boolean isExamenPractico() { return examenPractico; }
    public void setExamenPractico(boolean examenPractico) { this.examenPractico = examenPractico; }
    
    @Override
    public String toString() {
        return "CatalogoCurso{" +
                "id=" + id +
                ", nombre='" + nombre + '\'' +
                ", stps='" + stps + '\'' +
                ", horas=" + horas +
                ", costo=" + costo +
                ", examenPractico=" + examenPractico +
                '}';
    }
}