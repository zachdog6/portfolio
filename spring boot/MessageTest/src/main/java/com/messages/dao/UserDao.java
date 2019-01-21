package com.messages.dao;

import org.springframework.data.repository.CrudRepository;

import com.messages.model.User;

public interface UserDao extends CrudRepository<User, String> {
}
