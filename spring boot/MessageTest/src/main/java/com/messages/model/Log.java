package com.messages.model;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name="logs")
public class Log {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	int id;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="username")
	User username;
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="other_user")
	User otherUser;
	String log;
	
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public User getUsername() {
		return username;
	}
	public void setUsername(User username) {
		this.username = username;
	}
	public User getOtherUser() {
		return otherUser;
	}
	public void setOtherUser(User otherUser) {
		this.otherUser = otherUser;
	}
	public String getLog() {
		return log;
	}
	public void setLog(String log) {
		this.log = log;
	}
}
