package com.beyco.app.services;

import com.beyco.app.models.Evidencia;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class EvidenciaService {

    private final DataSource dataSource;
    
    // Usar directorio fijo para uploads
    private final String uploadDir = "uploads";

    @Autowired
    public EvidenciaService(DataSource dataSource) {
        this.dataSource = dataSource;
        // Crear directorio al iniciar el servicio
        crearDirectorioUploads();
    }

    // Crear directorio de uploads si no existe
    private void crearDirectorioUploads() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Directorio de uploads creado: " + uploadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            System.err.println("❌ Error al crear directorio de uploads: " + e.getMessage());
        }
    }

    // Guardar archivo en el sistema de archivos
    private String guardarArchivo(MultipartFile archivo) throws IOException {
        // Generar nombre único para el archivo
        String nombreOriginal = archivo.getOriginalFilename();
        String extension = "";
        if (nombreOriginal != null && nombreOriginal.contains(".")) {
            extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
        }
        
        String nombreUnico = UUID.randomUUID().toString() + extension;
        Path rutaArchivo = Paths.get(uploadDir).resolve(nombreUnico);
        
        // Guardar archivo
        Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);
        
        System.out.println("📁 Archivo guardado: " + rutaArchivo.toAbsolutePath());
        return nombreUnico;
    }

    // SUBIR EVIDENCIA
    public boolean subirEvidencia(MultipartFile archivo, String tipoEvidencia, 
                                 String descripcion, String observaciones, int cursosIdCurso) {
        String sql = "INSERT INTO evidencia_cursos (Tipo_Evidencia, Descripcion, Archivo_Ruta, Fecha_Subida, Estatus, Observaciones, cursos_Id_Curso) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            // Validar archivo
            if (archivo.isEmpty()) {
                throw new IllegalArgumentException("El archivo no puede estar vacío");
            }
            
            // Validar tipo de archivo
            String contentType = archivo.getContentType();
            if (contentType == null || 
                (!contentType.startsWith("image/") && 
                 !contentType.startsWith("video/") && 
                 !contentType.equals("application/pdf"))) {
                throw new IllegalArgumentException("Tipo de archivo no permitido. Solo se permiten imágenes, videos y PDF.");
            }
            
            // Validar tamaño del archivo (50MB máximo)
            if (archivo.getSize() > 50 * 1024 * 1024) {
                throw new IllegalArgumentException("El archivo es demasiado grande. Máximo 50MB.");
            }
            
            // Guardar archivo
            String nombreArchivo = guardarArchivo(archivo);
            
            // Insertar en base de datos
            pstmt.setString(1, tipoEvidencia);
            pstmt.setString(2, descripcion);
            pstmt.setString(3, nombreArchivo);
            pstmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(5, "pendiente"); // Estatus por defecto
            pstmt.setString(6, observaciones);
            pstmt.setInt(7, cursosIdCurso);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Evidencia guardada en BD. Filas afectadas: " + filasAfectadas);
            return filasAfectadas > 0;
            
        } catch (SQLException | IOException e) {
            System.err.println("❌ Error al subir evidencia: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al subir evidencia: " + e.getMessage(), e);
        }
    }

    // OBTENER EVIDENCIA POR CURSO
    public List<Evidencia> obtenerEvidenciaPorCurso(int cursoId) {
        List<Evidencia> evidencias = new ArrayList<>();
        String sql = "SELECT * FROM evidencia_cursos WHERE cursos_Id_Curso = ? ORDER BY Fecha_Subida DESC";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    evidencias.add(mapRowToEvidencia(rs));
                }
            }
            System.out.println("✅ Evidencias encontradas para curso " + cursoId + ": " + evidencias.size());
        } catch (SQLException e) {
            System.err.println("❌ Error al obtener evidencia por curso: " + e.getMessage());
            throw new RuntimeException("Error al obtener evidencia por curso", e);
        }
        return evidencias;
    }

    // OBTENER TODAS LAS EVIDENCIAS
    public List<Evidencia> obtenerTodasLasEvidencias() {
        List<Evidencia> evidencias = new ArrayList<>();
        String sql = "SELECT * FROM evidencia_cursos ORDER BY Fecha_Subida DESC";
        
        try (Connection connection = dataSource.getConnection();
             Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                evidencias.add(mapRowToEvidencia(rs));
            }
            System.out.println("✅ Total de evidencias encontradas: " + evidencias.size());
        } catch (SQLException e) {
            System.err.println("❌ Error al obtener todas las evidencias: " + e.getMessage());
            throw new RuntimeException("Error al obtener todas las evidencias", e);
        }
        return evidencias;
    }

    // OBTENER EVIDENCIA POR ID
    public Evidencia obtenerEvidenciaPorId(int idEvidencia) {
        String sql = "SELECT * FROM evidencia_cursos WHERE Id_Evidencia = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, idEvidencia);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("✅ Evidencia encontrada con ID: " + idEvidencia);
                    return mapRowToEvidencia(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error al obtener evidencia por ID: " + e.getMessage());
            throw new RuntimeException("Error al obtener evidencia por ID", e);
        }
        System.out.println("⚠️ Evidencia no encontrada con ID: " + idEvidencia);
        return null;
    }

    // ACTUALIZAR ESTATUS DE EVIDENCIA
    public boolean actualizarEstatus(int idEvidencia, String nuevoEstatus) {
        String sql = "UPDATE evidencia_cursos SET Estatus = ? WHERE Id_Evidencia = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setString(1, nuevoEstatus);
            pstmt.setInt(2, idEvidencia);
            
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Estatus actualizado para evidencia " + idEvidencia + " a: " + nuevoEstatus + ". Filas afectadas: " + filasAfectadas);
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("❌ Error al actualizar estatus de evidencia: " + e.getMessage());
            throw new RuntimeException("Error al actualizar estatus de evidencia", e);
        }
    }

    // ELIMINAR EVIDENCIA
    public boolean eliminarEvidencia(int idEvidencia) {
        String sql = "DELETE FROM evidencia_cursos WHERE Id_Evidencia = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            // Primero obtener información del archivo para eliminarlo del sistema de archivos
            Evidencia evidencia = obtenerEvidenciaPorId(idEvidencia);
            if (evidencia != null) {
                // Eliminar archivo del sistema de archivos
                Path rutaArchivo = Paths.get(uploadDir).resolve(evidencia.getArchivoRuta());
                if (Files.exists(rutaArchivo)) {
                    Files.delete(rutaArchivo);
                    System.out.println("🗑️ Archivo eliminado del sistema: " + rutaArchivo.getFileName());
                }
            }
            
            pstmt.setInt(1, idEvidencia);
            int filasAfectadas = pstmt.executeUpdate();
            System.out.println("✅ Evidencia eliminada de BD. Filas afectadas: " + filasAfectadas);
            return filasAfectadas > 0;
        } catch (SQLException | IOException e) {
            System.err.println("❌ Error al eliminar evidencia: " + e.getMessage());
            throw new RuntimeException("Error al eliminar evidencia", e);
        }
    }

    // OBTENER ARCHIVO PARA DESCARGA
    public byte[] obtenerArchivo(int idEvidencia) throws IOException {
        Evidencia evidencia = obtenerEvidenciaPorId(idEvidencia);
        if (evidencia == null) {
            throw new RuntimeException("Evidencia no encontrada con ID: " + idEvidencia);
        }
        
        Path rutaArchivo = Paths.get(uploadDir).resolve(evidencia.getArchivoRuta());
        if (!Files.exists(rutaArchivo)) {
            throw new IOException("Archivo no encontrado: " + evidencia.getArchivoRuta() + " en " + rutaArchivo.toAbsolutePath());
        }
        
        System.out.println("📥 Descargando archivo: " + rutaArchivo.toAbsolutePath());
        return Files.readAllBytes(rutaArchivo);
    }

    // VERIFICAR SI EXISTE EVIDENCIA PARA UN CURSO
    public boolean existeEvidenciaParaCurso(int cursoId) {
        String sql = "SELECT COUNT(*) FROM evidencia_cursos WHERE cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    System.out.println("🔍 Curso " + cursoId + " tiene " + count + " evidencias");
                    return count > 0;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error al verificar evidencia para curso: " + e.getMessage());
            throw new RuntimeException("Error al verificar evidencia para curso", e);
        }
        return false;
    }

    // CONTAR EVIDENCIAS POR CURSO
    public int contarEvidenciasPorCurso(int cursoId) {
        String sql = "SELECT COUNT(*) FROM evidencia_cursos WHERE cursos_Id_Curso = ?";
        
        try (Connection connection = dataSource.getConnection();
             PreparedStatement pstmt = connection.prepareStatement(sql)) {
            
            pstmt.setInt(1, cursoId);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    int count = rs.getInt(1);
                    System.out.println("📊 Curso " + cursoId + " tiene " + count + " evidencias");
                    return count;
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error al contar evidencias por curso: " + e.getMessage());
            throw new RuntimeException("Error al contar evidencias por curso", e);
        }
        return 0;
    }

    // Método de ayuda para mapear ResultSet a Evidencia
    private Evidencia mapRowToEvidencia(ResultSet rs) throws SQLException {
        Evidencia evidencia = new Evidencia();
        evidencia.setIdEvidencia(rs.getInt("Id_Evidencia"));
        evidencia.setTipoEvidencia(rs.getString("Tipo_Evidencia"));
        evidencia.setDescripcion(rs.getString("Descripcion"));
        evidencia.setArchivoRuta(rs.getString("Archivo_Ruta"));
        evidencia.setFechaSubida(rs.getTimestamp("Fecha_Subida").toLocalDateTime());
        evidencia.setEstatus(rs.getString("Estatus"));
        evidencia.setObservaciones(rs.getString("Observaciones"));
        evidencia.setCursosIdCurso(rs.getInt("cursos_Id_Curso"));
        return evidencia;
    }
}