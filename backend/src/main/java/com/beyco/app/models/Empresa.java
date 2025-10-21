package com.beyco.app.models;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Empresa {
    @JsonProperty("id")
    private int id;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("telefono")
    private String telefono;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("direccion")
    private String direccion;
    
    @JsonProperty("rfc")
    private String rfc;
    
    @JsonProperty("activo")
    private boolean activo;
    
    @JsonProperty("contacto")
    private String contacto;
    
    @JsonProperty("logo")
    private String logo;

    // Los getters y setters se mantienen igual
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getRfc() {
        return rfc;
    }

    public void setRfc(String rfc) {
        this.rfc = rfc;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getContacto() {
        return contacto;
    }

    public void setContacto(String contacto) {
        this.contacto = contacto;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }
}