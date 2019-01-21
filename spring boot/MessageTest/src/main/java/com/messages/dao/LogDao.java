package com.messages.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import com.messages.model.Log;
import com.messages.model.User;

public interface LogDao extends CrudRepository<Log, Integer> {

	public List<Log> findByUsername(User username);
	
	public Optional<Log> findByUsernameAndOtherUser(User username, User otherUser);
}
