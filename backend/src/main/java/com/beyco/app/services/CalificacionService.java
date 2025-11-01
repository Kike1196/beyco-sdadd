package com.beyco.app.services;

import com.beyco.app.models.CalificacionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;

@Service
public class CalificacionService {

    private final DataSource dataSource;

    @Autowired
    public CalificacionService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Guarda o actualiza una calificación en la tabla evaluaciones_cursos
     */
    public boolean guardarCalificacion(String alumnoCurp, int cursoId, 
                                      double evaluacionInicial, double evaluacionFinal, 
                                      double examenPractico, double promedio, 
                                      String resultado, String observaciones) {
        
        System.out.println("📝 Guardando calificación para alumno: " + alumnoCurp + ", curso: " + cursoId);
        System.out.println("📊 Datos: Inicial=" + evaluacionInicial + ", Final=" + evaluacionFinal + 
                          ", Práctico=" + examenPractico + ", Resultado=" + resultado);
        
        // Verificar si ya existe una calificación para este alumno y curso
        if (existeCalificacion(alumnoCurp, cursoId)) {
            return actualizarCalificacion(alumnoCurp, cursoId, evaluacionInicial, evaluacionFinal, 
                                        examenPractico, resultado, observaciones);
        } else {
            return insertarCalificacion(alumnoCurp, cursoId, evaluacionInicial, evaluacionFinal, 
                                      examenPractico, resultado, observaciones);
        }
    }

    /**
     * Inserta una nueva calificación en evaluaciones_cursos
     */
    private boolean insertarCalificacion(String alumnoCurp, int cursoId, 
                                        double evaluacionInicial, double evaluacionFinal, 
                                        double examenPractico, String resultado, 
                                        String observaciones) {
        
        String sql = "INSERT INTO evaluaciones_cursos (alumnos_Curp, cursos_Id_Curso, Curso_Id, Examen_Inicial, " +
                    "Examen_Final, Examen_Practico, Resultado, Observaciones) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        System.out.println("📝 Insertando nueva calificación: " + sql);
        System.out.println("📋 Parámetros: CURP=" + alumnoCurp + ", CursoID=" + cursoId + 
                          ", Inicial=" + evaluacionInicial + ", Final=" + evaluacionFinal + 
                          ", Práctico=" + examenPractico + ", Resultado=" + resultado);
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            pstmt.setInt(3, cursoId); // Curso_Id parece ser duplicado, pero lo incluimos
            pstmt.setDouble(4, evaluacionInicial);
            pstmt.setDouble(5, evaluacionFinal);
            pstmt.setDouble(6, examenPractico);
            pstmt.setString(7, resultado);
            pstmt.setString(8, observaciones);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Calificación insertada. Filas afectadas: " + filasAfectadas);
            
            return filasAfectadas > 0;
            
        } catch (SQLException e) {
            System.err.println("❌ Error insertando calificación: " + e.getMessage());
            System.err.println("🔍 SQL State: " + e.getSQLState());
            System.err.println("🔍 Error Code: " + e.getErrorCode());
            e.printStackTrace();
            throw new RuntimeException("Error al insertar calificación: " + e.getMessage());
        }
    }

    /**
     * Actualiza una calificación existente en evaluaciones_cursos
     */
    private boolean actualizarCalificacion(String alumnoCurp, int cursoId, 
                                         double evaluacionInicial, double evaluacionFinal, 
                                         double examenPractico, String resultado, 
                                         String observaciones) {
        
        String sql = "UPDATE evaluaciones_cursos SET Examen_Inicial = ?, Examen_Final = ?, " +
                    "Examen_Practico = ?, Resultado = ?, Observaciones = ? " +
                    "WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?";
        
        System.out.println("📝 Actualizando calificación existente: " + sql);
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setDouble(1, evaluacionInicial);
            pstmt.setDouble(2, evaluacionFinal);
            pstmt.setDouble(3, examenPractico);
            pstmt.setString(4, resultado);
            pstmt.setString(5, observaciones);
            pstmt.setString(6, alumnoCurp);
            pstmt.setInt(7, cursoId);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Calificación actualizada. Filas afectadas: " + filasAfectadas);
            
            return filasAfectadas > 0;
            
        } catch (SQLException e) {
            System.err.println("❌ Error actualizando calificación: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar calificación: " + e.getMessage());
        }
    }

    /**
     * Verifica si existe una calificación para el alumno y curso en evaluaciones_cursos
     */
    private boolean existeCalificacion(String alumnoCurp, int cursoId) {
        String sql = "SELECT 1 FROM evaluaciones_cursos WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            System.err.println("❌ Error verificando existencia de calificación: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Obtiene la calificación de un alumno en un curso específico desde evaluaciones_cursos
     */
    public CalificacionRequest obtenerCalificacion(String alumnoCurp, int cursoId) {
        System.out.println("🔍 Obteniendo calificación para alumno: " + alumnoCurp + ", curso: " + cursoId);
        
        String sql = "SELECT Examen_Inicial, Examen_Final, Examen_Practico, " +
                    "Resultado, Observaciones FROM evaluaciones_cursos " +
                    "WHERE alumnos_Curp = ? AND cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumnoCurp);
            pstmt.setInt(2, cursoId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    CalificacionRequest calificacion = new CalificacionRequest();
                    calificacion.setAlumnoCurp(alumnoCurp);
                    calificacion.setCursoId(cursoId);
                    calificacion.setEvaluacionInicial(rs.getDouble("Examen_Inicial"));
                    calificacion.setEvaluacionFinal(rs.getDouble("Examen_Final"));
                    calificacion.setExamenPractico(rs.getDouble("Examen_Practico"));
                    
                    // Calcular promedio basado en Examen_Final y Examen_Practico
                    double promedio = (rs.getDouble("Examen_Final") + rs.getDouble("Examen_Practico")) / 2;
                    calificacion.setPromedio(promedio);
                    
                    calificacion.setResultado(rs.getString("Resultado"));
                    calificacion.setObservaciones(rs.getString("Observaciones"));
                    
                    System.out.println("✅ Calificación encontrada: " + calificacion.toString());
                    return calificacion;
                } else {
                    System.out.println("ℹ️  No se encontró calificación para " + alumnoCurp + " en curso " + cursoId);
                    return null;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error obteniendo calificación: " + e.getMessage());
            System.err.println("🔍 SQL State: " + e.getSQLState());
            System.err.println("🔍 Error Code: " + e.getErrorCode());
            e.printStackTrace();
            return null; // Retornar null en lugar de lanzar excepción
        }
    }
}