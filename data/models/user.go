package models

import (
	"database/sql"
	"log"
	"strings"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	ID         string `json:"id"`
	Nickname   string `json:"nickname"`
	Firstname  string `json:"firstname"`
	Lastname   string `json:"lastname"`
	Age        int    `json:"age"`
	Gender     string `json:"gender"`
	IsLoggedIn bool   `json:"is_logged_in"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	AvatarURL  string `json:"avatar_url"`
}

type UserSignIn struct {
	Identifiant string
	Password    string
}

var DEFAULT_AVATAR = "/uploads/avatar.1.jpeg"

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

// Create a new user in the database
func (ur *UserRepository) CreateUser(user *User) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	user.ID = ID.String()
	user.Email = strings.ToLower(user.Email)
	user.Nickname = strings.ToLower(user.Nickname)
	_, err = ur.db.Exec("INSERT INTO user (id, nickname, firstname, lastname, age, gender, email, password, avatarURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		user.ID,
		user.Nickname,
		user.Firstname,
		user.Lastname,
		user.Age,
		user.Gender,
		user.Email,
		user.Password,
		user.AvatarURL,
	)
	return err
}

// Get a user by ID from the database
func (ur *UserRepository) GetUserByID(userID string) (*User, error) {
	var user User
	row := ur.db.QueryRow("SELECT id, nickname,firstname,lastname,age,gender, email, password, avatarURL FROM user WHERE id = ?", userID)
	err := row.Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.AvatarURL)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

// Get a user by email from the database
func (ur *UserRepository) GetUserByEmail(email string) (*User, error) {
	var user User
	row := ur.db.QueryRow("SELECT id, nickname,firstname,lastname,age,gender, email, password, avatarURL FROM user WHERE email = ?", email)
	err := row.Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.AvatarURL)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

// Get a user by email from the database
func (ur *UserRepository) GetUserByNickname(nickname string) (*User, error) {
	var user User
	row := ur.db.QueryRow("SELECT id, nickname, firstname, lastname, age, gender, email, password, avatarURL FROM user WHERE nickname = ?", nickname)
	err := row.Scan(&user.ID, &user.Nickname, &user.Email, &user.Password, &user.AvatarURL)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // User not found
		}
		return nil, err
	}
	return &user, nil
}

// Select All users
func (ur *UserRepository) SelectAllUsers() ([]User, error) {
	var user []User
	row, err := ur.db.Query("SELECT * FROM user")
	if err != nil {
		log.Fatal(err)
	}
	for row.Next() {
		var ID string
		var email string
		var nickname string
		var firstname string
		var lastname string
		var age int
		var gender string
		var password string
		var avatarUrl string

		err = row.Scan(&ID, &nickname, &firstname, &lastname, &age, &gender, &email, &password, &avatarUrl)
		if err != nil {
			log.Fatal(err)
		}

		var tab = User{
			ID:        ID,
			Email:     email,
			Nickname:  nickname,
			Firstname: firstname,
			Lastname:  lastname,
			Age:       age,
			Gender:    gender,
			Password:  password,
			AvatarURL: avatarUrl,
		}

		user = append(user, tab)
	}
	return user, nil
}

// Select All users
func (ur *UserRepository) SelectAllUsersOfPost(postID string) ([]User, error) {
	var user []User
	row, err := ur.db.Query("SELECT u.id AS user_id, u.avatarURL AS user_avatar, u.nickname FROM \"comment\" c INNER JOIN \"user\" u ON c.authorID = u.id WHERE c.postID = ?;", postID)
	if err != nil {
		log.Fatal(err)
	}
	for row.Next() {
		var ID string
		var AvatarUrl string
		var nickname string

		err = row.Scan(&ID, &AvatarUrl, &nickname)

		if err != nil {
			log.Fatal(err)
		}

		var tab = User{
			ID:        ID,
			AvatarURL: AvatarUrl,
			Nickname:  nickname,
		}

		user = append(user, tab)
	}
	return user, nil
}

// Update a user in the database
func (ur *UserRepository) UpdateUser(user *User) error {
	_, err := ur.db.Exec("UPDATE user SET nickname = ?, firstname = ?,lastname = ?,age = ?,gender = ?, email = ?, password = ?, avatarURL = ? WHERE id = ?",
		user.Nickname, user.Firstname, user.Lastname, user.Age, user.Gender, user.Email, user.Password, user.AvatarURL, user.ID)
	return err
}

// Delete a user from the database
func (ur *UserRepository) DeleteUser(userID string) error {
	_, err := ur.db.Exec("DELETE FROM user WHERE id = ?", userID)
	return err
}

// Check if user exists
func (ur *UserRepository) IsExistedByIdentifiant(identifiant string) (*User, bool) {
	var user User
	identifiant = strings.ToLower(identifiant)
	row := ur.db.QueryRow("SELECT password FROM user WHERE email = ? OR nickname = ?", identifiant, identifiant)
	err := row.Scan(&user.Password)
	if err != nil {
		log.Println("❌ ", err)
		if err == sql.ErrNoRows {
			return nil, false
		}
		return nil, false
	}
	return &user, true
}

// Check if user exists
func (ur *UserRepository) IsExistedByID(ID string) (*User, bool) {
	var user User
	row := ur.db.QueryRow("SELECT id FROM user WHERE id = ?", ID)
	err := row.Scan(&user.ID)
	if err != nil {
		log.Println("❌ ", err)
		if err == sql.ErrNoRows {
			return nil, false
		}
		return nil, false
	}
	return &user, true
}
