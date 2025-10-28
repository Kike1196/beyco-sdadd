package com.beyco.app.models;

import java.time.LocalDate;

public class Usuario {
    private int numEmpleado;
    private String nombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private String contrasena;
    private int idRol;
    private boolean activo;
    private LocalDate fechaIngreso;
    private String preguntaRecuperacion;
    private String respuestaRecuperacion;
    private String firma;

    // Constructores, Getters y Setters

    public Usuario() {}

    // Getters
    public int getNumEmpleado() { return numEmpleado; }
    public String getNombre() { return nombre; }
    public String getApellidoPaterno() { return apellidoPaterno; }
    public String getApellidoMaterno() { return apellidoMaterno; }
    public String getCorreo() { return correo; }
    public String getContrasena() { return contrasena; }
    public int getIdRol() { return idRol; }
    public boolean isActivo() { return activo; }
    public LocalDate getFechaIngreso() { return fechaIngreso; }
    public String getPreguntaRecuperacion() { return preguntaRecuperacion; }
    public String getRespuestaRecuperacion() { return respuestaRecuperacion; }
    public String getFirma() { return firma; }

    // Setters
    public void setNumEmpleado(int numEmpleado) { this.numEmpleado = numEmpleado; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }
    public void setCorreo(String correo) { this.correo = correo; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public void setIdRol(int idRol) { this.idRol = idRol; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public void setFechaIngreso(LocalDate fechaIngreso) { this.fechaIngreso = fechaIngreso; }
    public void setPreguntaRecuperacion(String preguntaRecuperacion) { this.preguntaRecuperacion = preguntaRecuperacion; }
    public void setRespuestaRecuperacion(String respuestaRecuperacion) { this.respuestaRecuperacion = respuestaRecuperacion; }
    public void setFirma(String firma) { this.firma = firma; }

    // En Usuario.java
    @Override
    public String toString() {
        return "Usuario{" +
                "numEmpleado=" + numEmpleado +
                ", nombre='" + nombre + '\'' +
                ", apellidoPaterno='" + apellidoPaterno + '\'' +
                ", apellidoMaterno='" + apellidoMaterno + '\'' +
                ", correo='" + correo + '\'' +
                ", idRol=" + idRol +
                ", activo=" + activo +
                ", fechaIngreso=" + fechaIngreso +
                ", preguntaRecuperacion='" + preguntaRecuperacion + '\'' +
                ", respuestaRecuperacion='" + respuestaRecuperacion + '\'' +
                ", firma='" + firma + '\'' +
                '}';
    }
}

