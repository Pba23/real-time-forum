// @ts-check

import { Environment } from "../lib/environment.js"

/* global CustomEvent */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class CommentList
 */
export default class CommentList extends HTMLElement {
    constructor() {
        super()
        this.postID = null
        /**
     * Listens to the event name/typeArg: 'comment'
     *
     * @param {CustomEvent & {detail: import("../controllers/comment.js").CommentsEventDetail}} event
     */
        this.commentListener = event => event.detail.fetch.then((data) => {
            console.log(data.comment)
        })

        /**
         * Listens to the event name/typeArg: 'list-comments'
         * which is returned when adding a comment
         *
         * @param {CustomEvent & {detail: import("../controllers/comment.js").CommentEventDetail}} event
         */
        this.commentsListener = event => this.render(event.detail.fetch)

        this.newComment = event => this.addNewComment(event.detail)
    }

    addNewComment(comment) {
        if (this.firstCard) {
            // @ts-ignore
            this.insertBefore(this.createComment(comment, false), this.firstCard)
        } else {
            // @ts-ignore
            this.appendChild(this.createComment(comment, false))
        }
    }

    connectedCallback() {
        // listen for comments
        // @ts-ignore
        document.body.addEventListener('comment', this.commentListener)
        // @ts-ignore
        document.body.addEventListener('list-comments', this.commentsListener)
        this.postID = this.getAttribute("post-id");

        // @ts-ignore
        document.body.addEventListener('comment-' + this.postID, this.newComment)
        // on every connect it will attempt to get newest comments
        this.dispatchEvent(new CustomEvent('get-comments', {
            detail: {
                postID: this.postID
            },
            bubbles: true,
            cancelable: true,
            composed: true
        }));
    }

    disconnectedCallback() {
        // @ts-ignore
        document.body.removeEventListener('list-comments', this.commentsListener)
    }

    /**
     * evaluates if a render is necessary
     *
     * @return {boolean}
     */
    shouldComponentRender() {
        return !this.innerHTML
    }

    /**
     * renders each received comment
     *
     * @param {Promise<import("../lib/typing.js").MultipleComments> | null} fetchComments
     * @return {void}
     */
    render(fetchComments) {
        this.innerHTML = ""
        fetchComments && fetchComments.then((data) => {
            const comments = data.comments
            if (!comments) return
            this.innerHTML += comments.reduce((commentsStr, comment) => (commentsStr += this.createComment(comment)), '')
        })
    }

    /**
     * html snipper for comment to be filled
     *
     * @param {import("../lib/typing.js").CommentItem} comment
     * @return {Node | string}
     */
    createComment(comment, text = true) {
        const outgoing = comment.authorID == Environment.auth?.id
        const avatar = outgoing ? Environment.auth?.nickname.toUpperCase() : comment.authorName// this.chat.talker.nickname.toUpperCase()
        const card = /* html */`
        <div class="wrap ${outgoing ? 'outgoing' : ''}">
            <div class="message active">
                <div class="profile-picture">
                    <img src="https://ui-avatars.com/api/?name=${avatar}&background=random" alt="Profile Picture">
                </div>
                <div class="speech-bubble">
                    <p>${comment.text}</p>
                </div>
            </div>
        </div>`
        if (text) return card
        const div = document.createElement('div')
        div.innerHTML = card
        return div.children[0]
    }

    /**
   * returns the first card element
   *
   * @readonly
   * @return {HTMLElement | null}
   */
    get firstCard() {
        return this.querySelector('.wrap:nth-child(1)')
    }
}
