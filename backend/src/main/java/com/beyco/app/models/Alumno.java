package com.beyco.app.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Alumno {
    private String curp;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private LocalDate fechaNacimiento;
    private String puesto;
    private String estadoNacimiento;
    private String rfc;
    private boolean activo = true;
    private LocalDateTime fechaRegistro;

    // Constructor vacío
    public Alumno() {
    }

    // Constructor con parámetros
    public Alumno(String curp, String nombre, String apellidoPaterno, String apellidoMaterno, 
                  LocalDate fechaNacimiento, String puesto, String estadoNacimiento, String rfc) {
        this.curp = curp;
        this.nombre = nombre;
        this.apellidoPaterno = apellidoPaterno;
        this.apellidoMaterno = apellidoMaterno;
        this.fechaNacimiento = fechaNacimiento;
        this.puesto = puesto;
        this.estadoNacimiento = estadoNacimiento;
        this.rfc = rfc;
        this.activo = true;
        this.fechaRegistro = LocalDateTime.now();
    }

    // --- Getters y Setters ---
    public String getCurp() { return curp; }
    public void setCurp(String curp) { this.curp = curp; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }

    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public String getPuesto() { return puesto; }
    public void setPuesto(String puesto) { this.puesto = puesto; }

    public String getEstadoNacimiento() { return estadoNacimiento; }
    public void setEstadoNacimiento(String estadoNacimiento) { this.estadoNacimiento = estadoNacimiento; }

    public String getRfc() { return rfc; }
    public void setRfc(String rfc) { this.rfc = rfc; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDateTime fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}