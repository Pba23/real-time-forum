package handler

import (
	"encoding/json"
	"html"

	// "errors"

	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"strings"
)

func CreatePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/post", http.MethodPost) {
		isLogin := models.ValidSession(req)
		if isLogin {
			userInSession := models.GetUserFromSession(req)
			var postInfo models.PostCreation
			if err := json.NewDecoder(req.Body).Decode(&postInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format "+err.Error())
				return
			}
			if err := validatePostInput(&postInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, err.Error())
				return
			}
			postInfo.Slug = lib.Slugify(postInfo.Title)
			listOfCategories := postInfo.Categories

			postInfo.AuthorID = userInSession.ID
			if err := models.PostRepo.CreatePost(&postInfo); err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating post : "+err.Error())
				return
			}
			for i := 0; i < len(listOfCategories); i++ {
				name := strings.TrimSpace(listOfCategories[i])
				if name != "" {
					category, _ := models.CategoryRepo.GetCategoryByName(name)
					if category == nil {
						category = &models.Category{
							Name: name,
						}
						models.CategoryRepo.CreateCategory(category)
					}
					models.PostCategoryRepo.CreatePostCategory(category.ID, postInfo.ID)
				}
			}
			post, err := models.PostRepo.GetPostItemByID(postInfo.ID)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting post : "+err.Error())
				return
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{
				"message": "post created successfully",
				"post":    post,
			})
			SendPost(post)
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "not connected")
		}
	}
}

func GetPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/post/*", http.MethodGet) {
		if models.ValidSession(req) {
			path := req.URL.Path
			pathPart := strings.Split(path, "/")
			slug := pathPart[2]
			post, err := models.PostRepo.GetPostBySlug(slug)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, err.Error())
				return
			}

			comments, err := models.CommentRepo.GetCommentsOfPost(post.ID)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, err.Error())
				return
			}

			post.Comments = comments

			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "post retrieved successfully", "post": post})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func GetAllPosts(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/posts", http.MethodGet) {
		if models.ValidSession(req) {
			posts, err := models.PostRepo.GetAllPosts()
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, err.Error())
			}

			lib.SendJSONResponse(res, http.StatusOK, map[string]any{"message": "posts retrieved successfully", "posts": posts})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func validatePostInput(post *models.PostCreation) error {
	post.Title = strings.Trim(post.Title, " ")
	post.Description = strings.Trim(post.Description, " ")
	if post.Title == "" || post.Description == "" || len(post.Categories) == 0 {
		return ErrMissingRequiredFields
	}
	post.Title = html.EscapeString(post.Title)
	post.Description = html.EscapeString(post.Description)
	return nil
}
