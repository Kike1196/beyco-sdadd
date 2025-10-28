package com.beyco.app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;

@Service
public class InscripcionService {

    private final DataSource dataSource;

    @Autowired
    public InscripcionService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Inscribe un alumno a un curso
     */
    public boolean inscribirAlumno(String alumnoCurp, int cursoId) {
        String sql = "INSERT INTO alumnos_has_cursos (alumnos_Curp, cursos_Id_Curso) VALUES (?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al inscribir alumno: " + e.getMessage());
        }
    }

    /**
     * Verifica si un alumno ya está inscrito en un curso
     */
    public boolean existeInscripcion(String alumnoCurp, int cursoId) {
        String sql = "SELECT 1 FROM alumnos_has_cursos WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al verificar inscripción: " + e.getMessage());
        }
    }

    /**
     * Obtiene el número de alumnos inscritos en un curso
     */
    public int contarAlumnosInscritos(int cursoId) {
        String sql = "SELECT COUNT(*) FROM alumnos_has_cursos WHERE cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al contar alumnos inscritos: " + e.getMessage());
        }
        return 0;
    }

    /**
     * Elimina la inscripción de un alumno en un curso específico
     */
    public boolean eliminarInscripcion(String alumnoCurp, int cursoId) {
        String sql = "DELETE FROM alumnos_has_cursos WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?";
        
        System.out.println("🗑️ Ejecutando: " + sql);
        System.out.println("📋 Parámetros: CURP=" + alumnoCurp + ", CursoID=" + cursoId);
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Filas afectadas: " + filasAfectadas);
            
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("❌ Error SQL al eliminar inscripción: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar inscripción: " + e.getMessage());
        }
    }

    /**
     * Elimina todas las inscripciones de un alumno
     */
    public boolean eliminarTodasLasInscripciones(String alumnoCurp) {
        String sql = "DELETE FROM alumnos_has_cursos WHERE alumnos_Curp = ?";
        
        System.out.println("🗑️ Eliminando todas las inscripciones del alumno: " + alumnoCurp);
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Inscripciones eliminadas: " + filasAfectadas);
            
            return filasAfectadas >= 0; // Puede ser 0 si no tenía inscripciones
        } catch (SQLException e) {
            System.err.println("❌ Error SQL al eliminar inscripciones: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar inscripciones: " + e.getMessage());
        }
    }
}