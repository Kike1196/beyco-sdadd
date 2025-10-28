package com.beyco.app.services;

import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.beyco.app.models.EmpresaDTO;
import org.springframework.beans.factory.annotation.Autowired;  
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
@Service
public class EmpresaService {

    private final DataSource dataSource;

    @Autowired
    public EmpresaService(DataSource dataSource) {
        this.dataSource = dataSource;
    }


    public List<EmpresaDTO> listarTodas() {
        List<EmpresaDTO> empresas = new ArrayList<>();
        // USAR NOMBRES EXACTOS DE COLUMNAS: Id, Nombre, Activo
        String sql = "SELECT Id, Nombre FROM empresas";
        
        System.out.println("🔍 Ejecutando query de empresas: " + sql);
        
        try (Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql)) {
            
            System.out.println("✅ Conexión a BD establecida");
            int count = 0;
            
            while (rs.next()) {
                // USAR Id y Nombre (con mayúsculas)
                int id = rs.getInt("Id");
                String nombre = rs.getString("Nombre");
                System.out.println("🏢 Empresa encontrada: " + id + " - " + nombre);
                empresas.add(new EmpresaDTO(id, nombre));
                count++;
            }
            
            System.out.println("✅ Total empresas encontradas en BD: " + count);
            
        } catch (SQLException e) {
            System.err.println("❌ Error en consulta SQL de empresas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al consultar las empresas", e);
        }
        return empresas;
    }
}
