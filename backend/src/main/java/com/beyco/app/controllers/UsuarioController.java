package com.beyco.app.controllers;
import com.beyco.app.models.Usuario;
import com.beyco.app.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://192.168.0.55:3000", 
                       "http://10.0.46.106:3000", "http://10.0.47.108:3000", 
                       "http://10.0.45.30:3000", "http://10.0.43.190:3000"})
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // ✅ ENDPOINT GET - LISTAR USUARIOS (YA EXISTE)
    @GetMapping
    public ResponseEntity<?> listarUsuarios() {
        try {
            System.out.println("📋 Solicitando lista de usuarios");
            List<Usuario> usuarios = usuarioService.listarUsuarios();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", usuarios);
            response.put("total", usuarios.size());
            
            System.out.println("✅ Usuarios encontrados: " + usuarios.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error al listar usuarios: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("success", "false");
            errorResponse.put("error", "Error al obtener usuarios: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT POST - CREAR USUARIO (NUEVO)
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {
        try {
            System.out.println("➕ Creando nuevo usuario: " + usuario.getCorreo());
            System.out.println("📝 Datos recibidos: " + usuario.toString());
            
            // Validar datos requeridos
            if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El nombre es requerido\"}");
            }
            if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"El correo es requerido\"}");
            }
            if (usuario.getContrasena() == null || usuario.getContrasena().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("{\"error\": \"La contraseña es requerida\"}");
            }
            
            boolean creado = usuarioService.crearUsuario(usuario);
            
            if (creado) {
                System.out.println("✅ Usuario creado exitosamente");
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario creado correctamente");
                response.put("data", usuario);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "No se pudo crear el usuario");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.out.println("❌ Error al crear usuario: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear usuario: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT PUT - ACTUALIZAR USUARIO (NUEVO)
    @PutMapping
    public ResponseEntity<?> actualizarUsuario(@RequestBody Usuario usuario) {
        try {
            System.out.println("✏️ Actualizando usuario ID: " + usuario.getNumEmpleado());
            System.out.println("📝 Datos recibidos: " + usuario.toString());
            
            boolean actualizado = usuarioService.actualizarUsuario(usuario);
            
            if (actualizado) {
                System.out.println("✅ Usuario actualizado exitosamente");
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario actualizado correctamente");
                response.put("data", usuario);
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "No se pudo actualizar el usuario");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.out.println("❌ Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al actualizar usuario: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT DELETE - ELIMINAR USUARIO (NUEVO)
    @DeleteMapping("/{numEmpleado}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable int numEmpleado) {
        try {
            System.out.println("🗑️ Eliminando usuario ID: " + numEmpleado);
            
            boolean eliminado = usuarioService.eliminarUsuario(numEmpleado);
            
            if (eliminado) {
                System.out.println("✅ Usuario eliminado/desactivado exitosamente");
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Usuario eliminado correctamente");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "No se pudo eliminar el usuario");
                return ResponseEntity.status(500).body(errorResponse);
            }
        } catch (Exception e) {
            System.out.println("❌ Error al eliminar usuario: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al eliminar usuario: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // ✅ ENDPOINT LOGIN (YA EXISTE)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            System.out.println("🔍 Credenciales recibidas: " + credentials);
            
            String correo = credentials.get("correo") != null ? 
                credentials.get("correo") : credentials.get("usuario");
            String contrasena = credentials.get("contrasena");
            
            if (correo == null || contrasena == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"Correo y contraseña son requeridos\"}");
            }

            System.out.println("🔐 Intentando autenticar: " + correo);
            
            Usuario usuario = usuarioService.autenticarYObtenerUsuario(correo, contrasena);
            
            if (usuario != null) {
                System.out.println("✅ Usuario autenticado: " + usuario.getNombre());
                
                Map<String, Object> response = new HashMap<>();
                response.put("id", usuario.getNumEmpleado());
                response.put("name", usuario.getNombre() + " " + usuario.getApellidoPaterno());
                response.put("email", usuario.getCorreo());
                response.put("role", obtenerNombreRol(usuario.getIdRol()));
                response.put("message", "Login exitoso");
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Credenciales inválidas para: " + correo);
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Credenciales inválidas");
                return ResponseEntity.status(401).body(errorResponse);
            }
        } catch (Exception e) {
            System.out.println("💥 Error en login: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error interno del servidor: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    private String obtenerNombreRol(int idRol) {
        switch (idRol) {
            case 1: return "administrador";
            case 2: return "instructor"; 
            case 3: return "secretaria";
            default: return "usuario";
        }
    }
}