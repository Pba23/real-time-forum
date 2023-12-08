package handler

import (
	"encoding/json"
	// "errors"
	"strings"
	"github.com/gorilla/mux"
	"fmt"
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
)

func CreatePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/post", http.MethodPost) {
		isLogin :=  true
		userInSession := models.GetUserFromSession(req)
		if isLogin{
			var postInfo models.Post
			if err := json.NewDecoder(req.Body).Decode(&postInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
				return
			}
			if err := validatePostInput(postInfo); err!= nil {
                lib.HandleError(res, http.StatusBadRequest, err.Error())
                return
            }
			postInfo.Slug= lib.Slugify(postInfo.Title)
			categories := strings.Split(req.FormValue("categories"),"#")
			postInfo.AuthorID=userInSession.ID
			if err := models.PostRepo.CreatePost(&postInfo); err!= nil {
                fmt.Printf(err.Error())
                lib.HandleError(res, http.StatusInternalServerError, "Error creating post")
                return
            }
			lib.SendJSONResponse(res, http.StatusOK,map[string]string{
				"message":"post created successfully",
				"id":postInfo.ID ,
			})
			for i := 1; i < len(categories); i++ {
				name := strings.TrimSpace(categories[i])
				category, _ := models.CategoryRepo.GetCategoryByName(name)
				if category == nil {
					category = &models.Category{
						Name:         name,
					}
					models.CategoryRepo.CreateCategory(category)
				}
				models.PostCategoryRepo.CreatePostCategory(category.ID, postInfo.ID)
			}
		}else {
			lib.HandleError(res, http.StatusUnauthorized,"not connected")
		}

	}
}
func validatePostInput(post models.Post) error {
	// Add any validation rules as needed
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
func EditPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-post/*", http.MethodPost) {
		isLogin :=  models.ValidSession(req)
		postID := mux.Vars(req)["postID"]
		post,err := models.PostRepo.GetPostByID(postID)
		//userInSession := models.GetUserFromSession(req)
		if err!= nil {
            lib.HandleError(res, http.StatusNotFound, "post not found")
            return
        }
		if postID!=""{	
			if isLogin {
				if post.AuthorID !="" {
					var postInfo models.Post
					if err := json.NewDecoder(req.Body).Decode(&postInfo); err!= nil {
						lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
						return
					}
					if err := validateUpdatePostInput(postInfo); err!= nil {
						lib.HandleError(res, http.StatusBadRequest, err.Error())
						return
					}
					fmt.Printf(postInfo.ID)
	
					EditedPost := models.Post {
						ID: postID,
						Title: postInfo.Title,
						Slug: postInfo.Slug,
						Description: postInfo.Description,
						ImageURL: postInfo.ImageURL,
					}
					err := models.PostRepo.UpdatePost(&EditedPost)
					if err != nil {
						return 
					}
					lib.SendJSONResponse(res, http.StatusOK,map[string]string{"message":"post edited successfully"})
				}else {
					lib.HandleError(res, http.StatusUnauthorized, "you are not the author of this post")
				}
			}else {
				lib.HandleError(res, http.StatusUnauthorized, "not connected")
			}
		}else {
			lib.HandleError(res, http.StatusNotFound, "post not found")
		}
	}
}

func DeletePost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/delete-post/*", http.MethodGet) {
		isLogin :=  models.ValidSession(req)
		postID := mux.Vars(req)["postID"]
		post,err := models.PostRepo.GetPostByID(postID)
		userInSession := models.GetUserFromSession(req)
		if err!= nil {
            lib.HandleError(res, http.StatusNotFound, "post not found")
            return
        }
		if postID!=""{
			if isLogin {
                if post.AuthorID == userInSession.ID {
                    models.PostRepo.DeletePost(postID)
                    lib.SendJSONResponse(res, http.StatusOK,map[string]string{"message":"post deleted successfully"})
                }else {
                    lib.HandleError(res, http.StatusUnauthorized, "you are not the author of this post")
                }
            }else {
                lib.HandleError(res, http.StatusUnauthorized, "not connected")
            }
		}
	}
}

func GetPost(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/posts/*", http.MethodGet) {
		
	}
}
// func GetAllPosts(res http.ResponseWriter, req *http.Request) {
// 	posts := models.PostRepository.GetAllPosts()
// 	if lib.ValidateRequest(req, res, "/posts", http.MethodGet) {
        
//     }
// }