package com.budgetbuddy;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class BudgetBuddyApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory(".")
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(BudgetBuddyApplication.class, args);
    }

}
