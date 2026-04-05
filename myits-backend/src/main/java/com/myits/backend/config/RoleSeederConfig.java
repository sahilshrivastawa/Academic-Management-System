package com.myits.backend.config;

import com.myits.backend.entity.Role;
import com.myits.backend.repository.RoleRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoleSeederConfig {

    @Bean
    CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> {
            List<String> defaultRoles = List.of("ADMIN", "STUDENT", "FACULTY", "GUEST");
            for (String roleName : defaultRoles) {
                if (!roleRepository.existsByRoleName(roleName)) {
                    roleRepository.save(Role.builder().roleName(roleName).build());
                }
            }
        };
    }
}
