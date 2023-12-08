package handler

import (
	"encoding/json"

	// "errors"

	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"strings"

	"github.com/gorilla/mux"
)

func CreatePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/post", http.MethodPost) {
		isLogin := models.ValidSession(req)
		if isLogin {
			userInSession := models.GetUserFromSession(req)
			var postInfo models.Post
			if err := json.NewDecoder(req.Body).Decode(&postInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
				return
			}
			if err := validatePostInput(postInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, err.Error())
				return
			}
			postInfo.Slug = lib.Slugify(postInfo.Title)
			categories := strings.Split(req.FormValue("categories"), "#")
			postInfo.AuthorID = userInSession.ID
			if err := models.PostRepo.CreatePost(&postInfo); err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating post : "+err.Error())
				return
			}
			for i := 1; i < len(categories); i++ {
				name := strings.TrimSpace(categories[i])
				category, _ := models.CategoryRepo.GetCategoryByName(name)
				if category == nil {
					category = &models.Category{
						Name: name,
					}
					models.CategoryRepo.CreateCategory(category)
				}
				models.PostCategoryRepo.CreatePostCategory(category.ID, postInfo.ID)
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]string{
				"message": "post created successfully",
				"id":      postInfo.ID,
			})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "not connected")
		}

	}
}

func EditPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-post/*", http.MethodPost) {
		isLogin := models.ValidSession(req)
		postID := mux.Vars(req)["postID"]
		userInSession := models.GetUserFromSession(req)
		post, err := models.PostRepo.GetPostByID(postID)
		if err != nil {
			lib.HandleError(res, http.StatusNotFound, "post not found")
			return
		}
		if postID != "" {
			if isLogin {
				if post.AuthorID == userInSession.ID {
					var postInfo models.Post
					if err := json.NewDecoder(req.Body).Decode(&postInfo); err != nil {
						lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
						return
					}
					if err := validateUpdatePostInput(postInfo); err != nil {
						lib.HandleError(res, http.StatusBadRequest, err.Error())
						return
					}

					if postInfo.Title != "" {
						postInfo.Slug = lib.Slugify(postInfo.Title)
					} else {
						postInfo.Title = post.Title
					}

					if postInfo.Description == "" {
						postInfo.Description = post.Description
					}

					if postInfo.ImageURL == "" {
						postInfo.ImageURL = post.ImageURL
					}

					EditedPost := models.Post{
						ID:          postID,
						Title:       postInfo.Title,
						Slug:        postInfo.Slug,
						Description: postInfo.Description,
						ImageURL:    postInfo.ImageURL,
					}
					err := models.PostRepo.UpdatePost(&EditedPost)
					if err != nil {
						lib.HandleError(res, http.StatusInternalServerError, "Error updating post : "+err.Error())
					}
					lib.SendJSONResponse(res, http.StatusOK, map[string]string{"message": "post edited successfully"})
				} else {
					lib.HandleError(res, http.StatusUnauthorized, "you are not the author of this post")
				}
			} else {
				lib.HandleError(res, http.StatusUnauthorized, "not connected")
			}
		} else {
			lib.HandleError(res, http.StatusNotFound, "post not found")
		}
	}
}

func DeletePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/delete-post/*", http.MethodGet) {
		isLogin := models.ValidSession(req)
		postID := mux.Vars(req)["postID"]
		post, err := models.PostRepo.GetPostByID(postID)
		userInSession := models.GetUserFromSession(req)
		if err != nil {
			lib.HandleError(res, http.StatusNotFound, "post not found")
			return
		}
		if postID != "" {
			if isLogin {
				if post.AuthorID == userInSession.ID {
					models.PostRepo.DeletePost(postID)
					lib.SendJSONResponse(res, http.StatusOK, map[string]string{"message": "post deleted successfully"})
				} else {
					lib.HandleError(res, http.StatusUnauthorized, "you are not the author of this post")
				}
			} else {
				lib.HandleError(res, http.StatusUnauthorized, "not connected")
			}
		}
	}
}

func GetPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/posts/*", http.MethodGet) {

	}
}

func validatePostInput(post models.Post) error {
	if post.Title == "" || post.ImageURL == "" || post.Description == "" {
		return ErrMissingRequiredFields
	}
	return nil
}

func validateUpdatePostInput(post models.Post) error {
	// Add any validation rules as needed
	if post.Title == "" && post.ImageURL == "" && post.Description == "" {
		return ErrMissingRequiredFields
	}
	return nil
}

// func GetAllPosts(res http.ResponseWriter, req *http.Request) {
// 	posts := models.PostRepository.GetAllPosts()
// 	if lib.ValidateRequest(req, res, "/posts", http.MethodGet) {

//     }
// }
