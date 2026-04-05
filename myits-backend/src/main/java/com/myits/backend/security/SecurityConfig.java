package com.myits.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/swagger-resources/**", "/swagger-config", "/webjars/**", "/v3/api-docs", "/v3/api-docs/**", "/api-docs", "/api-docs/**", "/favicon.ico", "/h2-console/**").permitAll()
                    .requestMatchers("/auth/**", "/api/v1/auth/**", "/api/v1/health", "/api/v1/").permitAll()
                        .requestMatchers("/api/v1/admin/**", "/api/v1/admins/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/guests/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/faculty/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/students/messages", "/api/v1/students/messages/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/students/messages", "/api/v1/students/messages/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/students/me/profile").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/students", "/api/v1/students/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/students/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/courses/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/enrollments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/enrollments/students/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/enrollments/courses/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/enrollments/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
