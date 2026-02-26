package com.example.HarmoniStay.Backend;

import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@EnableScheduling
@SpringBootApplication
public class HarmoniStayBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HarmoniStayBackendApplication.class, args);
	}

}
