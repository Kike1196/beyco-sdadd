package com.beyco.app.services;

import com.beyco.app.models.Curso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CursoService {

    private final DataSource dataSource;

    @Autowired
    public CursoService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Este método se queda como está. Es útil para un panel de administrador.
     */
    public List<Curso> listarTodosLosCursos() {
        List<Curso> cursosAsignados = new ArrayList<>();
        String sql = "SELECT " +
                    "c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, " +
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, " +
                    "u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS";
        
        try (Connection connection = dataSource.getConnection();
            Statement stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                LocalDate fecha = null;
                if (rs.getDate("Fecha_Imparticion") != null) {
                    fecha = rs.getDate("Fecha_Imparticion").toLocalDate();
                }
                
                Curso curso = new Curso();
                curso.setId(rs.getInt("Id_Curso"));
                curso.setNombre(rs.getString("Nombre_curso"));
                curso.setStps(rs.getString("Clave_STPS"));
                
                int horas = rs.getInt("Horas");
                curso.setHoras(horas > 0 ? horas : 8);
                
                curso.setFechaIngreso(fecha);
                curso.setEmpresa(rs.getString("nombre_empresa"));
                curso.setInstructor(rs.getString("nombre_instructor"));
                curso.setLugar(rs.getString("Lugar"));
                curso.setEmpresaId(rs.getInt("Empresa_Id"));
                curso.setInstructorId(rs.getInt("Instructor_Id"));
                
                BigDecimal precio = rs.getBigDecimal("Precio");
                curso.setPrecio(precio != null ? precio : BigDecimal.ZERO);
                curso.setCosto(BigDecimal.ZERO);
                
                // Dato clave para el frontend
                curso.setExamenPractico(rs.getBoolean("Examen_practico")); 
                
                cursosAsignados.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos: " + e.getMessage());
        }
        return cursosAsignados;
    }

    public boolean crearCurso(Curso curso) {
        String sql = "INSERT INTO cursos (Nombre_curso, Fecha_Imparticion, Lugar, Empresa_Id, Instructor_Id, Clave_STPS) VALUES (?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, curso.getNombre());
            pstmt.setDate(2, Date.valueOf(curso.getFechaIngreso()));
            pstmt.setString(3, curso.getLugar());
            pstmt.setInt(4, curso.getEmpresaId());
            pstmt.setInt(5, curso.getInstructorId());
            pstmt.setString(6, curso.getStps());
            
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
            throw new RuntimeException("Error al crear curso: " + e.getMessage());
        }
    }

    public boolean actualizarCurso(Curso curso) {
        String sql = "UPDATE cursos SET Nombre_curso = ?, Fecha_Imparticion = ?, Lugar = ?, Empresa_Id = ?, Instructor_Id = ?, Clave_STPS = ? WHERE Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {

            pstmt.setString(1, curso.getNombre());
            pstmt.setDate(2, Date.valueOf(curso.getFechaIngreso()));
            pstmt.setString(3, curso.getLugar());
            pstmt.setInt(4, curso.getEmpresaId());
            pstmt.setInt(5, curso.getInstructorId());
            pstmt.setString(6, curso.getStps());
            pstmt.setInt(7, curso.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar curso: " + e.getMessage());
        }
    }

    public boolean eliminarCurso(int idCurso) {
        String sql = "DELETE FROM cursos WHERE Id_Curso = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, idCurso);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar curso: " + e.getMessage());
        }
    }

    public List<Curso> listarCursosPorAnio(int anio) {
        List<Curso> cursos = new ArrayList<>();
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, " +
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS " +
                    "WHERE YEAR(c.Fecha_Imparticion) = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, anio);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    LocalDate fecha = null;
                    if (rs.getDate("Fecha_Imparticion") != null) {
                        fecha = rs.getDate("Fecha_Imparticion").toLocalDate();
                    }
                    
                    Curso curso = new Curso();
                    curso.setId(rs.getInt("Id_Curso"));
                    curso.setNombre(rs.getString("Nombre_curso"));
                    curso.setStps(rs.getString("Clave_STPS"));
                    
                    int horas = rs.getInt("Horas");
                    curso.setHoras(horas > 0 ? horas : 8);
                    
                    curso.setFechaIngreso(fecha);
                    curso.setEmpresa(rs.getString("nombre_empresa"));
                    curso.setInstructor(rs.getString("nombre_instructor"));
                    curso.setLugar(rs.getString("Lugar"));
                    curso.setEmpresaId(rs.getInt("Empresa_Id"));
                    curso.setInstructorId(rs.getInt("Instructor_Id"));
                    
                    BigDecimal precio = rs.getBigDecimal("Precio");
                    curso.setPrecio(precio != null ? precio : BigDecimal.ZERO);
                    curso.setCosto(BigDecimal.ZERO);
                    
                    curso.setExamenPractico(rs.getBoolean("Examen_practico")); 
                    
                    cursos.add(curso);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos por año: " + e.getMessage());
        }
        return cursos;
    }

    /**
     * Obtiene cursos por estado (necesitarías agregar un campo estado en la tabla cursos)
     */
    public List<Curso> listarCursosPorEstado(String estado) {
        List<Curso> cursos = new ArrayList<>();
        
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, " +
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS " +
                    "WHERE c.Fecha_Imparticion " + 
                    (estado.equalsIgnoreCase("finalizado") ? " < CURDATE()" : " >= CURDATE()");
     
        try (Connection connection = dataSource.getConnection();
            Statement stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                LocalDate fecha = null;
                if (rs.getDate("Fecha_Imparticion") != null) {
                    fecha = rs.getDate("Fecha_Imparticion").toLocalDate();
                }
                
                Curso curso = new Curso();
                curso.setId(rs.getInt("Id_Curso"));
                curso.setNombre(rs.getString("Nombre_curso"));
                curso.setStps(rs.getString("Clave_STPS"));
                
                int horas = rs.getInt("Horas");
                curso.setHoras(horas > 0 ? horas : 8);
                
                curso.setFechaIngreso(fecha);
                curso.setEmpresa(rs.getString("nombre_empresa"));
                curso.setInstructor(rs.getString("nombre_instructor"));
                curso.setLugar(rs.getString("Lugar"));
                curso.setEmpresaId(rs.getInt("Empresa_Id"));
                curso.setInstructorId(rs.getInt("Instructor_Id"));
                
                BigDecimal precio = rs.getBigDecimal("Precio");
                curso.setPrecio(precio != null ? precio : BigDecimal.ZERO);
                curso.setCosto(BigDecimal.ZERO);
                
                curso.setExamenPractico(rs.getBoolean("Examen_practico")); 
                
                cursos.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos por estado: " + e.getMessage());
        }
        return cursos;
    }

    /**
     * Obtiene estadísticas de cursos
     */
    public Map<String, Object> obtenerEstadisticasCursos(int anio) {
        Map<String, Object> estadisticas = new HashMap<>();
        String sql = "SELECT " +
                    "COUNT(*) as total_cursos, " +
                    "SUM(8) as total_horas, " + // Asumiendo 8 horas por curso
                    "COUNT(DISTINCT Empresa_Id) as total_empresas, " +
                    "COUNT(DISTINCT Instructor_Id) as total_instructores " +
                    "FROM cursos " +
                    "WHERE YEAR(Fecha_Imparticion) = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, anio);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    estadisticas.put("totalCursos", rs.getInt("total_cursos"));
                    estadisticas.put("totalHoras", rs.getInt("total_horas"));
                    estadisticas.put("totalEmpresas", rs.getInt("total_empresas"));
                    estadisticas.put("totalInstructores", rs.getInt("total_instructores"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return estadisticas;
    }

    /**
     * Obtiene cursos asignados a un instructor específico.
     * Esta es la consulta que debe usar el Dashboard del Instructor.
     */
    public List<Curso> listarCursosPorInstructor(int instructorId) {
        List<Curso> cursos = new ArrayList<>();
        
        String sql = "SELECT " +
                    "c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, " +
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, " +
                    "u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS " +
                    "WHERE c.Instructor_Id = ? " +
                    "ORDER BY c.Fecha_Imparticion DESC";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, instructorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    LocalDate fecha = null;
                    if (rs.getDate("Fecha_Imparticion") != null) {
                        fecha = rs.getDate("Fecha_Imparticion").toLocalDate();
                    }
                    
                    Curso curso = new Curso();
                    curso.setId(rs.getInt("Id_Curso"));
                    curso.setNombre(rs.getString("Nombre_curso"));
                    curso.setStps(rs.getString("Clave_STPS"));
                    
                    int horas = rs.getInt("Horas");
                    curso.setHoras(horas > 0 ? horas : 8);
                    
                    curso.setFechaIngreso(fecha);
                    curso.setEmpresa(rs.getString("nombre_empresa"));
                    curso.setInstructor(rs.getString("nombre_instructor"));
                    curso.setLugar(rs.getString("Lugar"));
                    curso.setEmpresaId(rs.getInt("Empresa_Id"));
                    curso.setInstructorId(rs.getInt("Instructor_Id"));
                    
                    BigDecimal precio = rs.getBigDecimal("Precio");
                    curso.setPrecio(precio != null ? precio : BigDecimal.ZERO);
                    curso.setCosto(BigDecimal.ZERO);
                    
                    curso.setExamenPractico(rs.getBoolean("Examen_practico"));
                    
                    cursos.add(curso);
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error SQL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos por instructor: " + e.getMessage());
        }
        
        return cursos;
    }
}