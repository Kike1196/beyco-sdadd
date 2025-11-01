package com.beyco.app.models;

import java.time.LocalDateTime;

public class Evidencia {
    private int idEvidencia;
    private String tipoEvidencia; // 'foto', 'video', 'documento', 'lista_asistencia'
    private String descripcion;
    private String archivoRuta;
    private LocalDateTime fechaSubida;
    private String estatus; // 'pendiente', 'aprobada', 'rechazada'
    private String observaciones;
    private int cursosIdCurso;

    // Constructores
    public Evidencia() {
        this.fechaSubida = LocalDateTime.now();
        this.estatus = "pendiente";
    }

    public Evidencia(String tipoEvidencia, String descripcion, String archivoRuta, 
                    String observaciones, int cursosIdCurso) {
        this();
        this.tipoEvidencia = tipoEvidencia;
        this.descripcion = descripcion;
        this.archivoRuta = archivoRuta;
        this.observaciones = observaciones;
        this.cursosIdCurso = cursosIdCurso;
    }

    // Getters y Setters
    public int getIdEvidencia() { return idEvidencia; }
    public void setIdEvidencia(int idEvidencia) { this.idEvidencia = idEvidencia; }

    public String getTipoEvidencia() { return tipoEvidencia; }
    public void setTipoEvidencia(String tipoEvidencia) { this.tipoEvidencia = tipoEvidencia; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getArchivoRuta() { return archivoRuta; }
    public void setArchivoRuta(String archivoRuta) { this.archivoRuta = archivoRuta; }

    public LocalDateTime getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(LocalDateTime fechaSubida) { this.fechaSubida = fechaSubida; }

    public String getEstatus() { return estatus; }
    public void setEstatus(String estatus) { this.estatus = estatus; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public int getCursosIdCurso() { return cursosIdCurso; }
    public void setCursosIdCurso(int cursosIdCurso) { this.cursosIdCurso = cursosIdCurso; }

    @Override
    public String toString() {
        return "Evidencia{" +
                "idEvidencia=" + idEvidencia +
                ", tipoEvidencia='" + tipoEvidencia + '\'' +
                ", descripcion='" + descripcion + '\'' +
                ", archivoRuta='" + archivoRuta + '\'' +
                ", fechaSubida=" + fechaSubida +
                ", estatus='" + estatus + '\'' +
                ", observaciones='" + observaciones + '\'' +
                ", cursosIdCurso=" + cursosIdCurso +
                '}';
    }
}