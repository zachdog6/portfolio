package com.messages.gui;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.messages.dao.UserDao;
import com.messages.model.User;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Pane;
import javafx.scene.text.Text;
import javafx.stage.Stage;

/**
 * Controller for LoginPage.fxml
 * 
 * @author Zachary Karamanlis
 *
 */
@Component
public class LoginController {
	
	@Autowired
	UserDao dao;
	@Autowired
	ApplicationContext context;
	@Autowired
	ChatController chat;
	
	@FXML
	private TextField username;
	@FXML
	private TextField password;
	@FXML
	private TextField url;
	@FXML
	private Text err;
	@FXML
	private Button register;
	
	/**
	 * opens register page
	 * @throws IOException
	 */
	@FXML
	public void register() throws IOException {
		URL registerPage = (new ClassPathResource("register.fxml")).getURL();
		FXMLLoader loader = new FXMLLoader(registerPage);
		loader.setControllerFactory(context::getBean);
		Parent root = loader.load();
		
		Scene scene = new Scene(root);
		
		Stage stage = (Stage) register.getScene().getWindow();
		
		stage.setScene(scene);
		stage.setTitle("Register Page");
	}

	/**
	 * validates login. If okay, redirects to chat page. If not, prints error on screen
	 * 
	 * @throws IOException
	 */
	@FXML
	public void login() throws IOException {
		
		Optional<User> userSearch = dao.findById(username.getText());
		if(userSearch.isPresent()) {
			User user = userSearch.get();
			
			if(user.getPassword().equals(password.getText())) {
				
				//if exception, then user gave bad url
				if(!url.getText().equals("")) {
					try {
						RestTemplate restTemplate = new RestTemplate();
						restTemplate.getForObject(url.getText() + "/test", String.class);
						
						user.setLocation(url.getText());
						dao.save(user);
					}
					catch(Exception e) {
						err.setText("Bad Url\nPlease enter your locaion in the form of http://my_ip_address:8080");
						return;
					}
				}
				else {
					if(user.getLocation().equals("")) {
						err.setText("No Url Saved\nPlease enter your locaion in the form of http://my_ip_address:8080");
						return;
					}
					else {
						try {
							RestTemplate restTemplate = new RestTemplate();
							restTemplate.getForObject(user.getLocation() + "/test", String.class);
						}
						catch(Exception e) {
							err.setText("Bad Saved Url\nPlease enter your locaion in the form of http://ipAddress:8080");
							return;
						}
					}
				}
				
				URL loginPage = (new ClassPathResource("chat.fxml")).getURL();
				FXMLLoader loader = new FXMLLoader(loginPage);
				loader.setControllerFactory(context::getBean);
				Parent root = loader.load();
				
				Pane pane = (Pane) root;
				for(Node node:pane.getChildren()) {
					if(node instanceof HBox) {
						Text text = (Text) ((HBox)node).getChildren().get(0);
						text.setText("Welcome " + user.getName() + "!");
					}
				}
				
				Scene scene = new Scene(root);
				
				Stage stage = (Stage) username.getScene().getWindow();
				
				stage.setScene(scene);
				stage.setTitle("Chat Window");
				
				chat.setUsername(username.getText());
			}
			else {
				err.setText("Wrong password");
				return;
			}
		}
		
		err.setText("Invalid username");
	}
}
