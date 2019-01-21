package com.messages.gui;

import java.io.IOException;
import java.net.URL;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.messages.dao.UserDao;
import com.messages.model.User;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.TextField;
import javafx.scene.text.Text;
import javafx.stage.Stage;

/**
 * Controller for register.fxml
 * 
 * @author Zachary Karamanlis
 *
 */
@Component
public class RegisterController {
	
	@Autowired
	private UserDao dao;
	@Autowired
	private ApplicationContext context;
	
	@FXML
	private TextField username;
	@FXML
	private TextField password;
	@FXML
	private TextField name;
	@FXML
	private Text err;

	/**
	 * adds data to database, then redirects to login page
	 * 
	 * @throws IOException
	 */
	@FXML
	public void register() throws IOException {
		if(!dao.findById(username.getText()).isPresent()) {
			
			User user = new User();
			user.setLocation("");
			user.setName(name.getText());
			user.setPassword(password.getText());
			user.setUsername(username.getText());
			
			dao.save(user);
			
			URL loginPage = (new ClassPathResource("LoginPage.fxml")).getURL();
			FXMLLoader loader = new FXMLLoader(loginPage);
			loader.setControllerFactory(context::getBean);
			Parent root = loader.load();
		    
	        Scene scene = new Scene(root);
	        
	        Stage stage = (Stage) username.getScene().getWindow();
	    
	        stage.setTitle("Login Page");
	        stage.setScene(scene);
		}
		else {
			err.setText("Username Already Exists");
		}
	}
	
	@FXML
	public void back() throws IOException {
		URL loginPage = (new ClassPathResource("LoginPage.fxml")).getURL();
		FXMLLoader loader = new FXMLLoader(loginPage);
		loader.setControllerFactory(context::getBean);
		Parent root = loader.load();
	    
        Scene scene = new Scene(root);
        
        Stage stage = (Stage) username.getScene().getWindow();
    
        stage.setTitle("Login Page");
        stage.setScene(scene);
	}
}
