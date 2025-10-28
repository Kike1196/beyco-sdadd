package com.beyco.app.services;

import com.beyco.app.models.Curso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CursoInstructorService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Curso> getCursosByInstructor(int instructorId) {
        String sql = "SELECT c.id_curso, c.nombre_curso, c.clave_stps, c.horas, " +
                    "c.fecha_ingreso, e.nombre AS nombre_empresa, " +
                    "u.nombre AS nombre_instructor, c.lugar, c.precio " +
                    "FROM cursos c " +
                    "LEFT JOIN empresas e ON c.empresa_id = e.id_empresa " +
                    "LEFT JOIN usuarios u ON c.instructor_id = u.id_usuario " +
                    "WHERE c.instructor_id = ?";
        
        return jdbcTemplate.query(sql, new Object[]{instructorId}, (rs, rowNum) -> {
            Curso curso = new Curso();
            curso.setId(rs.getInt("id_curso"));
            curso.setNombre(rs.getString("nombre_curso"));
            curso.setStps(rs.getString("clave_stps"));
            curso.setHoras(rs.getInt("horas"));
            
            // Manejar fecha que puede ser null
            if (rs.getDate("fecha_ingreso") != null) {
                curso.setFechaIngreso(rs.getDate("fecha_ingreso").toLocalDate());
            }
            
            curso.setEmpresa(rs.getString("nombre_empresa"));
            curso.setInstructor(rs.getString("nombre_instructor"));
            curso.setLugar(rs.getString("lugar"));
            
            // Manejar precio que puede ser null
            if (rs.getBigDecimal("precio") != null) {
                curso.setPrecio(rs.getBigDecimal("precio"));
            }
            
            return curso;
        });
    }
}