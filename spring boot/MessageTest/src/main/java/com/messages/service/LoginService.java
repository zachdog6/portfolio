package com.messages.service;

import com.messages.dao.UserDao;
import com.messages.model.User;
import javafx.scene.text.Text;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import javafx.scene.control.TextField;
import java.io.IOException;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Optional;

@Service
public class LoginService {

    @Autowired
    UserDao dao;
    @Autowired
    Environment environment;

    public Optional<User> login(String username, String password, Text err) throws IOException {
        Optional<User> userSearch = dao.findById(username);
        if(userSearch.isPresent()) {
            User user = userSearch.get();

            if(user.getPassword().equals(password) && tryConnection(user, err)) {
                return userSearch;
            }
            else {
                err.setText("Wrong password");
                return Optional.empty();
            }
        }
        err.setText("Invalid username");
        return Optional.empty();
    }

    private boolean tryConnection(User user, Text err) {
        try(final DatagramSocket socket = new DatagramSocket()){
            socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
            String ip = socket.getLocalAddress().getHostAddress();
            String url = "http://" + ip + ":" + environment.getProperty("local.server.port");

            RestTemplate restTemplate = new RestTemplate();
            String result = restTemplate.getForObject(url + "/test", String.class);

            if("good".equals(result)) {
                user.setLocation(url);
                dao.save(user);
                return true;
            }
        }
        catch(Exception e) {
            err.setText("Error getting external IP address");
        }
        return false;
    }
}
