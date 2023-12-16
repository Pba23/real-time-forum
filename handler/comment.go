package handler

import (
	"encoding/json"
	"html"

	// "errors"
	"net/http"
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"sort"
	"strings"
)

func SortComments(comments []*models.CommentItem) []*models.CommentItem {
	commentMap := make(map[string][]*models.CommentItem)

	for _, comment := range comments {
		commentMap[comment.ParentID] = append(commentMap[comment.ParentID], comment)
	}

	var sortedComments []*models.CommentItem
	var dfs func(string, int)
	dfs = func(parentID string, depth int) {
		children := commentMap[parentID]
		sort.SliceStable(children, func(i, j int) bool {
			return children[i].Index < children[j].Index
		})
		for _, child := range children {
			child.Index = depth
			child.Depth = strings.Repeat(`<span class="ml-1"></span>`, child.Index)
			sortedComments = append(sortedComments, child)
			dfs(child.ID, depth+1)
		}
	}

	dfs("", 0)
	return sortedComments
}
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
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		postID := pathPart[2]
		comments, err := models.CommentRepo.GetCommentsOfPost(postID)
		if err != nil {
			lib.HandleError(res, http.StatusNotFound, err.Error())
			return
		}
		comments = SortComments(comments)
		lib.SendJSONResponse(res, http.StatusOK, map[string]any{
			"message":  "comment list got successfully",
			"comments": comments,
		})
	}
}

// func EditComment(res http.ResponseWriter, req *http.Request) {
// 	if lib.ValidateRequest(req, res, "/edit-comment/*", http.MethodPost) {

// 	}
// }

// func DeleteComment(res http.ResponseWriter, req *http.Request) {
// 	if lib.ValidateRequest(req, res, "/delete-comment/*", http.MethodGet) {

// 	}
// }

// func LikeComment(res http.ResponseWriter, req *http.Request) {
// 	if lib.ValidateRequest(req, res, "/like-comment/*", http.MethodGet) {

// 	}
// }

// func DislikeComment(res http.ResponseWriter, req *http.Request) {
// 	if lib.ValidateRequest(req, res, "/dislike-comment/*", http.MethodGet) {

//		}
//	}
func validateCommentInput(comment *models.Comment) error {
	// Add any validation rules as needed
	if comment.Text == "" {
		return ErrMissingRequiredFields
	}
	comment.Text = html.EscapeString(comment.Text)
	return nil
}
