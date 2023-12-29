package models

import (
	"database/sql"
	"log"
	"real-time-forum/lib"
	"strings"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type PostItem struct {
	ID               string   `json:"id"`
	Title            string   `json:"title"`
	Slug             string   `json:"slug"`
	AuthorName       string   `json:"authorName"`
	CreateDate       string   `json:"createDate"`
	NumberOfComments int      `json:"numberOfComments"`
	ListOfCategories []string `json:"listOfCategories"`
}

type CompletePost struct {
	Post
	Comments []*CommentItem
}

type Post struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	AuthorID    string `json:"authorID"`
	CreateDate  string `json:"createDate"`
}

type PostCreation struct {
	ID           string   `json:"id"`
	Title        string   `json:"title"`
	Slug         string   `json:"slug"`
	Description  string   `json:"description"`
	AuthorID     string   `json:"authorID"`
	ImageURL     string   `json:"imageURL"`
	Categories   string `json:"categories"`
	CreateDate   string   `json:"createDate"`
	ModifiedDate string   `json:"modifiedDate"`
}

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{
		db: db,
	}
}

// Create a new post in the database
func (pr *PostRepository) CreatePost(post *PostCreation) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	post.ID = ID.String()
	_, err = pr.db.Exec("INSERT INTO post (id, title, slug, description, authorID) VALUES (?, ?, ?, ?, ?)",
		post.ID, post.Title, post.Slug, post.Description, post.AuthorID)
	return err
}

// Get a post by ID from the database
func (pr *PostRepository) GetPostByID(postID string) (*CompletePost, error) {
	var post CompletePost
	row := pr.db.QueryRow("SELECT id, title, slug, description,authorID, createDate FROM post WHERE id = ?", postID)
	err := row.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.AuthorID, &post.CreateDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err // Post not found
		}
		return nil, err
	}
	return &post, nil
}

func (pr *PostRepository) GetUserOwnPosts(userId, nickName string) ([]PostItem, error) {
	var posts []*Post
	var numberComments []int

	rows, err := pr.db.Query(`
	SELECT p.id AS id, title, slug, description, p.authorID AS authorID, p.createDate AS createDate, COUNT(*) AS numberComment FROM post p
	LEFT JOIN comment c ON c.postID = p.ID
	WHERE p.authorID = ? 
	GROUP BY p.ID ;
	`, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post Post
		var nbComment int
		err := rows.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.AuthorID, &post.CreateDate, &nbComment)
		if err != nil {
			return nil, err
		}
		posts = append(posts, &post)
		numberComments = append(numberComments, nbComment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	tabPostItem := []PostItem{}

	for i := 0; i < len(posts); i++ {
		lastModificationDate := strings.ReplaceAll(posts[i].CreateDate, "T", " ")
		lastModificationDate = strings.ReplaceAll(lastModificationDate, "Z", "")
		postItem := PostItem{
			ID:               posts[i].ID,
			Title:            posts[i].Title,
			Slug:             posts[i].Slug,
			AuthorName:       nickName,
			CreateDate:       lib.TimeSinceCreation(lastModificationDate),
			NumberOfComments: numberComments[i],
			ListOfCategories: []string{},
		}
		tabPostItem = append(tabPostItem, postItem)

	}

	return tabPostItem, nil
}

// Get a post by TITLE from the database
func (pr *PostRepository) GetPostBySlug(slug string) (*CompletePost, error) {
	var post CompletePost
	row := pr.db.QueryRow("SELECT id, title, slug, description, authorID, createDate FROM post WHERE slug = ?", slug)
	err := row.Scan(&post.ID, &post.Title, &post.Slug, &post.Description, &post.AuthorID, &post.CreateDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err // Post not found
		}
		return nil, err
	}
	post.CreateDate = strings.ReplaceAll(post.CreateDate, "T", " ")
	post.CreateDate = strings.ReplaceAll(post.CreateDate, "Z", "")
	post.CreateDate = lib.TimeSinceCreation(post.CreateDate)
	return &post, nil
}

// Get all posts as PostItems with author name and category names
func (pr *PostRepository) GetAllPosts() ([]*PostItem, error) {
	var postItems []*PostItem
	request := `
		SELECT 
			p.id, p.title, p.slug,
			u.nickname AS authorName,
			p.createDate AS lastEditionDate,
			COUNT(c.id) AS numberOfComments,
			COALESCE(GROUP_CONCAT(c.name, ', '), '') AS listOfCategories
		FROM post p
		JOIN user u ON p.authorID = u.id
		LEFT JOIN post_category pc ON p.id = pc.postID
		LEFT JOIN category c ON pc.categoryID = c.id
		GROUP BY p.id
		ORDER BY p.createDate DESC
	`
	rows, err := pr.db.Query(request)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var post PostItem
		ListOfCategories := ""
		err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Slug,
			&post.AuthorName,
			&post.CreateDate,
			&post.NumberOfComments,
			&ListOfCategories,
		)
		if err != nil {
			return nil, err
		}

		post.CreateDate = strings.ReplaceAll(post.CreateDate, "T", " ")
		post.CreateDate = strings.ReplaceAll(post.CreateDate, "Z", "")
		post.CreateDate = lib.TimeSinceCreation(post.CreateDate)
		post.ListOfCategories = strings.Split(ListOfCategories, ", ")
		postItems = append(postItems, &post)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return postItems, nil
}

// Get all posts as PostItems with author name and category names
func (pr *PostRepository) GetPostItemByID(postID string) (PostItem, error) {
	request := `
		SELECT 
			p.id, p.title, p.slug,
			u.nickname AS authorName,
			p.createDate AS lastEditionDate,
			COUNT(c.id) AS numberOfComments,
			COALESCE(GROUP_CONCAT(c.name, ', '), '') AS listOfCategories
		FROM post p
		JOIN user u ON p.authorID = u.id
		LEFT JOIN post_category pc ON p.id = pc.postID
		LEFT JOIN category c ON pc.categoryID = c.id
		WHERE p.id = ?
		GROUP BY p.id
		ORDER BY p.createDate DESC
	`
	row := pr.db.QueryRow(request, postID)

	var post PostItem
	ListOfCategories := ""
	err := row.Scan(
		&post.ID,
		&post.Title,
		&post.Slug,
		&post.AuthorName,
		&post.CreateDate,
		&post.NumberOfComments,
		&ListOfCategories,
	)
	if err != nil {
		return post, err
	}

	post.CreateDate = strings.ReplaceAll(post.CreateDate, "T", " ")
	post.CreateDate = strings.ReplaceAll(post.CreateDate, "Z", "")
	post.CreateDate = lib.TimeSinceCreation(post.CreateDate)
	post.ListOfCategories = strings.Split(ListOfCategories, ", ")

	return post, nil
}

// Get the number of posts in the database
func (pr *PostRepository) GetNumberOfPosts() int {
	var numberOfPosts int

	row := pr.db.QueryRow("SELECT COUNT(*) FROM post")
	err := row.Scan(&numberOfPosts)
	if err != nil {
		return 0
	}
	return numberOfPosts
}
