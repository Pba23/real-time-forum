-- SQL schema for user-class-diagram
-- Table for 'user'
CREATE TABLE IF NOT EXISTS "user" (
    id VARCHAR PRIMARY KEY,
    username VARCHAR,
    firstname VARCHAR,
    lastname VARCHAR,
    age VARCHAR,
    gender VARCHAR,
    email VARCHAR,
    password TEXT,
    avatarURL VARCHAR,
    role VARCHAR
);
-- Table for 'post'
CREATE TABLE IF NOT EXISTS "post" (
    id VARCHAR PRIMARY KEY,
    title VARCHAR,
    slug VARCHAR,
    description VARCHAR,
    imageURL VARCHAR,
    authorID VARCHAR,
    isEdited BOOLEAN,
    createDate DATE,
    modifiedDate DATE,
    validate BOOLEAN,
    FOREIGN KEY (authorID) REFERENCES user(id)
);
-- Table for 'view'
CREATE TABLE IF NOT EXISTS "view" (
    id VARCHAR PRIMARY KEY,
    isBookmarked BOOLEAN,
    rate INT,
    authorID VARCHAR,
    postID VARCHAR,
    FOREIGN KEY (authorID) REFERENCES user(id),
    FOREIGN KEY (postID) REFERENCES post(id)
);
-- Table for 'comment_rate'
CREATE TABLE IF NOT EXISTS "comment_rate" (
    id VARCHAR PRIMARY KEY,
    authorID VARCHAR,
    commentID VARCHAR,
    rate INT,
    FOREIGN KEY (authorID) REFERENCES user(id),
    FOREIGN KEY (commentID) REFERENCES comment(id)
);
-- Table for 'comment'
CREATE TABLE IF NOT EXISTS "comment" (
    id VARCHAR PRIMARY KEY,
    text VARCHAR,
    authorID VARCHAR,
    postID VARCHAR,
    parentID VARCHAR,
    createDate DATE,
    modifiedDate DATE,
    FOREIGN KEY (authorID) REFERENCES user(id),
    FOREIGN KEY (postID) REFERENCES post(id),
    FOREIGN KEY (parentID) REFERENCES comment(id)
);
-- Table for 'post_category'
CREATE TABLE IF NOT EXISTS "post_category" (
    id VARCHAR PRIMARY KEY,
    categoryID VARCHAR,
    postID VARCHAR,
    FOREIGN KEY (categoryID) REFERENCES category(id),
    FOREIGN KEY (postID) REFERENCES post(id)
);
-- Table for 'category'
CREATE TABLE IF NOT EXISTS "category" (
    id VARCHAR PRIMARY KEY,
    name VARCHAR,
    createDate DATE,
    modifiedDate DATE
);
-- Table for 'notification'
CREATE TABLE IF NOT EXISTS "notification" (
    id VARCHAR PRIMARY KEY,
    authorID VARCHAR,
    author_name VARCHAR,
    postID VARCHAR,
    ownerID VARCHAR,
    notif_type VARCHAR,
    slug VARCHAR,
    time VARCHAR,
    Readed BOOLEAN,
    FOREIGN KEY (postID) REFERENCES post(id)
);
CREATE TABLE IF NOT EXISTS "message" (
    id VARCHAR PRIMARY KEY,
    senderID VARCHAR,
    receiverID VARCHAR,
    content TEXT,
    createDate DATE,
    modifiedDate DATE,
    FOREIGN KEY (authorID) REFERENCES user(id),
    FOREIGN KEY (reportID) REFERENCES report(id)
);