package com.beyco.app.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Anuncio {
    private int id;
    private String titulo;
    private String contenido;
    private LocalDateTime fecha;
    private boolean importante;
    
    // constructores, getters y setters
    public Anuncio() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }
    public boolean isImportante() { return importante; }
    public void setImportante(boolean importante) { this.importante = importante; }
}