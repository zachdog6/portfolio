package com.messages.service;

import com.messages.dao.ExternalUserDao;
import com.messages.dao.LogDao;
import com.messages.dao.UserDao;
import com.messages.model.ExternalUser;
import com.messages.model.Log;
import com.messages.model.User;
import javafx.geometry.Insets;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.Tab;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Optional;

@Service
public class ChatService {
    @Autowired
    private UserDao dao;
    @Autowired
    private LogDao logDao;
    @Autowired
    private ExternalUserDao externalUserDao;


    public void deleteLogs(User currentUser, String otherUser) {
        Optional<ExternalUser> other = externalUserDao.findById(otherUser);

        if(other.isPresent()) {
            Optional<Log> logs = logDao.findByCurrentUserAndOtherUser(currentUser, other.get());

            logs.ifPresent(log -> logDao.delete(log));
        }
    }

    public void saveLog(User currentUser, String otherUser, String log) {
        Optional<ExternalUser> other = externalUserDao.findById(otherUser);

        if(other.isPresent()) {
            Optional<Log> logs = logDao.findByCurrentUserAndOtherUser(currentUser, other.get());

            if (logs.isPresent()) {
                Log logObj = logs.get();
                logObj.setLog(log);

                logDao.save(logObj);
            } else {
                Log logObj = new Log();
                logObj.setLog(log);
                logObj.setOtherUser(other.get());
                logObj.setCurrentUser(currentUser);

                logDao.save(logObj);
            }
        }
    }

    public boolean addNewExternalUser(String username, User currentUser, String url, Tab tab) {
        Optional<ExternalUser> oldExternalUser = externalUserDao.findById(username);
        ExternalUser newExternalUser;
        if (oldExternalUser.isPresent()) {
            newExternalUser = oldExternalUser.get();
            addLogs(tab, currentUser, username);
            newExternalUser.setLocation(url);
        }
        else {
            newExternalUser = new ExternalUser();
            newExternalUser.setLocation(url);
            newExternalUser.setUsername(username);
        }

        if(isGoodConnection(url)){
            externalUserDao.save(newExternalUser);
            return true;
        }
        return false;
    }

    public void addLogs(Tab tab, User currentUser, String otherUserUsername) {
        Optional<ExternalUser> otherUser = externalUserDao.findById(otherUserUsername);
        if(otherUser.isPresent()) {
            Optional<Log> log = logDao.findByCurrentUserAndOtherUser(currentUser, otherUser.get());

            if (log.isPresent()) {
                String[] logSplit = log.get().getLog().split(";");

                for (String message : logSplit) {
                    addMessage(tab, message);
                }
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

    public boolean sendMessage(String otherUsername, User currentUser , String message) {
        Optional<ExternalUser> userOp = externalUserDao.findById(otherUsername);

        if (userOp.isPresent()) {

            ExternalUser user = userOp.get();

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonObject = new JSONObject().put("username", currentUser.getUsername()).put("message", message)
                    .put("url", currentUser.getLocation()).toString();

            HttpEntity<String> entity = new HttpEntity<>(jsonObject, headers);

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
