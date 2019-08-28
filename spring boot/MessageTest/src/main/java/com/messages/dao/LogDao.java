package com.messages.dao;

import java.util.Optional;

import com.messages.model.ExternalUser;
import org.springframework.data.repository.CrudRepository;

import com.messages.model.Log;
import com.messages.model.User;

public interface LogDao extends CrudRepository<Log, Integer> {
	
	public Optional<Log> findByCurrentUserAndOtherUser(User currentUser, ExternalUser otherUser);
}
