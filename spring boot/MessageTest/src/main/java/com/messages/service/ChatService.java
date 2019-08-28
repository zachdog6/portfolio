package com.messages.service;

import com.messages.dao.ExternalUserDao;
import com.messages.dao.LogDao;
import com.messages.dao.UserDao;
import com.messages.model.ExternalUser;
import com.messages.model.Log;
import com.messages.model.User;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Insets;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.control.TabPane;
import javafx.scene.control.TextArea;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;

@Service
public class ChatService {
    @Autowired
    private UserDao dao;
    @Autowired
    private LogDao logDao;
    @Autowired
    private ExternalUserDao externalUserDao;


    public void deleteLogs(String currentUser, String otherUser) {
        User me = dao.findById(currentUser).get();
        ExternalUser other = externalUserDao.findById(otherUser).get();

        Optional<Log> logs = logDao.findByCurrentUserAndOtherUser(me, other);

        logs.ifPresent(log -> logDao.delete(log));
    }

    public void saveLog(String currentUser, String otherUser, String log) {
        User me = dao.findById(currentUser).get();
        ExternalUser other = externalUserDao.findById(otherUser).get();

        Optional<Log> logs = logDao.findByCurrentUserAndOtherUser(me, other);

        if (logs.isPresent()) {
            Log logObj = logs.get();
            logObj.setLog(log);

            logDao.save(logObj);
        } else {
            Log logObj = new Log();
            logObj.setLog(log);
            logObj.setOtherUser(other);
            logObj.setCurrentUser(me);

            logDao.save(logObj);
        }
    }

    public boolean addNewExternalUser(String username, String url, Tab tab) {
        ExternalUser externalUser;
        if (externalUserDao.existsById(username)) {
            addLogs(tab, username, username);
            externalUser = externalUserDao.findById(username).get();
            externalUser.setLocation(url);
        }
        else {
            externalUser = new ExternalUser();
            externalUser.setLocation(url);
            externalUser.setUsername(username);
        }

        if(isGoodConnection(url)){
            externalUserDao.save(externalUser);
            return true;
        }
        return false;
    }

    public void addLogs(Tab tab, String username, String otherUserUsername) {
        User me = dao.findById(username).get();
        ExternalUser otherUser = externalUserDao.findById(otherUserUsername).get();
        Optional<Log> log = logDao.findByCurrentUserAndOtherUser(me, otherUser);

        if (log.isPresent()) {
            String[] logSplit = log.get().getLog().split(";");

            for (String message : logSplit) {
                addMessage(tab, message);
            }
        }
    }

    private void addMessage(Tab tab, String message) {
        String[] messageSplit = message.split(":");

        if (messageSplit[0].equals("in")) {
            addInMessage(tab, messageSplit[1]);
        } else {
            addOutMessage(tab, messageSplit[1]);
        }
    }

    private boolean isGoodConnection(String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String result = restTemplate.getForObject(url + "/test", String.class);
            return "good".equals(result);
        }
        catch(Exception e) {
            return false;
        }
    }

    public boolean sendMessage(String otherUsername, String username , String message) {
        Optional<ExternalUser> userOp = externalUserDao.findById(otherUsername);

        if (userOp.isPresent()) {

            ExternalUser user = userOp.get();
            User currentUser = dao.findById(username).get();

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonObject = new JSONObject().put("username", username).put("message", message)
                    .put("url", currentUser.getLocation()).toString();

            HttpEntity<String> entity = new HttpEntity<String>(jsonObject, headers);

            try {
                String messageResult = restTemplate.postForObject(user.getLocation() + "/message", entity, String.class);

                if ("Message Recieved".equals(messageResult)) {
                    return true;
                }
            } catch (Exception e) {
                return false;
            }
        }
        return false;
    }

    public Optional<User> getUser(String username) {
        return dao.findById(username);
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
}
