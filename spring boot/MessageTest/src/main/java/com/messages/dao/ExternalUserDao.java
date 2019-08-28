package com.messages.dao;

import com.messages.model.ExternalUser;
import com.messages.model.User;
import org.springframework.data.repository.CrudRepository;

public interface ExternalUserDao extends CrudRepository<ExternalUser, String> {
}
