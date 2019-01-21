package com.messages.gui;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

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

import com.messages.dao.LogDao;
import com.messages.dao.UserDao;
import com.messages.model.Log;
import com.messages.model.Message;
import com.messages.model.User;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
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

/**
 * Controller for chat.fxml
 * 
 * @author Zachary Karamanlis
 *
 */
@RestController
public class ChatController {

	@Autowired
	UserDao dao;
	@Autowired
	LogDao logDao;

	private String username;

	@FXML
	TextField name;
	@FXML
	TabPane tabPane;
	@FXML
	TextArea textArea;

	/**
	 * Clears currently selected tab of messages, both on screen and in database
	 */
	@FXML
	public void clear() {
		for (Tab tab : tabPane.getTabs()) {
			if (tab.isSelected()) {
				AnchorPane anchor = (AnchorPane) tab.getContent();
				ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
				VBox vBox = (VBox) scroll.getContent();
				vBox.getChildren().clear();
				
				User me = dao.findById(username).get();
				User other = dao.findById(tab.getText()).get();

				Optional<Log> logs = logDao.findByUsernameAndOtherUser(me, other);
				
				if (logs.isPresent()) {
					logDao.delete(logs.get());
				}
			}
		}
	}

	/**
	 * saves currently selected tab chat log to database
	 */
	@FXML
	public void saveChat() {
		for (Tab tab : tabPane.getTabs()) {
			if (tab.isSelected()) {
				AnchorPane anchor = (AnchorPane) tab.getContent();
				ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
				VBox vBox = (VBox) scroll.getContent();

				String log = "";

				for (Node node : vBox.getChildren()) {
					HBox hBox = (HBox) node;
					Text text = (Text) hBox.getChildren().get(0);

					if (hBox.getId().equals("in")) {
						log += "in:" + text.getText() + ";";
					} else {
						log += "out:" + text.getText() + ";";
					}
				}

				User me = dao.findById(username).get();
				User other = dao.findById(tab.getText()).get();

				Optional<Log> logs = logDao.findByUsernameAndOtherUser(me, other);

				if (logs.isPresent()) {
					Log logObj = logs.get();
					logObj.setLog(log);

					logDao.save(logObj);
				} else {
					Log logObj = new Log();
					logObj.setLog(log);
					logObj.setOtherUser(other);
					logObj.setUsername(me);

					logDao.save(logObj);
				}
			}
		}
	}

	/**
	 * opens a new tab based on input in name field
	 * 
	 * colors field red if invalid username
	 * 
	 * @throws IOException
	 */
	@FXML
	public void open() throws IOException {

		Optional<User> userSearch = dao.findById(name.getText());

		if (userSearch.isPresent()) {
			name.setStyle("-fx-text-inner-color: black;");

			InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
			Tab tab = (new FXMLLoader()).load(chat);
			tab.setText(name.getText());

			User me = dao.findById(username).get();
			Optional<Log> log = logDao.findByUsernameAndOtherUser(me, userSearch.get());

			if (log.isPresent()) {
				String[] logSplit = log.get().getLog().split(";");

				for (String message : logSplit) {
					String[] messageSplit = message.split(":");

					if (messageSplit[0].equals("in")) {
						addInMessage(tab, messageSplit[1]);
					} else {
						addOutMessage(tab, messageSplit[1]);
					}
				}
			}

			tabPane.getTabs().add(tab);

			AnchorPane anchor = (AnchorPane) tab.getContent();
			ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
			VBox vBox = (VBox) scroll.getContent();

			scroll.vvalueProperty().bind(vBox.heightProperty());
		} else {
			name.setStyle("-fx-text-inner-color: red;");
		}
	}

