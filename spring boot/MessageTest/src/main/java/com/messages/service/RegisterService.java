package com.messages.service;

import com.messages.dao.UserDao;
import com.messages.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    @Autowired
    private UserDao dao;

    public boolean userExists(String username) {
        return dao.findById(username).isPresent();
    }

    public void saveUser(User user) {
        dao.save(user);
    }
}
