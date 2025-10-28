package com.beyco.app.services;

import com.beyco.app.models.HistorialCurso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HistorialCursoService {

    private final DataSource dataSource;

    @Autowired
    public HistorialCursoService(DataSource dataSource) {
        this.dataSource = dataSource;
        System.out.println("🎯 HistorialCursoService INICIALIZADO!");
    }

    public List<HistorialCurso> obtenerHistorialCompleto() {
        System.out.println("🔍 HistorialCursoService: Obteniendo historial...");
        
        // Por ahora, devuelve una lista vacía para pruebas
        List<HistorialCurso> historial = new ArrayList<>();
        
        // Datos de prueba
        historial.add(new HistorialCurso(
            1, "Curso de Prueba", "TEST-001", 8, 
            LocalDate.now(), "Instructor Demo", "Empresa Demo", 
            "Lugar Demo", BigDecimal.valueOf(1000), "Activo"
        ));
        
        System.out.println("✅ HistorialCursoService: Devolviendo " + historial.size() + " cursos");
        return historial;
    }
}