package com.beyco.app.services;

import com.beyco.app.models.Instructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class InstructorService {

    private final DataSource dataSource;

    @Autowired
    public InstructorService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Busca un instructor por su ID (número de empleado)
     */
    public Instructor findInstructorById(int instructorId) {
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno FROM usuarios WHERE Num_Empleado = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, instructorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Instructor instructor = new Instructor();
                    instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                    instructor.setNombre(rs.getString("Nombre"));
                    instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                    return instructor;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar instructor: " + e.getMessage());
        }
        return null;
    }

    /**
     * Obtiene todos los instructores del sistema
     */
    public List<Instructor> listarTodosLosInstructores() {
        List<Instructor> instructores = new ArrayList<>();
        
        // Consulta mejorada para obtener solo usuarios activos
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno " +
                    "FROM usuarios WHERE Activo = 1"; // Solo usuarios activos
        
        System.out.println("📋 Ejecutando consulta instructores: " + sql);
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql);
            ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                Instructor instructor = new Instructor();
                instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                instructor.setNombre(rs.getString("Nombre"));
                instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                instructores.add(instructor);
                
                System.out.println("👨‍🏫 Instructor: " + instructor.getNombre() + " " + 
                                instructor.getApellidoPaterno());
            }
            
            System.out.println("✅ Total instructores en BD: " + instructores.size());
            
        } catch (SQLException e) {
            System.err.println("❌ Error SQL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al listar instructores: " + e.getMessage());
        }
        return instructores;
    }

    /**
     * Obtiene instructores por nombre (búsqueda parcial)
     */
    public List<Instructor> buscarInstructoresPorNombre(String nombre) {
        List<Instructor> instructores = new ArrayList<>();
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno FROM usuarios WHERE Nombre LIKE ? OR Apellido_paterno LIKE ? OR Apellido_materno LIKE ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            String searchTerm = "%" + nombre + "%";
            pstmt.setString(1, searchTerm);
            pstmt.setString(2, searchTerm);
            pstmt.setString(3, searchTerm);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Instructor instructor = new Instructor();
                    instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                    instructor.setNombre(rs.getString("Nombre"));
                    instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                    instructores.add(instructor);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar instructores por nombre: " + e.getMessage());
        }
        return instructores;
    }
}