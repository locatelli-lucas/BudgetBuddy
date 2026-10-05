package com.budgetbuddy.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy(DataSource dataSource) {
        return flyway -> {
            try (var connection = dataSource.getConnection()) {
                String databaseName = connection.getMetaData().getDatabaseProductName();
                if ("H2".equalsIgnoreCase(databaseName)) {
                    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
                    // Create alias for PostgreSQL-specific gen_random_uuid() in H2
                    // We do this here instead of in a migration to avoid "already exists" errors on restarts
                    jdbcTemplate.execute("CREATE ALIAS IF NOT EXISTS GEN_RANDOM_UUID FOR \"java.util.UUID.randomUUID\"");
                    // Set non-keywords to avoid conflicts with reserved words in migrations
                    jdbcTemplate.execute("SET NON_KEYWORDS MONTH, YEAR");
                }
            } catch (Exception e) {
                // Silently skip or log as warning
            }
            flyway.migrate();
        };
    }
}
