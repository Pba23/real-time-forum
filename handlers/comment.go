package handler

import (
	"real-time-forum/data/models"
	"real-time-forum/lib"
	"log"
	"net/http"
	"sort"
	"strings"
	"text/template"
	"time"

	"github.com/gofrs/uuid"
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

func Comment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/comment/*", http.MethodPost) {
		err := req.ParseForm()
		if err != nil {
			http.Error(res, err.Error(), http.StatusBadRequest)
			return
		}
		text := strings.TrimSpace(req.FormValue("text"))
		parentID := strings.TrimSpace(req.FormValue("parentID"))
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		if text != "" {
			if len(pathPart) == 3 && pathPart[1] == "comment" {
				creationDate := time.Now().Format("2006-01-02 15:04:05")
				modifDate := time.Now().Format("2006-01-02 15:04:05")

				authorID := models.GetUserFromSession(req).ID
				postID := pathPart[2]

				commentStruct := models.Comment{
					Text:         text,
					AuthorID:     authorID,
					PostID:       postID,
					ParentID:     parentID,
					CreateDate:   creationDate,
					ModifiedDate: modifDate,
				}

				models.CommentRepo.CreateComment(&commentStruct)
				lib.RedirectToPreviousURL(res, req)
				u, err := uuid.NewV4()
				if err != nil {
					log.Fatalf("❌ Failed to generate UUID: %v", err)
				}
				post, err := models.PostRepo.GetPostByCommentID(commentStruct.ID)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ error Finding the Post")
					return
				}
				postOwner, _ := models.UserRepo.GetUserByPostID(post.ID)
				time := creationDate
				Author, _ := models.UserRepo.GetUserByID(commentStruct.AuthorID)
				notif := models.Notification{
					ID:         u.String(),
					AuthorID:   Author.ID,
					AuthorName: Author.Username,
					PostID:     post.ID,
					OwnerID:    postOwner.ID,
					Notif_type: "have commented (" + commentStruct.Text + ") your post",
					Slug:       post.Slug,
					Time:       lib.FormatDate(time),
				}
				err = models.NotifRepo.CreateNotification(&notif)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ error Insert Notification")
					return
				}
				notifications, err := models.NotifRepo.GetAllNotifs()
				Update := models.Comment{
					ID:            commentStruct.ID,
					Text:          text,
					AuthorID:      commentStruct.AuthorID,
					PostID:        postID,
					ParentID:      parentID,
					CreateDate:    creationDate,
					ModifiedDate:  modifDate,
					Notifications: notifications,
				}
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ no notifications")
					return
				}
				err = models.CommentRepo.UpdateComment(&Update)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ error Update comment rate")
					return
				}
				lib.RedirectToPreviousURL(res, req)

			}
		} else {
			lib.RedirectToPreviousURL(res, req)
		}

	}
}

func EditComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/edit-comment/*", http.MethodPost) {
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		if len(pathPart) == 3 && pathPart[1] == "edit-comment" && pathPart[2] != "" {
			id := pathPart[2]
			comment, err := models.CommentRepo.GetCommentByID(id)
			if comment == nil {
				return
			}
			if err != nil {
				res.WriteHeader(http.StatusInternalServerError)
				log.Println("❌ error DB")
				return
			}
			comment.Text = req.FormValue("text")
			comment.ModifiedDate = time.Now().Format("2006-01-02 15:04:05")
			models.CommentRepo.UpdateComment(comment)
			http.Redirect(res, req, "/profile?index=4", http.StatusSeeOther)
		} else {
			res.WriteHeader(http.StatusNotFound)
			lib.RenderPage("base", "404", nil, res)
			log.Println("404 ❌ - Page not found ", req.URL.Path)
			return
		}
	} else {
		res.WriteHeader(http.StatusNotFound)
		lib.RenderPage("base", "404", nil, res)
		log.Println("404 ❌ - Page not found ", req.URL.Path)
		return
	}
}

func DeleteComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/delete-comment/*", http.MethodGet) {
		isSessionOpen := models.ValidSession(req)
		if isSessionOpen {
			path := req.URL.Path
			pathPart := strings.Split(path, "/")
			if len(pathPart) == 3 && pathPart[1] == "delete-comment" && pathPart[2] != "" {
				id := pathPart[2]
				models.CommentRepo.DeleteComment(id)

				log.Println("✅ comment deleted with success")
				http.Redirect(res, req, "/profile?index=4", http.StatusSeeOther)
			}
		} else {
			res.WriteHeader(http.StatusNotFound)
			lib.RenderPage("base", "404", nil, res)
			log.Println("404 ❌ - Page not found ", req.URL.Path)
			return
		}
	} else {
		res.WriteHeader(http.StatusNotFound)
		lib.RenderPage("base", "404", nil, res)
		log.Println("404 ❌ - Page not found ", req.URL.Path)
		return
	}
}

func LikeComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/like-comment/*", http.MethodGet) {
		err := req.ParseForm()
		if err != nil {
			http.Error(res, err.Error(), http.StatusBadRequest)
			return
		}
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		if len(pathPart) == 3 && pathPart[1] == "like-comment" && pathPart[2] != "" {
			commentID := pathPart[2]
			comment, err := models.CommentRepo.GetCommentByID(commentID)
			if comment == nil {
				res.WriteHeader(http.StatusNotFound)
				lib.RenderPage("base", "404", nil, res)
				log.Println("404 ❌ - Page not found ", req.URL.Path)
				return
			}
			if err != nil {
				res.WriteHeader(http.StatusInternalServerError)
				log.Println("❌ error DB")
				return
			}
			user := models.GetUserFromSession(req)
			if user == nil {
				return
			}
			commentRate, err := models.CommentRateRepo.GetRateByAuthorIDandCommentID(user.ID, comment.ID)
			if err != nil {
				res.WriteHeader(http.StatusInternalServerError)
				log.Println("❌ error Reading from Rate")
				return
			}
			if commentRate == nil {
				NewRate := models.CommentRate{
					Rate:      1,
					AuthorID:  user.ID,
					CommentID: comment.ID,
				}
				err = models.CommentRateRepo.CreateCommentRate(&NewRate)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ error Creating comment rate")
					return
				}
				lib.RedirectToPreviousURL(res, req)
			} else {
				if commentRate.Rate == 0 || commentRate.Rate == 2 {
					u, err := uuid.NewV4()
					if err != nil {
						log.Fatalf("❌ Failed to generate UUID: %v", err)
					}
					post, err := models.PostRepo.GetPostByCommentID(commentRate.CommentID)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Finding the Post")
						return
					}
					postOwner, _ := models.UserRepo.GetUserByPostID(post.ID)
					time := time.Now().Format("2006-01-02 15:04:05")
					notif := models.Notification{
						ID:         u.String(),
						AuthorID:   user.ID,
						AuthorName: user.Username,
						PostID:     post.ID,
						OwnerID:    postOwner.ID,
						Notif_type: "has liked ❤️ your comment",
						Slug:       post.Slug,
						Time:       lib.FormatDate(time),
					}
					err = models.NotifRepo.CreateNotification(&notif)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Insert Notification")
						return
					}
					notifications, err := models.NotifRepo.GetAllNotifs()
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ no notifications")
						return
					}
					UpdateRate := models.CommentRate{
						ID:            commentRate.ID,
						Rate:          1,
						AuthorID:      user.ID,
						CommentID:     comment.ID,
						Notifications: notifications,
					}
					err = models.CommentRateRepo.UpdateRate(&UpdateRate)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Update comment rate")
						return
					}
					lib.RedirectToPreviousURL(res, req)
				} else if commentRate.Rate == 1 {
					UpdateRate := models.CommentRate{
						ID:        commentRate.ID,
						Rate:      0,
						AuthorID:  user.ID,
						CommentID: comment.ID,
					}
					err = models.CommentRateRepo.UpdateRate(&UpdateRate)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Update comment rate")
						return
					}
					lib.RedirectToPreviousURL(res, req)
				}
			}
		} else {
			res.WriteHeader(http.StatusNotFound)
			lib.RenderPage("base", "404", nil, res)
			log.Println("404 ❌ - Page not found ", req.URL.Path)
		}
	}
}

func DislikeComment(res http.ResponseWriter, req *http.Request) {
	if lib.ValidateRequest(req, res, "/dislike-comment/*", http.MethodGet) {
		err := req.ParseForm()
		if err != nil {
			http.Error(res, err.Error(), http.StatusBadRequest)
			return
		}
		path := req.URL.Path
		pathPart := strings.Split(path, "/")
		if len(pathPart) == 3 && pathPart[1] == "dislike-comment" && pathPart[2] != "" {
			commentID := pathPart[2]
			comment, err := models.CommentRepo.GetCommentByID(commentID)
			if comment == nil {
				res.WriteHeader(http.StatusNotFound)
				lib.RenderPage("base", "404", nil, res)
				log.Println("404 ❌ - Page not found ", req.URL.Path)
				return
			}
			if err != nil {
				res.WriteHeader(http.StatusInternalServerError)
				log.Println("❌ error DB")
				return
			}
			user := models.GetUserFromSession(req)
			if user == nil {
				return
			}
			commentRate, err := models.CommentRateRepo.GetRateByAuthorIDandCommentID(user.ID, comment.ID)
			if err != nil {
				res.WriteHeader(http.StatusInternalServerError)
				log.Println("❌ error Reading from Rate")
				return
			}
			if commentRate == nil {
				NewRate := models.CommentRate{
					Rate:      2,
					AuthorID:  user.ID,
					CommentID: comment.ID,
				}
				err = models.CommentRateRepo.CreateCommentRate(&NewRate)
				if err != nil {
					res.WriteHeader(http.StatusInternalServerError)
					log.Println("❌ error Creating comment rate")
					return
				}
				lib.RedirectToPreviousURL(res, req)
			} else {
				if commentRate.Rate == 0 || commentRate.Rate == 1 {
					u, err := uuid.NewV4()
					if err != nil {
						log.Fatalf("❌ Failed to generate UUID: %v", err)
					}
					post, err := models.PostRepo.GetPostByCommentID(commentRate.CommentID)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Finding the Post")
						return
					}
					postOwner, _ := models.UserRepo.GetUserByPostID(post.ID)
					time := time.Now().Format("2006-01-02 15:04:05")
					notif := models.Notification{
						ID:         u.String(),
						AuthorID:   user.ID,
						AuthorName: user.Username,
						PostID:     post.ID,
						OwnerID:    postOwner.ID,
						Notif_type: "has disliked 👎 your comment",
						Slug:       post.Slug,
						Time:       lib.FormatDate(time),
					}
					err = models.NotifRepo.CreateNotification(&notif)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Insert Notification")
						return
					}
					notifications, err := models.NotifRepo.GetAllNotifs()
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ no notifications")
						return
					}

					UpdateRate := models.CommentRate{
						ID:            commentRate.ID,
						Rate:          2,
						AuthorID:      user.ID,
						CommentID:     comment.ID,
						Notifications: notifications,
					}
					err = models.CommentRateRepo.UpdateRate(&UpdateRate)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Update comment rate")
						return
					}
					lib.RedirectToPreviousURL(res, req)
				} else if commentRate.Rate == 2 {
					UpdateRate := models.CommentRate{
						ID:        commentRate.ID,
						Rate:      0,
						AuthorID:  user.ID,
						CommentID: comment.ID,
					}
					err = models.CommentRateRepo.UpdateRate(&UpdateRate)
					if err != nil {
						res.WriteHeader(http.StatusInternalServerError)
						log.Println("❌ error Update comment rate")
						return
					}
					lib.RedirectToPreviousURL(res, req)
				}
			}
		} else {
			res.WriteHeader(http.StatusNotFound)
			lib.RenderPage("base", "404", nil, res)
			log.Println("404 ❌ - Page not found ", req.URL.Path)
		}
	}
}