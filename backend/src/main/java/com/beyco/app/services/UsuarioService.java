package com.beyco.app.services;

import com.beyco.app.models.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
public class UsuarioService {

    // --- CAMBIO: Se inyecta DataSource en lugar de Connection ---
    private final DataSource dataSource;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(DataSource dataSource, PasswordEncoder passwordEncoder) {
        this.dataSource = dataSource;
        this.passwordEncoder = passwordEncoder;
    }

    // LISTAR INSTRUCTORES ACTIVOS
    public List<Usuario> listarInstructores() {
        List<Usuario> instructores = new ArrayList<>();
        String sql = "SELECT * FROM usuarios WHERE Id_Rol = 2 AND Activo = 1";

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

    // --- MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA ---

    public String getPreguntaSeguridadPorCorreo(String correo) {
        String sql = "SELECT Pregunta_recuperacion FROM usuarios WHERE Correo = ?";
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
        String sql = "SELECT 1 FROM usuarios WHERE Correo = ? AND Respuesta_recuperacion = ?";
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
        String contrasenaHasheada = passwordEncoder.encode(nuevaContrasena);
        String sql = "UPDATE usuarios SET Contrasena = ? WHERE Correo = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, contrasenaHasheada);
            pstmt.setString(2, correo);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // --- MÉTODO DE AUTENTICACIÓN ---
    public Usuario autenticarYObtenerUsuario(String correo, String contrasenaPlana) {
        String sql = "SELECT * FROM usuarios WHERE Correo = ? AND Activo = 1";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    String contrasenaHasheada = rs.getString("Contrasena");
                    if (passwordEncoder.matches(contrasenaPlana, contrasenaHasheada)) {
                        return mapRowToUsuario(rs);
                    }
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error durante la autenticación", e);
        }
        return null;
    }

    // --- MÉTODOS CRUD ---

    public List<Usuario> listarUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios";
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

    public boolean crearUsuario(Usuario usuario) {
        String sql = "INSERT INTO usuarios (Nombre, Apellido_paterno, Apellido_materno, Correo, Contrasena, Id_Rol, Activo, Fecha_Ingreso, Pregunta_recuperacion, Respuesta_recuperacion, Firma) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        String contrasenaHasheada = passwordEncoder.encode(usuario.getContrasena());
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, usuario.getNombre());
            pstmt.setString(2, usuario.getApellidoPaterno());
            pstmt.setString(3, usuario.getApellidoMaterno());
            pstmt.setString(4, usuario.getCorreo());
            pstmt.setString(5, contrasenaHasheada);
            pstmt.setInt(6, usuario.getIdRol());
            pstmt.setBoolean(7, usuario.isActivo());
            pstmt.setDate(8, Date.valueOf(usuario.getFechaIngreso()));
            pstmt.setString(9, usuario.getPreguntaRecuperacion());
            pstmt.setString(10, usuario.getRespuestaRecuperacion());
            pstmt.setString(11, usuario.getFirma());
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al crear usuario", e);
        }
    }

    public Usuario buscarUsuarioPorId(int numEmpleado) {
        String sql = "SELECT * FROM usuarios WHERE Num_Empleado = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, numEmpleado);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUsuario(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar usuario por ID", e);
        }
        return null;
    }

    public boolean actualizarUsuario(Usuario usuario) {
        // Lógica para actualizar con o sin contraseña
        boolean tieneNuevaContrasena = usuario.getContrasena() != null && !usuario.getContrasena().isEmpty();
        StringBuilder sqlBuilder = new StringBuilder("UPDATE usuarios SET Nombre = ?, Apellido_paterno = ?, Apellido_materno = ?, ");
        sqlBuilder.append("Correo = ?, Id_Rol = ?, Activo = ?, Fecha_Ingreso = ?, ");
        sqlBuilder.append("Pregunta_recuperacion = ?, Respuesta_recuperacion = ?, Firma = ? ");
        if (tieneNuevaContrasena) {
            sqlBuilder.append(", Contrasena = ? ");
        }
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

            if (tieneNuevaContrasena) {
                String contrasenaHasheada = passwordEncoder.encode(usuario.getContrasena());
                pstmt.setString(11, contrasenaHasheada);
                pstmt.setInt(12, usuario.getNumEmpleado());
            } else {
                pstmt.setInt(11, usuario.getNumEmpleado());
            }
            
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al actualizar usuario", e);
        }
    }

    public boolean eliminarUsuario(int numEmpleado) throws SQLException {
        // Implementamos el "soft delete" que discutimos
        String sql = "UPDATE usuarios SET Activo = 0 WHERE Num_Empleado = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, numEmpleado);
            return pstmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            throw e;
        }
    }

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
    
    // Método de ayuda para no repetir código
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
        usuario.setFechaIngreso(rs.getDate("Fecha_Ingreso").toLocalDate());
        usuario.setPreguntaRecuperacion(rs.getString("Pregunta_recuperacion"));
        usuario.setRespuestaRecuperacion(rs.getString("Respuesta_recuperacion"));
        usuario.setFirma(rs.getString("Firma"));
        return usuario;
    }

    // --- PEGA EL MÉTODO COMPLETO AQUÍ ---
    public Usuario buscarUsuarioPorCorreo(String correo) {
        String sql = "SELECT * FROM usuarios WHERE Correo = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, correo);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    // Reutilizamos el método de mapeo que ya tienes
                    return mapRowToUsuario(rs); 
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("Error al buscar usuario por correo", e);
        }
        return null; // Retorna null si no se encuentra el usuario
    }
}