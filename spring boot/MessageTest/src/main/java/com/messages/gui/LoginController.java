package com.messages.gui;

import java.io.IOException;
import java.net.URL;
import java.util.Optional;

import com.messages.service.LoginService;
import com.messages.util.WebPages;
import javafx.scene.control.PasswordField;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
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

	private ApplicationContext context;
	private LoginService loginService;
	private ChatController chat;
	
	@FXML
	private TextField username;
	@FXML
	private PasswordField password;
	@FXML
	private Text err;
	@FXML
	private Button register;

	public LoginController(ApplicationContext context, LoginService loginService, ChatController chat) {
		this.context = context;
		this.loginService = loginService;
		this.chat = chat;
	}

	@FXML
	public void register() throws IOException {
		URL registerPage = (new ClassPathResource(WebPages.REGISTER)).getURL();
		FXMLLoader loader = new FXMLLoader(registerPage);
		loader.setControllerFactory(context::getBean);
		Parent root = loader.load();
		
		Scene scene = new Scene(root);
		
		Stage stage = (Stage) register.getScene().getWindow();
		
		stage.setScene(scene);
		stage.setTitle("Register Page");
	}

	@FXML
	public void login() throws IOException {

		Optional<User> userSearch = loginService.login(username.getText(), password.getText(), err);

		if(!userSearch.isPresent()) {
			return;
		}

		User user = userSearch.get();

		URL loginPage = (new ClassPathResource(WebPages.CHAT)).getURL();
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

		chat.setUsername(user);
	}
}
