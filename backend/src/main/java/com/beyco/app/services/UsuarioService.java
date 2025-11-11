package com.beyco.app.services;

import com.beyco.app.models.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final DataSource dataSource;

    @Autowired
    public UsuarioService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // ========== MÉTODO DE AUTENTICACIÓN SIMPLIFICADO (TEXTO PLANO) ==========
    public Usuario autenticarUsuario(String correo, String contrasenaPlana) {
        System.out.println("🔐 AUTENTICACIÓN TEXTO PLANO - Correo: " + correo);
        System.out.println("🔑 Contraseña ingresada: " + contrasenaPlana);
        
        String sql = "SELECT * FROM usuarios WHERE Correo = ? AND Activo = 1";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String contrasenaAlmacenada = rs.getString("Contrasena");
                    String nombre = rs.getString("Nombre");
                    int idRol = rs.getInt("Id_Rol");
                    
                    System.out.println("📋 Usuario BD: " + nombre);
                    System.out.println("🔑 Contraseña BD: " + contrasenaAlmacenada);
                    System.out.println("🎭 Rol: " + idRol);
                    
                    // COMPARACIÓN DIRECTA EN TEXTO PLANO
                    boolean coincide = contrasenaPlana.equals(contrasenaAlmacenada);
                    System.out.println("🔍 Contraseñas coinciden: " + coincide);
                    
                    if (coincide) {
                        System.out.println("🎉 AUTENTICACIÓN EXITOSA: " + nombre);
                        return mapRowToUsuario(rs);
                    } else {
                        System.out.println("❌ CONTRASEÑA INCORRECTA");
                        System.out.println("   Esperada: " + contrasenaAlmacenada);
                        System.out.println("   Recibida: " + contrasenaPlana);
                    }
                } else {
                    System.out.println("❌ USUARIO NO ENCONTRADO O INACTIVO");
                }
            }
        } catch (SQLException e) {
            System.err.println("💥 ERROR SQL: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    // ========== MÉTODOS PARA RECUPERACIÓN ==========
    public String obtenerPreguntaSeguridad(String correo) {
        String sql = "SELECT Pregunta_recuperacion FROM usuarios WHERE Correo = ? AND Activo = 1";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("Pregunta_recuperacion");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean verificarRespuestaSeguridad(String correo, String respuesta) {
        String sql = "SELECT 1 FROM usuarios WHERE Correo = ? AND Respuesta_recuperacion = ? AND Activo = 1";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            pstmt.setString(2, respuesta);
            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean actualizarContrasena(String correo, String nuevaContrasena) {
        System.out.println("🔄 Actualizando contraseña a texto plano para: " + correo);
        
        String sql = "UPDATE usuarios SET Contrasena = ? WHERE Correo = ? AND Activo = 1";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            // Guardar en TEXTO PLANO
            pstmt.setString(1, nuevaContrasena);
            pstmt.setString(2, correo);
            
            boolean resultado = pstmt.executeUpdate() > 0;
            System.out.println("✅ Contraseña actualizada (texto plano): " + resultado);
            return resultado;
            
        } catch (SQLException e) {
            System.err.println("💥 Error al actualizar contraseña: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    // ========== MÉTODOS CRUD COMPLETOS ==========
    public List<Usuario> listarInstructoresActivos() {
        List<Usuario> instructores = new ArrayList<>();
        String sql = "SELECT * FROM usuarios WHERE Id_Rol = 2 AND Activo = 1 ORDER BY Nombre";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                instructores.add(mapRowToUsuario(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar instructores", e);
        }
        return instructores;
    }

    // MÉTODO FALTANTE: listarUsuariosActivos
    public List<Usuario> listarUsuariosActivos() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios WHERE Activo = 1 ORDER BY Nombre";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                usuarios.add(mapRowToUsuario(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar usuarios activos", e);
        }
        return usuarios;
    }

    public List<Usuario> listarTodosLosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios ORDER BY Num_Empleado";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                usuarios.add(mapRowToUsuario(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar usuarios", e);
        }
        return usuarios;
    }

    public Optional<Usuario> buscarPorId(int numEmpleado) {
        String sql = "SELECT * FROM usuarios WHERE Num_Empleado = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, numEmpleado);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUsuario(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar usuario por ID", e);
        }
        return Optional.empty();
    }

    // MÉTODO FALTANTE: buscarPorCorreo
    public Optional<Usuario> buscarPorCorreo(String correo) {
        String sql = "SELECT * FROM usuarios WHERE Correo = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUsuario(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar usuario por correo", e);
        }
        return Optional.empty();
    }

    // MÉTODO FALTANTE: crearUsuario
    public boolean crearUsuario(Usuario usuario) {
        // Verificar si el correo ya existe
        if (buscarPorCorreo(usuario.getCorreo()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya está registrado");
        }

        String sql = "INSERT INTO usuarios (Nombre, Apellido_paterno, Apellido_materno, Correo, Contrasena, " +
                    "Id_Rol, Activo, Fecha_Ingreso, Pregunta_recuperacion, Respuesta_recuperacion, Firma) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            pstmt.setString(1, usuario.getNombre());
            pstmt.setString(2, usuario.getApellidoPaterno());
            pstmt.setString(3, usuario.getApellidoMaterno());
            pstmt.setString(4, usuario.getCorreo());
            pstmt.setString(5, usuario.getContrasena()); // Texto plano
            pstmt.setInt(6, usuario.getIdRol());
            pstmt.setBoolean(7, usuario.isActivo());
            pstmt.setDate(8, Date.valueOf(usuario.getFechaIngreso()));
            pstmt.setString(9, usuario.getPreguntaRecuperacion());
            pstmt.setString(10, usuario.getRespuestaRecuperacion());
            pstmt.setString(11, usuario.getFirma());
            
            int affectedRows = pstmt.executeUpdate();
            
            if (affectedRows > 0) {
                // Obtener el ID generado
                try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        usuario.setNumEmpleado(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear usuario", e);
        }
        return false;
    }

    // MÉTODO FALTANTE: actualizarUsuario
    public boolean actualizarUsuario(Usuario usuario) {
        // Verificar si el usuario existe
        Optional<Usuario> usuarioExistente = buscarPorId(usuario.getNumEmpleado());
        if (usuarioExistente.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }

        StringBuilder sqlBuilder = new StringBuilder();
        sqlBuilder.append("UPDATE usuarios SET Nombre = ?, Apellido_paterno = ?, Apellido_materno = ?, ");
        sqlBuilder.append("Correo = ?, Id_Rol = ?, Activo = ?, Fecha_Ingreso = ?, ");
        sqlBuilder.append("Pregunta_recuperacion = ?, Respuesta_recuperacion = ?, Firma = ? ");
        sqlBuilder.append("WHERE Num_Empleado = ?");

        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sqlBuilder.toString())) {
            
            pstmt.setString(1, usuario.getNombre());
            pstmt.setString(2, usuario.getApellidoPaterno());
            pstmt.setString(3, usuario.getApellidoMaterno());
            pstmt.setString(4, usuario.getCorreo());
            pstmt.setInt(5, usuario.getIdRol());
            pstmt.setBoolean(6, usuario.isActivo());
            pstmt.setDate(7, Date.valueOf(usuario.getFechaIngreso()));
            pstmt.setString(8, usuario.getPreguntaRecuperacion());
            pstmt.setString(9, usuario.getRespuestaRecuperacion());
            pstmt.setString(10, usuario.getFirma());
            pstmt.setInt(11, usuario.getNumEmpleado());
            
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar usuario", e);
        }
    }

    // MÉTODO FALTANTE: desactivarUsuario
    public boolean desactivarUsuario(int numEmpleado) {
        String sql = "UPDATE usuarios SET Activo = 0 WHERE Num_Empleado = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, numEmpleado);
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al desactivar usuario", e);
        }
    }

    // MÉTODO FALTANTE: activarUsuario
    public boolean activarUsuario(int numEmpleado) {
        String sql = "UPDATE usuarios SET Activo = 1 WHERE Num_Empleado = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, numEmpleado);
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al activar usuario", e);
        }
    }

    // MÉTODO FALTANTE: actualizarFirma
    public boolean actualizarFirma(int numEmpleado, String rutaFirma) {
        String sql = "UPDATE usuarios SET Firma = ? WHERE Num_Empleado = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, rutaFirma);
            pstmt.setInt(2, numEmpleado);
            return pstmt.executeUpdate() > 0;
            
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar la firma", e);
        }
    }

    // ========== MÉTODO DE MAPEO ==========
    private Usuario mapRowToUsuario(ResultSet rs) throws SQLException {
        Usuario usuario = new Usuario();
        usuario.setNumEmpleado(rs.getInt("Num_Empleado"));
        usuario.setNombre(rs.getString("Nombre"));
        usuario.setApellidoPaterno(rs.getString("Apellido_paterno"));
        usuario.setApellidoMaterno(rs.getString("Apellido_materno"));
        usuario.setCorreo(rs.getString("Correo"));
        usuario.setContrasena(rs.getString("Contrasena"));
        usuario.setIdRol(rs.getInt("Id_Rol"));
        usuario.setActivo(rs.getBoolean("Activo"));
        
        Date fechaIngreso = rs.getDate("Fecha_Ingreso");
        if (fechaIngreso != null) {
            usuario.setFechaIngreso(fechaIngreso.toLocalDate());
        }
        
        usuario.setPreguntaRecuperacion(rs.getString("Pregunta_recuperacion"));
        usuario.setRespuestaRecuperacion(rs.getString("Respuesta_recuperacion"));
        usuario.setFirma(rs.getString("Firma"));
        
        return usuario;
    }
}