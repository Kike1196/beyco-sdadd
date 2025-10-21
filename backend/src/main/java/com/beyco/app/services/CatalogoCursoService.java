package com.beyco.app.services;

import com.beyco.app.models.CatalogoCurso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CatalogoCursoService {

    private final DataSource dataSource;

    @Autowired
    public CatalogoCursoService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<CatalogoCurso> listarTodosLosCursos() {
        List<CatalogoCurso> cursos = new ArrayList<>();
        
        String sql = "SELECT id_catalogoC, Clave_STPS, Nombre, Precio, Horas, Examen_practico, Estatus " +
                    "FROM catalogo_cursos WHERE Estatus = 'activo' ORDER BY Nombre";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                CatalogoCurso curso = new CatalogoCurso(
                    rs.getInt("id_catalogoC"),
                    rs.getString("Nombre"),
                    rs.getString("Clave_STPS"),
                    rs.getInt("Horas"),
                    rs.getDouble("Precio"),
                    rs.getBoolean("Examen_practico")
                );
                cursos.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos del catálogo: " + e.getMessage());
        }
        return cursos;
    }

    public List<CatalogoCurso> buscarCursos(String busqueda) {
        List<CatalogoCurso> cursos = new ArrayList<>();
        
        String sql = "SELECT id_catalogoC, Clave_STPS, Nombre, Precio, Horas, Examen_practico, Estatus " +
                    "FROM catalogo_cursos " +
                    "WHERE (LOWER(Nombre) LIKE LOWER(?) OR LOWER(Clave_STPS) LIKE LOWER(?)) " +
                    "AND Estatus = 'activo' ORDER BY Nombre";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            String searchPattern = "%" + busqueda + "%";
            pstmt.setString(1, searchPattern);
            pstmt.setString(2, searchPattern);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    CatalogoCurso curso = new CatalogoCurso(
                        rs.getInt("id_catalogoC"),
                        rs.getString("Nombre"),
                        rs.getString("Clave_STPS"),
                        rs.getInt("Horas"),
                        rs.getDouble("Precio"),
                        rs.getBoolean("Examen_practico")
                    );
                    cursos.add(curso);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar cursos: " + e.getMessage());
        }
        return cursos;
    }

    public boolean crearCurso(CatalogoCurso curso) {
        // Primero verificar si ya existe un curso con la misma Clave_STPS
        if (existeCursoConClaveSTPS(curso.getStps())) {
            throw new RuntimeException("Ya existe un curso con la clave STPS: " + curso.getStps());
        }
        
        String sql = "INSERT INTO catalogo_cursos (Clave_STPS, Nombre, Precio, Horas, Examen_practico, Estatus) " +
                    "VALUES (?, ?, ?, ?, ?, 'activo')";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, curso.getStps());
            pstmt.setString(2, curso.getNombre());
            pstmt.setDouble(3, curso.getCosto());
            pstmt.setInt(4, curso.getHoras());
            pstmt.setBoolean(5, curso.isExamenPractico());
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        curso.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear curso en catálogo: " + e.getMessage());
        }
    }


    public boolean actualizarCurso(CatalogoCurso curso) {
        // Primero obtener el curso actual para verificar si la Clave_STPS cambió
        CatalogoCurso cursoActual = obtenerCursoPorId(curso.getId())
            .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        
        boolean claveSTPSCambio = !cursoActual.getStps().equals(curso.getStps());
        
        System.out.println("🔍 Verificando cambios - Clave STPS cambió: " + claveSTPSCambio);
        System.out.println("📊 Actual: " + cursoActual.getStps() + " -> Nuevo: " + curso.getStps());
        
        // Si la Clave_STPS cambió, verificar que no exista en otro curso
        if (claveSTPSCambio) {
            if (existeOtraCursoConClaveSTPS(curso.getId(), curso.getStps())) {
                throw new RuntimeException("Ya existe otro curso con la clave STPS: " + curso.getStps());
            }
        }
        
        String sql;
        if (claveSTPSCambio) {
            // Si cambió la Clave_STPS, actualizar todos los campos
            sql = "UPDATE catalogo_cursos SET Clave_STPS = ?, Nombre = ?, Precio = ?, Horas = ?, Examen_practico = ? " +
                "WHERE id_catalogoC = ?";
        } else {
            // Si NO cambió la Clave_STPS, actualizar solo los otros campos (evitar actualizar Clave_STPS)
            sql = "UPDATE catalogo_cursos SET Nombre = ?, Precio = ?, Horas = ?, Examen_practico = ? " +
                "WHERE id_catalogoC = ?";
        }
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {

            if (claveSTPSCambio) {
                pstmt.setString(1, curso.getStps());
                pstmt.setString(2, curso.getNombre());
                pstmt.setDouble(3, curso.getCosto());
                pstmt.setInt(4, curso.getHoras());
                pstmt.setBoolean(5, curso.isExamenPractico());
                pstmt.setInt(6, curso.getId());
            } else {
                // IMPORTANTE: No incluir Clave_STPS en la actualización
                pstmt.setString(1, curso.getNombre());
                pstmt.setDouble(2, curso.getCosto());
                pstmt.setInt(3, curso.getHoras());
                pstmt.setBoolean(4, curso.isExamenPractico());
                pstmt.setInt(5, curso.getId());
            }
            
            System.out.println("🚀 Ejecutando SQL: " + sql);
            System.out.println("📦 Parámetros: " + (claveSTPSCambio ? 
                "[" + curso.getStps() + ", " + curso.getNombre() + ", " + curso.getCosto() + ", " + curso.getHoras() + ", " + curso.isExamenPractico() + ", " + curso.getId() + "]" :
                "[" + curso.getNombre() + ", " + curso.getCosto() + ", " + curso.getHoras() + ", " + curso.isExamenPractico() + ", " + curso.getId() + "]"));
            
            int affectedRows = pstmt.executeUpdate();
            System.out.println("✅ Filas afectadas: " + affectedRows);
            
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("❌ Error SQL: " + e.getMessage());
            e.printStackTrace();
            
            // Si es error de constraint, dar mensaje más específico
            if (e.getMessage().contains("foreign key constraint") || e.getMessage().contains("Cannot delete or update a parent row")) {
                throw new RuntimeException("No se puede modificar la Clave STPS porque está siendo usada en cursos asignados. Puedes modificar los otros campos (nombre, horas, precio, examen).");
            }
            throw new RuntimeException("Error al actualizar curso en catálogo: " + e.getMessage());
        }
    }

        public boolean actualizarCursoSinClaveSTPS(CatalogoCurso curso) {
        // Método que solo actualiza campos que NO son Clave_STPS
        String sql = "UPDATE catalogo_cursos SET Nombre = ?, Precio = ?, Horas = ?, Examen_practico = ? " +
                    "WHERE id_catalogoC = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {

            pstmt.setString(1, curso.getNombre());
            pstmt.setDouble(2, curso.getCosto());
            pstmt.setInt(3, curso.getHoras());
            pstmt.setBoolean(4, curso.isExamenPractico());
            pstmt.setInt(5, curso.getId());
            
            System.out.println("🚀 Ejecutando actualización SIN Clave_STPS");
            System.out.println("📦 Parámetros: [" + curso.getNombre() + ", " + curso.getCosto() + ", " + 
                            curso.getHoras() + ", " + curso.isExamenPractico() + ", " + curso.getId() + "]");
            
            int affectedRows = pstmt.executeUpdate();
            System.out.println("✅ Filas afectadas: " + affectedRows);
            
            return affectedRows > 0;
        } catch (SQLException e) {
            System.out.println("❌ Error SQL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar curso: " + e.getMessage());
        }
    }
    
    // Método auxiliar para obtener curso por ID
    public Optional<CatalogoCurso> obtenerCursoPorId(int id) {
        String sql = "SELECT id_catalogoC, Clave_STPS, Nombre, Precio, Horas, Examen_practico, Estatus " +
                    "FROM catalogo_cursos WHERE id_catalogoC = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    CatalogoCurso curso = new CatalogoCurso(
                        rs.getInt("id_catalogoC"),
                        rs.getString("Nombre"),
                        rs.getString("Clave_STPS"),
                        rs.getInt("Horas"),
                        rs.getDouble("Precio"),
                        rs.getBoolean("Examen_practico")
                    );
                    return Optional.of(curso);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    
    // Métodos auxiliares para verificar duplicados
    private boolean existeCursoConClaveSTPS(String claveSTPS) {
        String sql = "SELECT COUNT(*) FROM catalogo_cursos WHERE Clave_STPS = ? AND Estatus = 'activo'";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, claveSTPS);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    private boolean existeOtraCursoConClaveSTPS(int idCurso, String claveSTPS) {
        String sql = "SELECT COUNT(*) FROM catalogo_cursos WHERE Clave_STPS = ? AND id_catalogoC != ? AND Estatus = 'activo'";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, claveSTPS);
            pstmt.setInt(2, idCurso);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean eliminarCurso(int id) {
        // En lugar de eliminar, cambiamos el estatus a inactivo (soft delete)
        String sql = "UPDATE catalogo_cursos SET Estatus = 'inactivo' WHERE id_catalogoC = ?";

        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, id);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar curso del catálogo: " + e.getMessage());
        }
    }

    // Datos de ejemplo para desarrollo (actualizados con nombres correctos)
    public List<CatalogoCurso> obtenerCursosEjemplo() {
        return List.of(
            new CatalogoCurso(1, "Seguridad industrial", "BEA/2210SN96-0013", 8, 1500.0, true),
            new CatalogoCurso(2, "Búsqueda y rescate", "BEA/2210SN96-0013", 8, 1500.0, false),
            new CatalogoCurso(3, "C-TPAT", "BEA/2210SN96-0013", 8, 1500.0, true),
            new CatalogoCurso(4, "montacargas", "BEA/2210SN96-0013", 8, 2000.0, false),
            new CatalogoCurso(5, "Motoniveladora", "BEA/2210SN96-0013", 8, 2000.0, true)
        );
    }
}