// services/EmpresaService.java
package com.beyco.app.services;

import com.beyco.app.models.Empresa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmpresaService {

    private final DataSource dataSource;

    @Autowired
    public EmpresaService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Listar todas las empresas
    public List<Empresa> listarTodas() {
        List<Empresa> empresas = new ArrayList<>();
        String sql = "SELECT Id, Nombre, Telefono, Email, Direccion, RFC, Activo, Contacto, Logo FROM empresas ORDER BY Nombre";
        
        System.out.println("🔍 Ejecutando query de empresas: " + sql);
        
        try (Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println("✅ Conexión a BD establecida");
            int count = 0;
            
            while (rs.next()) {
                Empresa empresa = new Empresa();
                empresa.setId(rs.getInt("Id"));
                empresa.setNombre(rs.getString("Nombre"));
                empresa.setTelefono(rs.getString("Telefono"));
                empresa.setEmail(rs.getString("Email"));
                empresa.setDireccion(rs.getString("Direccion"));
                empresa.setRfc(rs.getString("RFC"));
                empresa.setActivo(rs.getBoolean("Activo"));
                empresa.setContacto(rs.getString("Contacto"));
                empresa.setLogo(rs.getString("Logo"));
                
                empresas.add(empresa);
                count++;
                System.out.println("🏢 Empresa encontrada: " + empresa.getNombre());
            }
            
            System.out.println("✅ Total empresas encontradas en BD: " + count);
            
        } catch (SQLException e) {
            System.err.println("❌ Error en consulta SQL de empresas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al consultar las empresas", e);
        }
        return empresas;
    }

    // Buscar empresa por ID
    public Empresa buscarPorId(int id) {
        String sql = "SELECT Id, Nombre, Telefono, Email, Direccion, RFC, Activo, Contacto, Logo " +
                    "FROM empresas WHERE Id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                Empresa empresa = new Empresa();
                empresa.setId(rs.getInt("Id"));
                empresa.setNombre(rs.getString("Nombre"));
                empresa.setTelefono(rs.getString("Telefono"));
                empresa.setEmail(rs.getString("Email"));
                empresa.setDireccion(rs.getString("Direccion"));
                empresa.setRfc(rs.getString("RFC"));
                empresa.setActivo(rs.getBoolean("Activo"));
                empresa.setContacto(rs.getString("Contacto"));
                empresa.setLogo(rs.getString("Logo"));
                
                System.out.println("✅ Empresa encontrada por ID: " + empresa.getNombre());
                return empresa;
            }
        } catch (SQLException e) {
            System.err.println("❌ Error al buscar empresa por ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al buscar empresa por ID", e);
        }
        return null;
    }

    public boolean crearEmpresa(Empresa empresa) {
        String sql = "INSERT INTO empresas (Nombre, Telefono, Email, Direccion, RFC, Activo, Contacto, Logo) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = dataSource.getConnection();
            PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, empresa.getNombre());
            pstmt.setString(2, empresa.getTelefono());
            pstmt.setString(3, empresa.getEmail());
            pstmt.setString(4, empresa.getDireccion());
            pstmt.setString(5, empresa.getRfc());
            pstmt.setBoolean(6, empresa.isActivo());
            pstmt.setString(7, empresa.getContacto());
            
            // Generar nombre único para el logo si no se proporciona
            String logo = empresa.getLogo();
            if (logo == null || logo.trim().isEmpty()) {
                // Generar código único basado en las iniciales
                String iniciales = generarIniciales(empresa.getNombre());
                logo = iniciales + "_" + System.currentTimeMillis();
            }
            pstmt.setString(8, logo);
            
            int resultado = pstmt.executeUpdate();
            System.out.println("✅ Empresa creada: " + empresa.getNombre() + " - Logo: " + logo);
            return resultado > 0;
            
        } catch (SQLException e) {
            System.err.println("❌ Error al crear empresa: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al crear empresa", e);
        }
    }

    // Método auxiliar para generar iniciales
    private String generarIniciales(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            return "EMP";
        }
        
        String[] palabras = nombre.trim().split("\\s+");
        StringBuilder iniciales = new StringBuilder();
        
        for (String palabra : palabras) {
            if (!palabra.isEmpty()) {
                iniciales.append(Character.toUpperCase(palabra.charAt(0)));
            }
            if (iniciales.length() >= 3) break; // Máximo 3 caracteres
        }
        
        // Si no hay suficientes palabras, completar con X
        while (iniciales.length() < 3) {
            iniciales.append('X');
        }
        
        return iniciales.toString();
    }

    // Actualizar empresa
    public boolean actualizarEmpresa(Empresa empresa) {
        String sql = "UPDATE empresas SET Nombre = ?, Telefono = ?, Email = ?, Direccion = ?, " +
                    "RFC = ?, Activo = ?, Contacto = ?, Logo = ? WHERE Id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, empresa.getNombre());
            pstmt.setString(2, empresa.getTelefono());
            pstmt.setString(3, empresa.getEmail());
            pstmt.setString(4, empresa.getDireccion());
            pstmt.setString(5, empresa.getRfc());
            pstmt.setBoolean(6, empresa.isActivo());
            pstmt.setString(7, empresa.getContacto());
            pstmt.setString(8, empresa.getLogo());
            pstmt.setInt(9, empresa.getId());
            
            int resultado = pstmt.executeUpdate();
            System.out.println("✅ Empresa actualizada: " + empresa.getNombre() + " - Resultado: " + resultado);
            return resultado > 0;
            
        } catch (SQLException e) {
            System.err.println("❌ Error al actualizar empresa: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar empresa", e);
        }
    }

    // Eliminar empresa (soft delete)
    public boolean eliminarEmpresa(int id) {
        String sql = "UPDATE empresas SET Activo = 0 WHERE Id = ?";
        
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            int resultado = pstmt.executeUpdate();
            System.out.println("✅ Empresa eliminada (ID: " + id + ") - Resultado: " + resultado);
            return resultado > 0;
            
        } catch (SQLException e) {
            System.err.println("❌ Error al eliminar empresa: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar empresa", e);
        }
    }

    // Buscar empresas por criterio
    public List<Empresa> buscarEmpresas(String criterio) {
        List<Empresa> empresas = new ArrayList<>();
        String sql = "SELECT Id, Nombre, Telefono, Email, Direccion, RFC, Activo, Contacto, Logo " +
                    "FROM empresas WHERE (Nombre LIKE ? OR Contacto LIKE ? OR Email LIKE ?) " +
                    "ORDER BY Nombre";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            String likeCriterio = "%" + criterio + "%";
            pstmt.setString(1, likeCriterio);
            pstmt.setString(2, likeCriterio);
            pstmt.setString(3, likeCriterio);
            
            ResultSet rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Empresa empresa = new Empresa();
                empresa.setId(rs.getInt("Id"));
                empresa.setNombre(rs.getString("Nombre"));
                empresa.setTelefono(rs.getString("Telefono"));
                empresa.setEmail(rs.getString("Email"));
                empresa.setDireccion(rs.getString("Direccion"));
                empresa.setRfc(rs.getString("RFC"));
                empresa.setActivo(rs.getBoolean("Activo"));
                empresa.setContacto(rs.getString("Contacto"));
                empresa.setLogo(rs.getString("Logo"));
                
                empresas.add(empresa);
            }
            
            System.out.println("✅ Empresas encontradas en búsqueda: " + empresas.size());
            
        } catch (SQLException e) {
            System.err.println("❌ Error al buscar empresas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al buscar empresas", e);
        }
        return empresas;
    }
}