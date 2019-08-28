package com.messages.main;

import java.net.URL;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

@SpringBootApplication
@ComponentScan({ "com.messages.gui", "com.messages.main", "com.messages.service" })
@EntityScan("com.messages.model")
@EnableJpaRepositories("com.messages.dao")
public class MessageTestApplication extends Application {
	
	static ApplicationContext context;
	
	public static void main(String[] args) {
		context = SpringApplication.run(MessageTestApplication.class, args);
		launch(args);
	}

	@Override
	public void start(Stage stage) throws Exception {
		URL loginPage = (new ClassPathResource("LoginPage.fxml")).getURL();
		FXMLLoader loader = new FXMLLoader(loginPage);
		loader.setControllerFactory(context::getBean);
		Parent root = loader.load();
	    
        Scene scene = new Scene(root);
    
        stage.setTitle("Login Page");
        stage.setScene(scene);
        stage.show();
        
        stage.setOnCloseRequest(event -> {
        	ConfigurableApplicationContext config = (ConfigurableApplicationContext) context;
        	config.close();
        });
        
        stage.setResizable(false);
	}
}
