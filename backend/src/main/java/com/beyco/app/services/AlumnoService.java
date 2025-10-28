package com.beyco.app.services;

import com.beyco.app.models.Alumno;
import com.beyco.app.models.Instructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class AlumnoService {

    private final DataSource dataSource;

    @Autowired
    public AlumnoService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Obtiene todos los alumnos activos
     */
    public List<Alumno> listarTodosLosAlumnos() {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC, Activo, Fecha_Registro FROM alumnos WHERE Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Alumno alumno = new Alumno();
                alumno.setCurp(rs.getString("Curp"));
                alumno.setNombre(rs.getString("Nombre"));
                alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                
                if (rs.getDate("Fecha_Nacimiento") != null) {
                    alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                }
                
                alumno.setPuesto(rs.getString("Puesto"));
                alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                alumno.setRfc(rs.getString("RFC"));
                alumno.setActivo(rs.getBoolean("Activo"));
                
                if (rs.getTimestamp("Fecha_Registro") != null) {
                    alumno.setFechaRegistro(rs.getTimestamp("Fecha_Registro").toLocalDateTime());
                }
                
                alumnos.add(alumno);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar alumnos: " + e.getMessage());
        }
        return alumnos;
    }

    /**
     * Crea un nuevo alumno
     */
    public boolean crearAlumno(Alumno alumno) {
        String sql = "INSERT INTO alumnos (Curp, Nombre, Apellido_paterno, Apellido_materno, " +
                    "Fecha_Nacimiento, Puesto, Estado_Nacimiento, RFC, Activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumno.getCurp());
            pstmt.setString(2, alumno.getNombre());
            pstmt.setString(3, alumno.getApellidoPaterno());
            pstmt.setString(4, alumno.getApellidoMaterno());
            pstmt.setDate(5, alumno.getFechaNacimiento() != null ? Date.valueOf(alumno.getFechaNacimiento()) : null);
            pstmt.setString(6, alumno.getPuesto());
            pstmt.setString(7, alumno.getEstadoNacimiento());
            pstmt.setString(8, alumno.getRfc());
            pstmt.setBoolean(9, alumno.isActivo());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear alumno: " + e.getMessage());
        }
    }

    /**
     * Actualiza un alumno existente
     */
    public boolean actualizarAlumno(Alumno alumno) {
        String sql = "UPDATE alumnos SET Nombre = ?, Apellido_paterno = ?, Apellido_materno = ?, " +
                    "Fecha_Nacimiento = ?, Puesto = ?, Estado_Nacimiento = ?, RFC = ?, Activo = ? " +
                    "WHERE Curp = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, alumno.getNombre());
            pstmt.setString(2, alumno.getApellidoPaterno());
            pstmt.setString(3, alumno.getApellidoMaterno());
            pstmt.setDate(4, alumno.getFechaNacimiento() != null ? Date.valueOf(alumno.getFechaNacimiento()) : null);
            pstmt.setString(5, alumno.getPuesto());
            pstmt.setString(6, alumno.getEstadoNacimiento());
            pstmt.setString(7, alumno.getRfc());
            pstmt.setBoolean(8, alumno.isActivo());
            pstmt.setString(9, alumno.getCurp());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar alumno: " + e.getMessage());
        }
    }

    /**
     * Desactiva un alumno (eliminación lógica)
     */
    public boolean desactivarAlumno(String curp) {
        String sql = "UPDATE alumnos SET Activo = 0 WHERE Curp = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, curp);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al desactivar alumno: " + e.getMessage());
        }
    }

    /**
     * Busca alumnos por curso
     */
    public List<Alumno> buscarAlumnosPorCurso(int cursoId) {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT a.Curp, a.Nombre, a.Apellido_paterno, a.Apellido_materno, " +
                    "a.Fecha_Nacimiento, a.Puesto, a.Estado_Nacimiento, a.RFC " +
                    "FROM alumnos a " +
                    "JOIN alumnos_has_cursos ac ON a.Curp = ac.alumnos_Curp " +
                    "WHERE ac.cursos_Id_Curso = ? AND a.Activo = 1";
        
        System.out.println("📋 Buscando alumnos para curso: " + cursoId);
        System.out.println("🔍 SQL: " + sql);
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                int count = 0;
                while (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    // Fecha de nacimiento
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    
                    alumnos.add(alumno);
                    count++;
                    
                    System.out.println("✅ Alumno " + count + ": " + 
                        alumno.getNombre() + " " + alumno.getApellidoPaterno() + 
                        " | CURP: " + alumno.getCurp());
                }
                System.out.println("🎯 Total alumnos encontrados: " + alumnos.size());
            }
            
        } catch (SQLException e) {
            System.err.println("❌ Error SQL en buscarAlumnosPorCurso: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumnos por curso: " + e.getMessage());
        }
        return alumnos;
    }

    /**
     * Busca alumno por CURP
     */
    public Alumno buscarAlumnoPorCurp(String curp) {
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC, Activo FROM alumnos WHERE Curp = ? AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, curp);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    alumno.setActivo(rs.getBoolean("Activo"));
                    
                    return alumno;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumno por CURP: " + e.getMessage());
        }
        return null;
    }

    /**
     * Busca alumnos por nombre (búsqueda parcial)
     */
    public List<Alumno> buscarAlumnosPorNombre(String nombre) {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC FROM alumnos " +
                    "WHERE (Nombre LIKE ? OR Apellido_paterno LIKE ? OR Apellido_materno LIKE ?) AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            String searchTerm = "%" + nombre + "%";
            pstmt.setString(1, searchTerm);
            pstmt.setString(2, searchTerm);
            pstmt.setString(3, searchTerm);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    
                    alumnos.add(alumno);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumnos por nombre: " + e.getMessage());
        }
        return alumnos;
    }

    /**
     * Verifica si un alumno existe por CURP
     */
    public boolean existeAlumno(String curp) {
        String sql = "SELECT 1 FROM alumnos WHERE Curp = ? AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, curp);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al verificar existencia de alumno: " + e.getMessage());
        }
    }

    /**
     * Obtiene el total de alumnos activos
     */
    public int contarAlumnosActivos() {
        String sql = "SELECT COUNT(*) FROM alumnos WHERE Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al contar alumnos activos: " + e.getMessage());
        }
        return 0;
    }

    /**
     * Obtiene alumnos por puesto
     */
    public List<Alumno> buscarAlumnosPorPuesto(String puesto) {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC FROM alumnos WHERE Puesto LIKE ? AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, "%" + puesto + "%");
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    
                    alumnos.add(alumno);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumnos por puesto: " + e.getMessage());
        }
        return alumnos;
    }

    /**
     * Obtiene alumnos por estado de nacimiento
     */
    public List<Alumno> buscarAlumnosPorEstado(String estado) {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC FROM alumnos WHERE Estado_Nacimiento = ? AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, estado);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    
                    alumnos.add(alumno);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumnos por estado: " + e.getMessage());
        }
        return alumnos;
    }

    /**
     * Obtiene todos los instructores (usuarios con rol de instructor)
     */
    public List<Instructor> obtenerTodosLosInstructores() {
        List<Instructor> instructores = new ArrayList<>();
        String sql = "SELECT Num_Empleado, Nombre, Apellido_paterno, Apellido_materno " +
                    "FROM usuarios WHERE Id_Rol = 2 AND Activo = 1"; // Id_Rol = 2 para instructores
        
        try (Connection connection = dataSource.getConnection();
            Statement stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Instructor instructor = new Instructor();
                instructor.setNumEmpleado(rs.getInt("Num_Empleado"));
                instructor.setNombre(rs.getString("Nombre"));
                instructor.setApellidoPaterno(rs.getString("Apellido_paterno"));
                instructor.setApellidoMaterno(rs.getString("Apellido_materno"));
                instructores.add(instructor);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al obtener instructores: " + e.getMessage());
        }
        return instructores;
    }

        public List<Alumno> buscarAlumnosPorApellidos(String apellido) {
        List<Alumno> alumnos = new ArrayList<>();
        String sql = "SELECT Curp, Nombre, Apellido_paterno, Apellido_materno, Fecha_Nacimiento, " +
                    "Puesto, Estado_Nacimiento, RFC, Activo FROM alumnos " +
                    "WHERE (Apellido_paterno LIKE ? OR Apellido_materno LIKE ?) AND Activo = 1";
        
        System.out.println("🔍 Buscando alumnos por apellido: " + apellido);
        System.out.println("📋 SQL: " + sql);
        
        try (Connection connection = dataSource.getConnection();
            PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            String searchTerm = "%" + apellido + "%";
            pstmt.setString(1, searchTerm);
            pstmt.setString(2, searchTerm);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                int count = 0;
                while (rs.next()) {
                    Alumno alumno = new Alumno();
                    alumno.setCurp(rs.getString("Curp"));
                    alumno.setNombre(rs.getString("Nombre"));
                    alumno.setApellidoPaterno(rs.getString("Apellido_paterno"));
                    alumno.setApellidoMaterno(rs.getString("Apellido_materno"));
                    
                    if (rs.getDate("Fecha_Nacimiento") != null) {
                        alumno.setFechaNacimiento(rs.getDate("Fecha_Nacimiento").toLocalDate());
                    }
                    
                    alumno.setPuesto(rs.getString("Puesto"));
                    alumno.setEstadoNacimiento(rs.getString("Estado_Nacimiento"));
                    alumno.setRfc(rs.getString("RFC"));
                    alumno.setActivo(rs.getBoolean("Activo"));
                    
                    alumnos.add(alumno);
                    count++;
                    
                    System.out.println("✅ Alumno " + count + ": " + 
                        alumno.getNombre() + " " + alumno.getApellidoPaterno() + 
                        " " + alumno.getApellidoMaterno());
                }
                System.out.println("🎯 Total alumnos encontrados: " + alumnos.size());
            }
        } catch (SQLException e) {
            System.err.println("❌ Error SQL en buscarAlumnosPorApellidos: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al buscar alumnos por apellidos: " + e.getMessage());
        }
        return alumnos;
    }

        /**
     * Elimina un alumno definitivamente del sistema
     * Primero elimina sus inscripciones y luego el alumno
     */
    @Autowired
    private InscripcionService inscripcionService;

    public boolean eliminarAlumnoDefinitivamente(String curp) {
        Connection connection = null;
        try {
            connection = dataSource.getConnection();
            connection.setAutoCommit(false); // Iniciar transacción
            
            System.out.println("⚠️ Iniciando eliminación definitiva del alumno: " + curp);
            
            // 1. Primero eliminar todas las inscripciones del alumno
            System.out.println("🗑️ Eliminando inscripciones del alumno...");
            boolean inscripcionesEliminadas = inscripcionService.eliminarTodasLasInscripciones(curp);
            System.out.println("✅ Inscripciones eliminadas: " + inscripcionesEliminadas);
            
            // 2. Luego eliminar el alumno de la tabla alumnos
            System.out.println("🗑️ Eliminando alumno de la base de datos...");
            String sql = "DELETE FROM alumnos WHERE Curp = ?";
            
            try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
                pstmt.setString(1, curp);
                int filasAfectadas = pstmt.executeUpdate();
                
                if (filasAfectadas > 0) {
                    connection.commit(); // Confirmar transacción
                    System.out.println("✅ Alumno eliminado definitivamente: " + curp);
                    return true;
                } else {
                    connection.rollback(); // Revertir transacción
                    System.out.println("❌ No se encontró el alumno para eliminar: " + curp);
                    return false;
                }
            }
            
        } catch (SQLException e) {
            // Revertir transacción en caso de error
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException rollbackEx) {
                    System.err.println("❌ Error al revertir transacción: " + rollbackEx.getMessage());
                }
            }
            System.err.println("❌ Error SQL al eliminar alumno: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al eliminar alumno: " + e.getMessage());
        } finally {
            // Restaurar auto-commit y cerrar conexión
            if (connection != null) {
                try {
                    connection.setAutoCommit(true);
                    connection.close();
                } catch (SQLException closeEx) {
                    System.err.println("❌ Error al cerrar conexión: " + closeEx.getMessage());
                }
            }
        }
    }
}