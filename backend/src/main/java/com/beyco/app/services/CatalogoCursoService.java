// src/main/java/com/beyco/app/services/CatalogoCursoService.java
package com.beyco.app.services;

import com.beyco.app.models.CatalogoCurso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class CatalogoCursoService {

    private final DataSource dataSource;

    @Autowired
    public CatalogoCursoService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<CatalogoCurso> listarTodosActivos() {
        List<CatalogoCurso> cursos = new ArrayList<>();
        String sql = "SELECT id_catalogoC, Nombre, Clave_STPS, Precio, Horas, Examen_practico, Estatus " +
                     "FROM catalogo_cursos WHERE Estatus = 'activo'";
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                cursos.add(new CatalogoCurso(
                    rs.getInt("id_catalogoC"),
                    rs.getString("Nombre"),
                    rs.getString("Clave_STPS"),
                    rs.getBigDecimal("Precio"),
                    rs.getInt("Horas"),
                    rs.getBoolean("Examen_practico"),
                    rs.getString("Estatus")
                ));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error al listar catálogo de cursos", e);
        }
        return cursos;
    }

    public boolean eliminarCurso(int id) {
        // En lugar de borrar físicamente, se desactiva (mejor práctica)
        String sql = "UPDATE catalogo_cursos SET Estatus = 'inactivo' WHERE id_catalogoC = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al eliminar curso del catálogo", e);
        }
    }

    public boolean crearCurso(CatalogoCurso curso) {
        String sql = "INSERT INTO catalogo_cursos (Clave_STPS, Nombre, Precio, Horas, Examen_practico, Estatus) " +
                     "VALUES (?, ?, ?, ?, ?, 'activo')";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pstmt.setString(1, curso.getStps());
            pstmt.setString(2, curso.getNombre());
            pstmt.setBigDecimal(3, curso.getPrecio());
            pstmt.setInt(4, curso.getHoras());
            pstmt.setBoolean(5, curso.isExamenPractico());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al crear curso en catálogo", e);
        }
    }

    public boolean actualizarCurso(CatalogoCurso curso) {
        String sql = "UPDATE catalogo_cursos SET Nombre = ?, Precio = ?, Horas = ?, Examen_practico = ? WHERE id_catalogoC = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, curso.getNombre());
            pstmt.setBigDecimal(2, curso.getPrecio());
            pstmt.setInt(3, curso.getHoras());
            pstmt.setBoolean(4, curso.isExamenPractico());
            pstmt.setInt(5, curso.getId());
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("Error al actualizar curso en catálogo", e);
        }
    }
}