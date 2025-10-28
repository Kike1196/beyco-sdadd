package com.beyco.app.models;

public class Instructor {
    private int numEmpleado;  // Cambiado de 'id' a 'numEmpleado'
    private String nombre;
    private String apellidoPaterno;  // Nuevo campo
    private String apellidoMaterno;  // Nuevo campo
    private String especialidad;
    private String email;
    private String telefono;
    
    // constructores
    public Instructor() {} 
    
    // Getters y setters
    public int getNumEmpleado() { return numEmpleado; }
    public void setNumEmpleado(int numEmpleado) { this.numEmpleado = numEmpleado; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getApellidoPaterno() { return apellidoPaterno; }
    public void setApellidoPaterno(String apellidoPaterno) { this.apellidoPaterno = apellidoPaterno; }
    
    public String getApellidoMaterno() { return apellidoMaterno; }
    public void setApellidoMaterno(String apellidoMaterno) { this.apellidoMaterno = apellidoMaterno; }
    
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}