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

func CreateComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/comment/*", http.MethodPost) {
		userInSession := models.GetUserFromSession(req)
		isLogin := models.ValidSession(req)
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		postID := pathPart[2]
		_, err := models.PostRepo.GetPostByID(postID)
		if err != nil {
			lib.HandleError(res, http.StatusNotFound, "post not found")
			return
		}
		if isLogin {
			var commentInfo models.Comment
			if err := json.NewDecoder(req.Body).Decode(&commentInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, "Invalid JSON format")
				return
			}
			if err := validateCommentInput(&commentInfo); err != nil {
				lib.HandleError(res, http.StatusBadRequest, err.Error())
				return
			}

			commentInfo.AuthorID = userInSession.ID
			commentInfo.PostID = postID
			err = models.CommentRepo.CreateComment(&commentInfo)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error creating comment : "+err.Error())
				return
			}
			comment, err := models.CommentRepo.GetCommentByID(commentInfo.ID)
			if err != nil {
				lib.HandleError(res, http.StatusInternalServerError, "Error getting comment : "+err.Error())
				return
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{
				"message": "comment created successfully",
				"comment": comment,
			})
			SendComment(postID, comment)
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "not connected")
		}
	}
}

func GetComments(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/comments/*", http.MethodGet) {
		if models.ValidSession(req) {
			path := req.URL.Path
			pathPart := strings.Split(path, "/")
			postID := pathPart[2]
			comments, err := models.CommentRepo.GetCommentsOfPost(postID)
			if err != nil {
				lib.HandleError(res, http.StatusNotFound, err.Error())
				return
			}
			lib.SendJSONResponse(res, http.StatusOK, map[string]any{
				"message":  "comment list got successfully",
				"comments": comments,
			})
		} else {
			lib.HandleError(res, http.StatusUnauthorized, "No active session")
		}
	}
}

func validateCommentInput(comment *models.Comment) error {
	// Add any validation rules as needed
	if comment.Text == "" {
		return ErrMissingRequiredFields
	}
	comment.Text = html.EscapeString(comment.Text)
	return nil
}
