package com.beyco.app.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired
    private DataSource dataSource;

    public Map<String, Object> obtenerEstadisticasSistema() {
        Map<String, Object> estadisticas = new HashMap<>();
        
        try (Connection connection = dataSource.getConnection()) {
            
            // 1. Total de usuarios activos
            String sqlUsuarios = "SELECT COUNT(*) as total FROM usuarios WHERE Activo = 1";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlUsuarios);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("totalUsuarios", rs.getInt("total"));
                }
            }
            
            // 2. Total de cursos activos (cursos recientes)
            String sqlCursos = "SELECT COUNT(*) as total FROM cursos WHERE Fecha_Imparticion >= CURDATE() - INTERVAL 30 DAY";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlCursos);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("totalCursos", rs.getInt("total"));
                }
            }
            
            // 3. Total de empresas activas
            String sqlEmpresas = "SELECT COUNT(*) as total FROM empresas";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlEmpresas);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("totalEmpresas", rs.getInt("total"));
                }
            }
            
            // 4. Total de pagos pendientes
            String sqlPagosPendientes = "SELECT COUNT(*) as total FROM pagos_instructores WHERE Estatus = 'pendiente'";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlPagosPendientes);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("pagosPendientes", rs.getInt("total"));
                }
            }
            
            // 5. Total de instructores activos
            String sqlInstructores = "SELECT COUNT(*) as total FROM usuarios WHERE Id_Rol = 2 AND Activo = 1";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlInstructores);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("totalInstructores", rs.getInt("total"));
                }
            }
            
            // 6. Cursos del mes actual
            String sqlCursosMes = "SELECT COUNT(*) as total FROM cursos WHERE MONTH(Fecha_Imparticion) = MONTH(CURDATE()) AND YEAR(Fecha_Imparticion) = YEAR(CURDATE())";
            try (PreparedStatement pstmt = connection.prepareStatement(sqlCursosMes);
                 ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("cursosEsteMes", rs.getInt("total"));
                }
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            // Valores por defecto en caso de error
            estadisticas.put("totalUsuarios", 0);
            estadisticas.put("totalCursos", 0);
            estadisticas.put("totalEmpresas", 0);
            estadisticas.put("pagosPendientes", 0);
            estadisticas.put("totalInstructores", 0);
            estadisticas.put("cursosEsteMes", 0);
        }
        
        return estadisticas;
    }
}