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
     * Listar todos los cursos incluyendo el campo Pago
     */
    public List<Curso> listarTodosLosCursos() {
        List<Curso> cursosAsignados = new ArrayList<>();
        String sql = "SELECT " +
                    "c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " + // NUEVO: incluir Pago
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
                
                // Campos de precio y pago
                BigDecimal precio = rs.getBigDecimal("Precio");
                curso.setPrecio(precio != null ? precio : BigDecimal.ZERO);
                
                BigDecimal pago = rs.getBigDecimal("Pago");
                curso.setPago(pago != null ? pago : BigDecimal.ZERO); // NUEVO: cargar pago
                
                curso.setCosto(BigDecimal.ZERO);
                curso.setExamenPractico(rs.getBoolean("Examen_practico")); 
                
                cursosAsignados.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos: " + e.getMessage());
        }
        return cursosAsignados;
    }

    /**
     * Crear curso incluyendo el campo Pago
     */
    public boolean crearCurso(Curso curso) {
        String sql = "INSERT INTO cursos (Nombre_curso, Fecha_Imparticion, Lugar, Empresa_Id, Instructor_Id, Clave_STPS, Pago) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, curso.getNombre());
            pstmt.setDate(2, Date.valueOf(curso.getFechaIngreso()));
            pstmt.setString(3, curso.getLugar());
            pstmt.setInt(4, curso.getEmpresaId());
            pstmt.setInt(5, curso.getInstructorId());
            pstmt.setString(6, curso.getStps());
            pstmt.setBigDecimal(7, curso.getPago() != null ? curso.getPago() : BigDecimal.ZERO); // NUEVO: insertar pago
            
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

    /**
     * Actualizar curso incluyendo el campo Pago
     */
    public boolean actualizarCurso(Curso curso) {
        String sql = "UPDATE cursos SET Nombre_curso = ?, Fecha_Imparticion = ?, Lugar = ?, Empresa_Id = ?, Instructor_Id = ?, Clave_STPS = ?, Pago = ? WHERE Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {

            pstmt.setString(1, curso.getNombre());
            pstmt.setDate(2, Date.valueOf(curso.getFechaIngreso()));
            pstmt.setString(3, curso.getLugar());
            pstmt.setInt(4, curso.getEmpresaId());
            pstmt.setInt(5, curso.getInstructorId());
            pstmt.setString(6, curso.getStps());
            pstmt.setBigDecimal(7, curso.getPago() != null ? curso.getPago() : BigDecimal.ZERO); // NUEVO: actualizar pago
            pstmt.setInt(8, curso.getId());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar curso: " + e.getMessage());
        }
    }

    /**
     * Eliminar curso
     */
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

    /**
     * Listar cursos por año incluyendo el campo Pago
     */
    public List<Curso> listarCursosPorAnio(int anio) {
        List<Curso> cursos = new ArrayList<>();
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " + // NUEVO: incluir Pago
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
                    
                    BigDecimal pago = rs.getBigDecimal("Pago");
                    curso.setPago(pago != null ? pago : BigDecimal.ZERO); // NUEVO: cargar pago
                    
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
     * Listar cursos por estado incluyendo el campo Pago
     */
    public List<Curso> listarCursosPorEstado(String estado) {
        List<Curso> cursos = new ArrayList<>();
        
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " + // NUEVO: incluir Pago
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
                
                BigDecimal pago = rs.getBigDecimal("Pago");
                curso.setPago(pago != null ? pago : BigDecimal.ZERO); // NUEVO: cargar pago
                
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
     * Obtener estadísticas de cursos
     */
    public Map<String, Object> obtenerEstadisticasCursos(int anio) {
        Map<String, Object> estadisticas = new HashMap<>();
        String sql = "SELECT " +
                    "COUNT(*) as total_cursos, " +
                    "SUM(8) as total_horas, " + // Asumiendo 8 horas por curso
                    "SUM(Pago) as total_pagos, " + // NUEVO: sumar pagos
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
                    estadisticas.put("totalPagos", rs.getBigDecimal("total_pagos")); // NUEVO: estadística de pagos
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
     * Obtener cursos asignados a un instructor específico incluyendo el campo Pago
     */
    public List<Curso> listarCursosPorInstructor(int instructorId) {
        List<Curso> cursos = new ArrayList<>();
        
        String sql = "SELECT " +
                    "c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " + // NUEVO: incluir Pago
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
                    
                    BigDecimal pago = rs.getBigDecimal("Pago");
                    curso.setPago(pago != null ? pago : BigDecimal.ZERO); // NUEVO: cargar pago
                    
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

    /**
     * Obtener curso por ID incluyendo el campo Pago
     */
    public Curso obtenerCursoPorId(int idCurso) {
        String sql = "SELECT " +
                    "c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " + // NUEVO: incluir Pago
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, " +
                    "u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS " +
                    "WHERE c.Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, idCurso);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
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
                    
                    BigDecimal pago = rs.getBigDecimal("Pago");
                    curso.setPago(pago != null ? pago : BigDecimal.ZERO); // NUEVO: cargar pago
                    
                    curso.setCosto(BigDecimal.ZERO);
                    curso.setExamenPractico(rs.getBoolean("Examen_practico"));
                    
                    return curso;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener curso por ID: " + e.getMessage());
        }
        return null;
    }

    /**
     * Método para actualizar solo el pago de un curso
     */
    public boolean actualizarPagoCurso(int idCurso, BigDecimal pago) {
        String sql = "UPDATE cursos SET Pago = ? WHERE Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {

            pstmt.setBigDecimal(1, pago != null ? pago : BigDecimal.ZERO);
            pstmt.setInt(2, idCurso);
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar pago del curso: " + e.getMessage());
        }
    }

    /**
     * Obtener el total de pagos por año
     */
    public BigDecimal obtenerTotalPagosPorAnio(int anio) {
        String sql = "SELECT SUM(Pago) as total_pagos FROM cursos WHERE YEAR(Fecha_Imparticion) = ?";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, anio);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    BigDecimal total = rs.getBigDecimal("total_pagos");
                    return total != null ? total : BigDecimal.ZERO;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return BigDecimal.ZERO;
    }

    /**
     * Obtener cursos con pagos pendientes (pago = 0 o null)
     */
    public List<Curso> listarCursosConPagosPendientes() {
        List<Curso> cursos = new ArrayList<>();
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Clave_STPS, c.Fecha_Imparticion, c.Lugar, " +
                    "c.Empresa_Id, c.Instructor_Id, c.Pago, " +
                    "cat.Precio, cat.Horas, cat.Examen_practico, " +
                    "e.nombre AS nombre_empresa, u.Nombre AS nombre_instructor " +
                    "FROM cursos c " +
                    "JOIN empresas e ON c.Empresa_Id = e.id " +
                    "JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "LEFT JOIN catalogo_cursos cat ON c.Clave_STPS = cat.Clave_STPS " +
                    "WHERE c.Pago IS NULL OR c.Pago = 0 " +
                    "ORDER BY c.Fecha_Imparticion DESC";
        
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
                
                BigDecimal pago = rs.getBigDecimal("Pago");
                curso.setPago(pago != null ? pago : BigDecimal.ZERO);
                
                curso.setCosto(BigDecimal.ZERO);
                curso.setExamenPractico(rs.getBoolean("Examen_practico")); 
                
                cursos.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar cursos con pagos pendientes: " + e.getMessage());
        }
        return cursos;
    }
}