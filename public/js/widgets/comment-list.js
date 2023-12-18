// @ts-check

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
         * Listens to the event name/typeArg: 'comments'
         * which is returned when adding a comment
         *
         * @param {CustomEvent & {detail: import("../controllers/comment.js").CommentEventDetail}} event
         */
        this.commentsListener = event => {
            this.render(event.detail.fetch)
        }

        this.newComment = event => {
            this.addNewComment(event.detail)
        }
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
        document.body.addEventListener('comments', this.commentsListener)
        this.postID = this.getAttribute("post-id");

        // @ts-ignore
        document.body.addEventListener('comment-' + this.postID, this.newComment)
        // on every connect it will attempt to get newest comments
        this.dispatchEvent(new CustomEvent('getComments', {
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
        document.body.removeEventListener('comments', this.commentsListener)
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
        const card = /* html */`
        <div class="message active">
            <div class="profile-picture">
                <img src="${comment.authorAvatar}" alt="Profile Picture">
            </div>
            <div class="speech-bubble">
                <p>${comment.text}</p>
            </div>
        </div>`
        if (text) return card
        const div = document.createElement('div')
        div.classList.add("wrap", "outgoing")
        div.innerHTML = card
        console.log(div);
        return div.children[0]
    }

    /**
   * returns the first card element
   *
   * @readonly
   * @return {HTMLElement | null}
   */
    get firstCard() {
        return this.querySelector('.message:nth-child(1)')
    }
}
