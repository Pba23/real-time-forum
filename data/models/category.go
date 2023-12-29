package models

import (
	"database/sql"
	"log"

	uuid "github.com/gofrs/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Category struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	CreateDate   string `json:"createDate"`
}

type CategoryRepository struct {
	db *sql.DB
}

func NewCategoryRepository(db *sql.DB) *CategoryRepository {
	return &CategoryRepository{
		db: db,
	}
}

// Create a new category in the database
func (cr *CategoryRepository) CreateCategory(category *Category) error {
	ID, err := uuid.NewV4()
	if err != nil {
		log.Printf("❌ Failed to generate UUID: %v", err)
	}
	category.ID = ID.String()
	_, err = cr.db.Exec("INSERT INTO category (id, name) VALUES (?, ?)",
		category.ID, category.Name)
	return err
}

// Get a category by ID from the database
func (cr *CategoryRepository) GetCategoryByID(categoryID string) (*Category, error) {
	var category Category
	row := cr.db.QueryRow("SELECT id, name, createDate FROM category WHERE id = ?", categoryID)
	err := row.Scan(&category.ID, &category.Name, &category.CreateDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Category not found
		}
		return nil, err
	}
	return &category, nil
}

// Get a category by ID from the database
func (cr *CategoryRepository) GetCategoryByName(name string) (*Category, error) {
	var category Category
	row := cr.db.QueryRow("SELECT id, name, createDate FROM category WHERE name = ?", name)
	err := row.Scan(&category.ID, &category.Name, &category.CreateDate)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Category not found
		}
		return nil, err
	}
	return &category, nil
}

// Get all category in the database
func (pr *CategoryRepository) GetAllCategory() ([]*Category, error) {
	var categories []*Category

	rows, err := pr.db.Query("SELECT * FROM Category")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var category Category
		err := rows.Scan(&category.ID, &category.Name, &category.CreateDate)
		if err != nil {
			return nil, err
		}
		categories = append(categories, &category)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return categories, nil
}
