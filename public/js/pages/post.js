// @ts-check

import { Environment } from "../lib/environment.js"

/* global HTMLElement */
/* global customElements */
/* global CustomEvent */
/* global self */

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Post
 */
export default class Post extends HTMLElement {
    constructor() {
        super()
        /**
     * Listens to the event name/typeArg: 'comment'
     *
     * @param {CustomEvent & {detail: import("../controllers/comment.js").CommentsEventDetail}} event
     */
        this.commentListener = event => event.detail.fetch.then((data) => {
            if (this.textField) {
                this.textField.value = ''
            }
        })

        /**
         * Listens to the event name/typeArg: 'post'
         *
         * @param {CustomEvent & {detail: import("../controllers/post.js").PostEventDetail}} event
         */
        this.postListener = event => {
            event.detail.fetch.then(post => {
                this.post = post
                this.render()
                this.commentForm?.addEventListener('submit', this.submitListener)
            })
        }

        /**
         * Listens to the event name/typeArg: 'user'
        *
        * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
        */
        this.userListener = event => {
            event.detail.fetch.then(user => {
                this.render(user)
                this.commentForm?.addEventListener('submit', this.submitListener)
            }).catch(error => {
                // @ts-ignore
                this.render(null)
                this.commentForm?.addEventListener('submit', this.submitListener)
                console.log(`Error@UserFetch: ${error}`)
            })
        }

        this.submitListener = (e) => {
            e.preventDefault();
            if (this.commentForm?.checkValidity()) {
                console.log("Listen");
                this.dispatchEvent(new CustomEvent('addComment', {
                    detail: {
                        /** @type {import("../lib/typing.js").AddComment} */
                        comment: {
                            text: (this.textField) ? this.textField.value : "",
                            authorID: Environment.auth ? this.user.id : '',
                            postID: this.post?.id
                        }
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
            }
        }
    }

    connectedCallback() {
        if (!Environment.auth) {
            self.location.hash = '#/login'
        }
        this.user = Environment.auth
        this.fetchSinglePost = undefined
        this.loadChildComponents()

        // listen for posts
        // @ts-ignore
        document.body.addEventListener('comment', this.commentListener)
        // @ts-ignore
        document.body.addEventListener('post', this.postListener)
        // on every connect it will attempt to get newest posts
        this.dispatchEvent(new CustomEvent('requestPost', {
            /** @type {import("../controllers/post.js").RequestPostEventDetail} */
            detail: {}, // slug gets decided at Post.js controller, could also be done by request event to router
            bubbles: true,
            cancelable: true,
            composed: true
        }))
        // @ts-ignore
        document.body.addEventListener('user', this.userListener)
        this.dispatchEvent(new CustomEvent('getUser', {
            bubbles: true,
            cancelable: true,
            composed: true
        }))
        // show initial loading because there is no connectCallback render execution
        if (!this.innerHTML) this.innerHTML = /* html */`<div class="l-grid__item"><div class="card f-height"><div class="card__body">Loading...</div></div></div>`
    }

    disconnectedCallback() {
        // @ts-ignore
        document.body.removeEventListener('post', this.postListener)
        // @ts-ignore
        document.body.removeEventListener('user', this.userListener)
        // looks nicer when cleared
        this.innerHTML = ''
    }

    /**
     * evaluates if a render is necessary
     *
     * @param {import("../lib/typing.js").AuthUser} [user = this.user]
     * @return {boolean}
     */
    shouldComponentRender(user = this.user) {
        return !this.innerHTML
    }

    /**
     * renders the post
     *
     * @param {import("../lib/typing.js").AuthUser} [user = this.user]
     * @return {void}
     */
    // @ts-ignore
    render(user = this.user) {
        if (user !== undefined) this.user = user

        if (!this.post) {
            this.innerHTML = /* html */`<div class="l-grid__item"><div class="card f-height"><div class="card__body">No Post is here... yet.</div></div></div>`
        } else {
            this.innerHTML = /* html */`<div class="l-grid__item">
            <div class="card f-height">
                <div class="card__header justify--space-between">
                    <h3>${this.post.title} at <span class="text--primary"> ${this.post.modifiedDate}</span></h3>
                </div>
                <div class="card__body">
                    <div class="outer-wrap">

                    <img src="${this.post.imageURL}" alt="">
                        <div class="wrap">
                            <div class="message active align--center justify--center">
                                <div class="speech-bubble bg--teal text--dark m--0">
                                    <p>
                                        ${this.post.description}
                                        
                                    </p>
                                </div>
                            </div>
                        </div>
                        <comment-list post-id="${this.post.id}"></comment-list>
                    </div>
                </div>
                <div class="card__footer">
                    <form class="send">
                        <button type="submit" class="primary">🚀</button>
                        <textarea name="msg" id="msg" rows="1" placeholder="Enter your message"></textarea>
                    </form>
                </div>
            </div>
        </div>`
        }
    }

    /**
     * Returns the comment form element.
     *
     * @return {HTMLFormElement | null} The comment form element.
     */
    get commentForm() {
        return document.querySelector('form.send')
    }

    /**
     * Returns the message field element.
     *
     * @return {HTMLTextAreaElement | null} The message field element.
     */
    get textField() {
        return this.querySelector('textarea#msg')
    }

    /**
     * fetch children when first needed
     *
     * @returns {Promise<[string, CustomElementConstructor][]>}
     */
    loadChildComponents() {
        return Promise.all([
            import('../widgets/comment-list.js').then(
                /** @returns {[string, CustomElementConstructor]} */
                module => ['comment-list', module.default]
            ),
        ]).then(elements => {
            elements.forEach(element => {
                // don't define already existing customElements
                // @ts-ignore
                if (!customElements.get(element[0])) customElements.define(...element)
            })
            return elements
        })
    }
}
