import java.sql.*;

public class Main {
    public static void main(String[] args) {
        String url = "jdbc:mysql://db:3306/capacitacion"; // db = servicio en docker-compose
        String user = "admin";
        String password = "admin";

        try {
            Connection conn = DriverManager.getConnection(url, user, password);
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM usuarios");

            while(rs.next()) {
                System.out.println("Usuario: " + rs.getString("nombre") +
                                   " - Correo: " + rs.getString("correo"));
            }

            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}

