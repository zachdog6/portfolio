package com.messages.gui;

import com.messages.model.Message;
import com.messages.model.User;
import com.messages.service.ChatService;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import com.messages.util.WebPages;
import javafx.stage.Popup;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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

	private ChatService chatService;

	private User currentUser;
	private Popup popup;

	@FXML
	private TabPane tabPane;
	@FXML
	private TextArea textArea;
	@FXML
	private TextField newConnectionString;

	private static final String NO_TAB_ERROR = "Need to connect to a user first!";

	ChatController(ChatService chatService) {
		this.chatService = chatService;
	}

	@FXML
	public void clear() {
		Tab tab = tabPane.getSelectionModel().getSelectedItem();

		if(tabPane.getSelectionModel().getSelectedItem() == null) {
			textArea.setText(NO_TAB_ERROR);
			return;
		}

		AnchorPane anchor = (AnchorPane) tab.getContent();
		ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
		VBox vBox = (VBox) scroll.getContent();
		vBox.getChildren().clear();

		chatService.deleteLogs(currentUser, tab.getText());
	}

	/**
	 * saves currently selected tab chat log to database
	 */
	@FXML
	public void saveChat() {
			Tab tab = tabPane.getSelectionModel().getSelectedItem();

		if(tabPane.getSelectionModel().getSelectedItem() == null) {
			textArea.setText(NO_TAB_ERROR);
			return;
		}

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

			chatService.saveLog(currentUser, tab.getText(), log.toString());
	}

	@FXML
	public void openNewUserPopup() throws IOException {
		URL newConnectionPopup = (new ClassPathResource(WebPages.NEW_EXTERNAL_USER)).getURL();
		FXMLLoader loader = new FXMLLoader(newConnectionPopup);
		loader.setController(this);

		popup = new Popup();
		popup.setAutoFix(true);
		popup.setAutoHide(true);
		popup.getContent().add(loader.load());
		popup.show(textArea.getScene().getWindow());
	}

	@FXML
	public void openSharePopup() throws IOException {
		URL sharePopup = (new ClassPathResource(WebPages.SHARE)).getURL();
		FXMLLoader loader = new FXMLLoader(sharePopup);
		loader.setController(this);

		popup = new Popup();
		popup.setAutoFix(true);
		popup.setAutoHide(true);
		popup.getContent().add(loader.load());

		TextField yourConnectionString = (TextField) popup.getScene().lookup("#yourConnectionString");

		yourConnectionString.setText(currentUser.getUsername() + ";" + currentUser.getLocation());

		popup.show(textArea.getScene().getWindow());
	}

	@FXML
	public void openNewConnection() throws IOException {

		String[] connnectionString = newConnectionString.getText().split(";");

		if(connnectionString.length != 2) {
			newConnectionString.setText("Enter A Valid Connection String");
			return;
		}

		String name = connnectionString[0];
		String url = connnectionString[1];

		InputStream chat = (new ClassPathResource(WebPages.TAB)).getInputStream();
		Tab tab = (new FXMLLoader()).load(chat);
		tab.setText(name);

        if(!chatService.addNewExternalUser(name, currentUser, url, tab)) {
            newConnectionString.setText("Could Not Connect to User");
            return;
        }

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
			textArea.setText(": and ; are invalid characters!");
			return;
		}
		
		if(textArea.getText().equals("")) {
			textArea.setText("Cannot send nothing!");
			return;
		}

		if(tabPane.getSelectionModel().getSelectedItem() == null) {
			textArea.setText(NO_TAB_ERROR);
			return;
		}

		String otherUsername = tabPane.getSelectionModel().getSelectedItem().getText();
		
        if(!chatService.sendMessage(otherUsername, currentUser, textArea.getText())) {
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
                InputStream chat = (new ClassPathResource(WebPages.TAB)).getInputStream();
                Tab tab = (new FXMLLoader()).load(chat);
                tab.setText(otherUsername);

				chatService.addLogs(tab, currentUser, otherUsername);
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

	@GetMapping("/test")
	public String testConnection() {
		return "good";
	}

	@PostMapping(value = { "/message" }, consumes = MediaType.APPLICATION_JSON_VALUE)
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
					InputStream chat = (new ClassPathResource(WebPages.TAB)).getInputStream();
					Tab tab = (new FXMLLoader()).load(chat);
					tab.setText(message.getUsername());

					if(chatService.addNewExternalUser(message.getUsername(), currentUser, message.getUrl(), tab)) {
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

			return "Message Received";
		} else {
            return "User Not Logged In";
        }
	}

	public void setUsername(User currentUser) {
		this.currentUser = currentUser;
	}
}
