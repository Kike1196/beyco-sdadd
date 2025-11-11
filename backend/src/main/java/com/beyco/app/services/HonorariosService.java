package com.beyco.app.services;

import com.beyco.app.models.HonorariosInstructorDTO;
import com.beyco.app.models.PagoInstructor;
import com.beyco.app.models.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HonorariosService {

    private final DataSource dataSource;

    @Autowired
    public HonorariosService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // Obtener lista de instructores activos
    public List<Usuario> listarInstructoresActivos() {
        List<Usuario> instructores = new ArrayList<>();
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno, Correo " +
                    "FROM usuarios WHERE Id_Rol = 2 AND Activo = 1 " +
                    "ORDER BY Nombre, Apellido_paterno, Apellido_materno";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Usuario instructor = new Usuario();
                instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                instructor.setNombre(rs.getString("Nombre"));
                instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                instructor.setCorreo(rs.getString("Correo"));
                instructores.add(instructor);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar instructores", e);
        }
        return instructores;
    }

    // Obtener cursos pendientes de pago por instructor - ADAPTADO AL MODELO ACTUAL
    public HonorariosInstructorDTO obtenerCursosPendientes(int instructorId, LocalDate fechaInicio, LocalDate fechaFin) {
        HonorariosInstructorDTO honorarios = new HonorariosInstructorDTO();
        List<PagoInstructor> cursosPendientes = new ArrayList<>();
        BigDecimal totalPendiente = BigDecimal.ZERO;
        int totalHoras = 0;

        System.out.println("🔍 Buscando cursos pendientes para instructor: " + instructorId);
        System.out.println("📅 Periodo: " + fechaInicio + " a " + fechaFin);

        // Primero: Obtener información del instructor
        String sqlInstructor = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno, Correo " +
                              "FROM usuarios WHERE Num_Empleado = ? AND Id_Rol = 2 AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sqlInstructor)) {
            
            pstmt.setInt(1, instructorId);
            try (ResultSet rsInstructor = pstmt.executeQuery()) {
                if (rsInstructor.next()) {
                    // Construir nombre completo del instructor
                    String nombreCompleto = rsInstructor.getString("Nombre") + " " + 
                                          rsInstructor.getString("Apellido_paterno") + " " + 
                                          rsInstructor.getString("Apellido_materno");
                    
                    honorarios.setInstructorId(instructorId);
                    honorarios.setInstructorNombre(nombreCompleto.trim());
                    honorarios.setInstructorEmail(rsInstructor.getString("Correo"));
                    
                    System.out.println("✅ Instructor encontrado: " + nombreCompleto + " (ID: " + instructorId + ")");
                } else {
                    System.out.println("❌ Instructor no encontrado o no activo: " + instructorId);
                    throw new RuntimeException("Instructor no encontrado o no activo: " + instructorId);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener información del instructor", e);
        }

        // CONSULTA CORREGIDA: Obtener cursos que NO tienen pagos registrados
        String sqlCursos = "SELECT c.Id_Curso, c.Nombre_curso, c.Fecha_Imparticion, " +
                          "cc.Precio, cc.Horas " +
                          "FROM cursos c " +
                          "INNER JOIN catalogo_cursos cc ON c.Clave_STPS = cc.Clave_STPS " +
                          "INNER JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                          "WHERE c.Instructor_Id = ? " +
                          "AND c.Fecha_Imparticion BETWEEN ? AND ? " +
                          "AND NOT EXISTS (" +
                          "    SELECT 1 FROM pagos_instructores pi " +
                          "    WHERE pi.Instructor_Id = c.Instructor_Id " +
                          "    AND pi.Fecha_Pago = c.Fecha_Imparticion " +
                          "    AND pi.Monto = cc.Precio " +
                          "    AND pi.Estatus IN ('pagado', 'pendiente')" +
                          ") " +
                          "ORDER BY c.Fecha_Imparticion DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sqlCursos)) {
            
            pstmt.setInt(1, instructorId);
            pstmt.setDate(2, Date.valueOf(fechaInicio));
            pstmt.setDate(3, Date.valueOf(fechaFin));
            
            System.out.println("📊 Ejecutando consulta de cursos pendientes...");
            
            try (ResultSet rs = pstmt.executeQuery()) {
                int count = 0;
                while (rs.next()) {
                    count++;
                    PagoInstructor curso = new PagoInstructor();
                    
                    // Usar el campo observaciones para almacenar información del curso
                    String nombreCurso = rs.getString("Nombre_curso");
                    Date fechaImparticion = rs.getDate("Fecha_Imparticion");
                    BigDecimal precio = rs.getBigDecimal("Precio");
                    int horas = rs.getInt("Horas");
                    
                    // Configurar el pago con la información del curso
                    curso.setInstructorId(instructorId);
                    curso.setFechaPago(fechaImparticion != null ? fechaImparticion.toLocalDate() : null);
                    curso.setMonto(precio);
                    curso.setHorasImpartidas(horas);
                    curso.setEstatus("pendiente");
                    curso.setComprobante("");
                    curso.setObservaciones("Curso pendiente de pago: " + nombreCurso + " (ID: " + rs.getInt("Id_Curso") + ")");
                    
                    cursosPendientes.add(curso);
                    
                    // Calcular totales
                    if (curso.getMonto() != null) {
                        totalPendiente = totalPendiente.add(curso.getMonto());
                    }
                    totalHoras += curso.getHorasImpartidas();
                    
                    System.out.println("📋 Curso pendiente " + count + ": " + nombreCurso + 
                                     " - $" + precio + " - " + fechaImparticion +
                                     " - Horas: " + horas);
                }
                System.out.println("✅ Total cursos pendientes encontrados: " + count);
            }
            
            honorarios.setCursosPendientes(cursosPendientes);
            honorarios.setTotalPendiente(totalPendiente);
            honorarios.setTotalHoras(totalHoras);
            
        } catch (SQLException e) {
            System.out.println("❌ Error en consulta SQL: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al obtener cursos pendientes", e);
        }
        
        return honorarios;
    }

    // Generar recibo de pago - CORREGIDO
    public boolean generarReciboPago(int instructorId, List<Integer> cursosIds, String periodoPago, 
                                   LocalDate fechaInicioPeriodo, LocalDate fechaFinPeriodo) {
        Connection connection = null;
        try {
            connection = dataSource.getConnection();
            connection.setAutoCommit(false);
            
            System.out.println("💰 Procesando pago para cursos: " + cursosIds);
            
            // Para cada curso, insertar un registro en pagos_instructores
            String sqlInsert = "INSERT INTO pagos_instructores (Instructor_Id, Fecha_Pago, " +
                              "Monto, Horas_Impartidas, Estatus, Comprobante, Observaciones) " +
                              "SELECT c.Instructor_Id, c.Fecha_Imparticion, cc.Precio, cc.Horas, " +
                              "'pagado', '', CONCAT('Pago procesado - Curso: ', c.Nombre_curso) " +
                              "FROM cursos c " +
                              "INNER JOIN catalogo_cursos cc ON c.Clave_STPS = cc.Clave_STPS " +
                              "WHERE c.Id_Curso = ? AND c.Instructor_Id = ?";
            
            try (PreparedStatement pstmt = connection.prepareStatement(sqlInsert)) {
                for (Integer cursoId : cursosIds) {
                    pstmt.setInt(1, cursoId);
                    pstmt.setInt(2, instructorId);
                    pstmt.addBatch();
                    System.out.println("📝 Agregando curso ID " + cursoId + " al lote de pago");
                }
                
                int[] resultados = pstmt.executeBatch();
                int exitosos = 0;
                
                for (int resultado : resultados) {
                    if (resultado == Statement.SUCCESS_NO_INFO || resultado > 0) {
                        exitosos++;
                    }
                }
                
                System.out.println("✅ Pagos insertados exitosamente: " + exitosos + " de " + cursosIds.size());
                
                if (exitosos == cursosIds.size()) {
                    connection.commit();
                    return true;
                } else {
                    connection.rollback();
                    System.out.println("❌ No se pudieron insertar todos los pagos");
                    return false;
                }
            }
            
        } catch (SQLException e) {
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            System.out.println("❌ Error al generar recibo: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al generar recibo de pago", e);
        } finally {
            if (connection != null) {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // Obtener todos los cursos para debugging - ADAPTADO
    public List<PagoInstructor> obtenerTodosLosCursos() {
        List<PagoInstructor> cursos = new ArrayList<>();
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Fecha_Imparticion, " +
                    "c.Instructor_Id, cc.Precio, cc.Horas " +
                    "FROM cursos c " +
                    "INNER JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "INNER JOIN catalogo_cursos cc ON c.Clave_STPS = cc.Clave_STPS " +
                    "WHERE u.Id_Rol = 2 AND u.Activo = 1 " +
                    "ORDER BY c.Fecha_Imparticion DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                PagoInstructor curso = new PagoInstructor();
                
                String nombreCurso = rs.getString("Nombre_curso");
                Date fechaImparticion = rs.getDate("Fecha_Imparticion");
                
                curso.setInstructorId(rs.getInt("Instructor_Id"));
                curso.setFechaPago(fechaImparticion != null ? fechaImparticion.toLocalDate() : null);
                curso.setMonto(rs.getBigDecimal("Precio"));
                curso.setHorasImpartidas(rs.getInt("Horas"));
                curso.setEstatus("pendiente");
                curso.setComprobante("");
                curso.setObservaciones("Curso: " + nombreCurso + " (ID: " + rs.getInt("Id_Curso") + ")");
                
                cursos.add(curso);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener todos los cursos", e);
        }
        return cursos;
    }

    // Obtener todos los pagos existentes (para debugging)
    public List<PagoInstructor> obtenerTodosLosPagos() {
        List<PagoInstructor> pagos = new ArrayList<>();
        String sql = "SELECT pi.* FROM pagos_instructores pi " +
                    "INNER JOIN usuarios u ON pi.Instructor_Id = u.Num_Empleado " +
                    "WHERE u.Id_Rol = 2 AND u.Activo = 1 " +
                    "ORDER BY pi.Fecha_Pago DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {
            
            while (rs.next()) {
                PagoInstructor pago = new PagoInstructor();
                pago.setId(rs.getInt("Id"));
                pago.setInstructorId(rs.getInt("Instructor_Id"));
                
                Date fechaPago = rs.getDate("Fecha_Pago");
                if (fechaPago != null) {
                    pago.setFechaPago(fechaPago.toLocalDate());
                }
                
                pago.setMonto(rs.getBigDecimal("Monto"));
                pago.setHorasImpartidas(rs.getInt("Horas_Impartidas"));
                pago.setEstatus(rs.getString("Estatus"));
                pago.setComprobante(rs.getString("Comprobante"));
                pago.setObservaciones(rs.getString("Observaciones"));
                
                pagos.add(pago);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener todos los pagos", e);
        }
        return pagos;
    }

    // Método auxiliar para buscar instructores
    public List<Usuario> buscarInstructores(String criterio) {
        List<Usuario> instructores = new ArrayList<>();
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno, Correo " +
                    "FROM usuarios WHERE Id_Rol = 2 AND Activo = 1 " +
                    "AND (Nombre LIKE ? OR Apellido_paterno LIKE ? OR Apellido_materno LIKE ? OR Correo LIKE ?) " +
                    "ORDER BY Nombre, Apellido_paterno, Apellido_materno";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            String likeCriterio = "%" + criterio + "%";
            pstmt.setString(1, likeCriterio);
            pstmt.setString(2, likeCriterio);
            pstmt.setString(3, likeCriterio);
            pstmt.setString(4, likeCriterio);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Usuario instructor = new Usuario();
                    instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                    instructor.setNombre(rs.getString("Nombre"));
                    instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                    instructor.setCorreo(rs.getString("Correo"));
                    instructores.add(instructor);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar instructores", e);
        }
        return instructores;
    }

    // Método para crear pago de prueba
    public boolean crearPagoPrueba(int instructorId, LocalDate fechaCurso, BigDecimal monto, 
                                int horas, String nombreCurso) {
        String sql = "INSERT INTO pagos_instructores (Instructor_Id, Fecha_Pago, Monto, " +
                    "Horas_Impartidas, Estatus, Comprobante, Observaciones) " +
                    "VALUES (?, ?, ?, ?, 'pendiente', '', CONCAT('Curso de prueba: ', ?))";
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, instructorId);
            pstmt.setDate(2, Date.valueOf(fechaCurso));
            pstmt.setBigDecimal(3, monto);
            pstmt.setInt(4, horas);
            pstmt.setString(5, nombreCurso);
            
            int resultado = pstmt.executeUpdate();
            System.out.println("📝 Pago de prueba creado: " + (resultado > 0));
            return resultado > 0;
        } catch (SQLException e) {
            System.out.println("❌ Error al crear pago de prueba: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // NUEVO MÉTODO: Verificar si un curso ya ha sido pagado
    public boolean cursoYaPagado(int cursoId) {
        String sql = "SELECT COUNT(*) as count FROM pagos_instructores pi " +
                    "INNER JOIN cursos c ON pi.Instructor_Id = c.Instructor_Id " +
                    "AND pi.Fecha_Pago = c.Fecha_Imparticion " +
                    "WHERE c.Id_Curso = ? AND pi.Estatus IN ('pagado', 'pendiente')";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("count") > 0;
                }
            }
        } catch (SQLException e) {
            System.out.println("❌ Error al verificar si curso está pagado: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // NUEVO MÉTODO: Obtener cursos por instructor para debugging
    public List<PagoInstructor> obtenerCursosPorInstructor(int instructorId) {
        List<PagoInstructor> cursos = new ArrayList<>();
        String sql = "SELECT c.Id_Curso, c.Nombre_curso, c.Fecha_Imparticion, " +
                    "c.Instructor_Id, cc.Precio, cc.Horas " +
                    "FROM cursos c " +
                    "INNER JOIN usuarios u ON c.Instructor_Id = u.Num_Empleado " +
                    "INNER JOIN catalogo_cursos cc ON c.Clave_STPS = cc.Clave_STPS " +
                    "WHERE c.Instructor_Id = ? AND u.Id_Rol = 2 AND u.Activo = 1 " +
                    "ORDER BY c.Fecha_Imparticion DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, instructorId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    PagoInstructor curso = new PagoInstructor();
                    
                    String nombreCurso = rs.getString("Nombre_curso");
                    Date fechaImparticion = rs.getDate("Fecha_Imparticion");
                    
                    curso.setInstructorId(rs.getInt("Instructor_Id"));
                    curso.setFechaPago(fechaImparticion != null ? fechaImparticion.toLocalDate() : null);
                    curso.setMonto(rs.getBigDecimal("Precio"));
                    curso.setHorasImpartidas(rs.getInt("Horas"));
                    curso.setEstatus("pendiente");
                    curso.setComprobante("");
                    curso.setObservaciones("Curso: " + nombreCurso + " (ID: " + rs.getInt("Id_Curso") + ")");
                    
                    cursos.add(curso);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener cursos por instructor", e);
        }
        return cursos;
    }
}