package com.messages.gui;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Optional;

import com.messages.model.ExternalUser;
import com.messages.service.ChatService;
import javafx.stage.Popup;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.messages.model.Log;
import com.messages.model.Message;
import com.messages.model.User;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Node;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

import javax.servlet.http.HttpServletRequest;

@RestController
public class ChatController {

	@Autowired
	private ChatService chatService;

	private String username;
	private static Popup popup;

	@FXML
	private TabPane tabPane;
	@FXML
	private TextArea textArea;
	@FXML
	private TextField newConnectionString;

	/**
	 * Clears currently selected tab of messages, both on screen and in database
	 */
	@FXML
	public void clear() {
			Tab tab = tabPane.getSelectionModel().getSelectedItem();

			AnchorPane anchor = (AnchorPane) tab.getContent();
			ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
			VBox vBox = (VBox) scroll.getContent();
			vBox.getChildren().clear();

			chatService.deleteLogs(username, tab.getText());
	}

	/**
	 * saves currently selected tab chat log to database
	 */
	@FXML
	public void saveChat() {
			Tab tab = tabPane.getSelectionModel().getSelectedItem();

			AnchorPane anchor = (AnchorPane) tab.getContent();
			ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
			VBox vBox = (VBox) scroll.getContent();

			StringBuilder log = new StringBuilder();

			for (Node node : vBox.getChildren()) {
				HBox hBox = (HBox) node;
				Text text = (Text) hBox.getChildren().get(0);

				if (hBox.getId().equals("in")) {
					log.append("in:").append(text.getText()).append(";");
				} else {
					log.append("out:").append(text.getText()).append(";");
				}
			}

			chatService.saveLog(username, tab.getText(), log.toString());
	}

	@FXML
	public void openNewUserPopup() throws IOException {
		URL newConnectionPopup = (new ClassPathResource("popup.fxml")).getURL();
		FXMLLoader loader = new FXMLLoader(newConnectionPopup);
		loader.setController(this);

		popup = new Popup();
		popup.getContent().add(loader.load());
		popup.show(textArea.getScene().getWindow());
	}

	@FXML
	public void openSharePopup() throws IOException {
		URL sharePopup = (new ClassPathResource("share.fxml")).getURL();
		FXMLLoader loader = new FXMLLoader(sharePopup);
		loader.setController(this);

		popup = new Popup();
		popup.getContent().add(loader.load());

		TextField yourConnectionString = (TextField) popup.getScene().lookup("#yourConnectionString");

		User user = chatService.getUser(username).get();
		yourConnectionString.setText(user.getUsername() + ";" + user.getLocation());

		popup.show(textArea.getScene().getWindow());
	}

	@FXML
	public void closePopup() {
		popup.hide();
	}

	@FXML
	public void openNewConnection() throws IOException {

		String[] connnectionString = newConnectionString.getText().split(";");

		String name = connnectionString[0];
		String url = connnectionString[1];

		InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
		Tab tab = (new FXMLLoader()).load(chat);
		tab.setText(name);

        if(!chatService.addNewExternalUser(name, url, tab)) {
            newConnectionString.setText("Could Not Connect to User");
            return;
        }
        chatService.addLogs(tab, username, name);

		tabPane.getTabs().add(tab);

		AnchorPane anchor = (AnchorPane) tab.getContent();
		ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
		VBox vBox = (VBox) scroll.getContent();

		scroll.vvalueProperty().bind(vBox.heightProperty());

		popup.hide();
	}

	@FXML
	public void send() {
		
		if(textArea.getText().contains(":") || textArea.getText().contains(";")) {
			textArea.setText(": and ; are invalid chatacters!");
			return;
		}
		
		if(textArea.getText().equals("")) {
			textArea.setText("Cannot send Nothing!");
			return;
		}

		String otherUsername = tabPane.getSelectionModel().getSelectedItem().getText();
		
        if(!chatService.sendMessage(otherUsername, username, textArea.getText())) {
            textArea.setText("user not logged in or cannot reach user");
            return;
        }

        Platform.runLater(() -> {

            for (Tab tab : tabPane.getTabs()) {
                if (tab.getText().equals(otherUsername)) {
                    ChatService.addOutMessage(tab, textArea.getText());
                    return;
                }
            }

            try {
                InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
                Tab tab = (new FXMLLoader()).load(chat);
                tab.setText(otherUsername);

				chatService.addLogs(tab, username, otherUsername);
				ChatService.addOutMessage(tab, textArea.getText());

                tabPane.getTabs().add(tab);

                AnchorPane anchor = (AnchorPane) tab.getContent();
                ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
                VBox vBox = (VBox) scroll.getContent();

                scroll.vvalueProperty().bind(vBox.heightProperty());

            } catch (IOException e) {
                e.printStackTrace();
            }

        });
	}

	@RequestMapping("/test")
	public String testConnection() {
		return "good";
	}

	@RequestMapping(value = { "/message" }, method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public String postMessage(@RequestBody Message message, HttpServletRequest request) {

		if (tabPane != null) {

			Platform.runLater(() -> {

				for (Tab tab : tabPane.getTabs()) {
					if (tab.getText().equals(message.getUsername())) {
						ChatService.addInMessage(tab, message.getMessage());
						return;
					}
				}

				try {
					InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
					Tab tab = (new FXMLLoader()).load(chat);
					tab.setText(message.getUsername());

					if(chatService.addNewExternalUser(message.getUsername(), message.getUrl(), tab)) {

						chatService.addLogs(tab, username, message.getUsername());
						ChatService.addInMessage(tab, message.getMessage());

						tabPane.getTabs().add(tab);

						AnchorPane anchor = (AnchorPane) tab.getContent();
						ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
						VBox vBox = (VBox) scroll.getContent();

						scroll.vvalueProperty().bind(vBox.heightProperty());
					}

				} catch (IOException e) {
					e.printStackTrace();
				}

			});

			return "Message Recieved";
		} else
			return "User Not Logged In";
	}

	public void setUsername(String username) {
		this.username = username;
	}
}
