package handler

import (
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

func GetComments(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/comment/*", http.MethodPost) {

	}
}

func EditComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-comment/*", http.MethodPost) {

	}
}

func DeleteComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/delete-comment/*", http.MethodGet) {

	}
}

func LikeComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/like-comment/*", http.MethodGet) {

	}
}

func DislikeComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/dislike-comment/*", http.MethodGet) {
		
	}
}
