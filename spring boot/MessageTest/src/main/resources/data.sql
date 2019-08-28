CREATE TABLE IF NOT EXISTS users (
    username varchar(16) primary key,
    password varchar(255),
    name varchar(255),
    location varchar(255)
);

CREATE TABLE IF NOT EXISTS external_users (
    username varchar(16) primary key,
    location varchar(255)
);

CREATE TABLE IF NOT EXISTS logs (
    id int AUTO_INCREMENT primary key,
    current_user varchar(16) REFERENCES users(username),
    other_user varchar(16) REFERENCES external_users(username),
    log varchar(255)
);