	/**
	 * sends message in text area to user given in name field
	 * 
	 * colors field red if invalid username.
	 * prints error messages to text area if user not logged in.
	 */
	@FXML
	public void send() {
		
		if(textArea.getText().contains(":") || textArea.getText().contains(";")) {
			textArea.setText(": and ; are invalid chatacters");
			return;
		}
		
		Optional<User> userOp = dao.findById(name.getText());

		if (userOp.isPresent()) {

			User user = userOp.get();

			name.setStyle("-fx-text-inner-color: black;");

			//send message
			RestTemplate restTemplate = new RestTemplate();
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			String jsonObject = new JSONObject().put("username", username).put("message", textArea.getText())
					.toString();

			HttpEntity<String> entity = new HttpEntity<String>(jsonObject, headers);

			try {
				String message = restTemplate.postForObject(user.getLocation() + "/message", entity, String.class);

				if (message.equals("User Not Logged In")) {
					textArea.setText("user is not logged in");
					return;
				}
			} catch (Exception e) {
				textArea.setText("user is not logged in");
				return;
			}

			//print to current/new tab
			if (tabPane != null) {

				Platform.runLater(() -> {

					for (Tab tab : tabPane.getTabs()) {
						if (tab.getText().equals(user.getUsername())) {
							addOutMessage(tab, textArea.getText());
							return;
						}
					}

					try {
						InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
						Tab tab = (new FXMLLoader()).load(chat);
						tab.setText(user.getUsername());

						User me = dao.findById(username).get();
						Optional<Log> log = logDao.findByUsernameAndOtherUser(me, user);

						if (log.isPresent()) {
							String[] logSplit = log.get().getLog().split(";");

							for (String message : logSplit) {
								String[] messageSplit = message.split(":");

								if (messageSplit[0].equals("in")) {
									addInMessage(tab, messageSplit[1]);
								} else {
									addOutMessage(tab, messageSplit[1]);
								}
							}
						}

						addOutMessage(tab, textArea.getText());
						
						tabPane.getTabs().add(tab);

						AnchorPane anchor = (AnchorPane) tab.getContent();
						ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
						VBox vBox = (VBox) scroll.getContent();

						scroll.vvalueProperty().bind(vBox.heightProperty());

						return;

					} catch (IOException e) {
						e.printStackTrace();
					}

				});
			}
		} else {
			name.setStyle("-fx-text-inner-color: red;");
		}
	}

	/**
	 * used to test for a connection
	 * 
	 * @return a string to show connection
	 */
	@RequestMapping("/test")
	public String testConnection() {
		return "good";
	}

	/**
	 * used to print message to current user
	 * 
	 * @param message sent message 
	 * @return string show success or failure
	 * @throws IOException
	 */
	@RequestMapping(value = { "/message" }, method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
	public String postMessage(@RequestBody Message message) throws IOException {

		Optional<User> userOp = dao.findById(message.getUsername());

		if (userOp.isPresent()) {

			if (tabPane != null) {

				User user = userOp.get();

				Platform.runLater(() -> {

					for (Tab tab : tabPane.getTabs()) {
						if (tab.getText().equals(user.getUsername())) {
							addInMessage(tab, message.getMessage());
							return;
						}
					}

					try {
						InputStream chat = (new ClassPathResource("tab.fxml")).getInputStream();
						Tab tab = (new FXMLLoader()).load(chat);
						tab.setText(user.getUsername());

						User me = dao.findById(username).get();
						Optional<Log> log = logDao.findByUsernameAndOtherUser(me, user);

						if (log.isPresent()) {
							String[] logSplit = log.get().getLog().split(";");

							for (String message2 : logSplit) {
								String[] messageSplit = message2.split(":");

								if (messageSplit[0].equals("in")) {
									addInMessage(tab, messageSplit[1]);
								} else {
									addOutMessage(tab, messageSplit[1]);
								}
							}
						}

						addInMessage(tab, message.getMessage());

						tabPane.getTabs().add(tab);

						AnchorPane anchor = (AnchorPane) tab.getContent();
						ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
						VBox vBox = (VBox) scroll.getContent();

						scroll.vvalueProperty().bind(vBox.heightProperty());

						return;

					} catch (IOException e) {
						e.printStackTrace();
					}

				});

				return "Message Recieved";
			} else
				return "User Not Logged In";
		}

		return "Invalid Username";
	}

	/**
	 * puts message in tab as incomming message (left side, blue)
	 * 
	 * @param tab tab to add to
	 * @param message message to add to tab
	 */
	public static void addInMessage(Tab tab, String message) {
		AnchorPane anchor = (AnchorPane) tab.getContent();
		ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
		VBox vBox = (VBox) scroll.getContent();

		HBox box = new HBox();
		box.setStyle("-fx-background-color: #add8e6;");
		box.setPrefWidth(188);
		box.setId("in");

		Text text = new Text(message);
		text.setWrappingWidth(188);

		box.getChildren().add(text);

		vBox.getChildren().add(box);
	}

	/**
	 * puts message in tab as outgoing message (right side, white)
	 * 
	 * @param tab tab to add to
	 * @param message message to add to tab
	 */
	public static void addOutMessage(Tab tab, String message) {
		AnchorPane anchor = (AnchorPane) tab.getContent();
		ScrollPane scroll = (ScrollPane) anchor.getChildren().get(0);
		VBox vBox = (VBox) scroll.getContent();

		HBox box = new HBox();
		box.setStyle("-fx-background-color: #ffffff;");
		box.setPrefWidth(188);
		box.setId("out");

		Text text = new Text(message);
		text.setWrappingWidth(188);

		box.getChildren().add(text);

		vBox.getChildren().add(box);

		VBox.setMargin(box, new Insets(0, 0, 0, 188));
	}

	public void setUsername(String username) {
		this.username = username;
	}
}
