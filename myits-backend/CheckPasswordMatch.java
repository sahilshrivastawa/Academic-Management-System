import java.sql.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class CheckPasswordMatch {
  public static void main(String[] args) throws Exception {
    String email = "sahilkumarpks_cse22@its.edu.in";
    Class.forName("org.h2.Driver");
    try (Connection conn = DriverManager.getConnection("jdbc:h2:file:c:/Users/sahil/OneDrive/Desktop/INTERVIEW/MajorProject/myits-backend/data/myitsdb","sa","");
         PreparedStatement ps = conn.prepareStatement("SELECT password FROM users WHERE LOWER(email)=LOWER(?)")) {
      ps.setString(1,email);
      ResultSet rs = ps.executeQuery();
      if (!rs.next()) { System.out.println("NO_USER"); return; }
      String hash = rs.getString(1);
      BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
      System.out.println("MATCH_ChangeMe@123=" + enc.matches("ChangeMe@123", hash));
      System.out.println("MATCH_changeme@123=" + enc.matches("changeme@123", hash));
    }
  }
}
