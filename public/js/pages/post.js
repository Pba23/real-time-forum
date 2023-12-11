// @ts-check

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
         * Listens to the event name/typeArg: 'post'
         *
         * @param {CustomEvent & {detail: import("../controllers/post.js").PostEventDetail}} event
         */
        this.postListener = event => this.render(event.detail.fetch)

        /**
         * Listens to the event name/typeArg: 'user'
         *
         * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
         */
        this.userListener = event => {
            event.detail.fetch.then(user => {
                if (this.shouldComponentRender(user)) this.render(undefined, user)
            }).catch(error => {
                // @ts-ignore
                this.render(undefined, null)
                console.log(`Error@UserFetch: ${error}`)
            })
        }
    }

    connectedCallback() {
        this.user = undefined
        this.fetchSinglePost = undefined

        // listen for posts
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
        return user !== this.user
    }

    /**
     * renders the post
     *
     * @param {Promise<import("../lib/typing.js").EntirePost>} [fetchSinglePost = this.fetchSinglePost]
     * @param {import("../lib/typing.js").AuthUser} [user = this.user]
     * @return {void}
     */
    // @ts-ignore
    render(fetchSinglePost = this.fetchSinglePost, user = this.user) {
        if (user !== undefined) this.user = user
        if (fetchSinglePost) {
            this.fetchSinglePost = fetchSinglePost
            Promise.all([fetchSinglePost, this.loadChildComponents()]).then(result => {
                const post = result[0]
                if (!post) {
                    this.innerHTML = /* html */`<div class="l-grid__item"><div class="card f-height"><div class="card__body">No Post is here... yet.</div></div></div>`
                } else {
                    console.log(post);
                    this.innerHTML = /* html */`<div class="l-grid__item">
            <div class="card f-height">
                <div class="card__header justify--space-between">
                    <h3>${post.title} at <span class="text--primary"> ${post.modifiedDate}</span></h3>
                    <div>
                        <button class="light small">❤️</button>
                        <button class="light small">💩</button>
                    </div>
                </div>
                <div class="card__body">
                    <div class="outer-wrap">
                        <div class="wrap">
                            <div class="message active align--center justify--center">
                                <div class="speech-bubble bg--teal text--dark m--0">
                                    <p>
                                        ${post.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="wrap outgoing">
                            <div class="message active">
                                <div class="profile-picture">
                                    <img src="https://images.unsplash.com/photo-1548655820-aaef3a7db508?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODQ1MjMyMDV8&ixlib=rb-4.0.3&q=85"
                                        alt="Profile Picture">
                                </div>
                                <div class="speech-bubble">
                                    <p>I don't know</p>
                                </div>
                            </div>
                            <div class="message active">
                                <div class="speech-bubble">
                                    <p>Why?</p>
                                </div>
                            </div>
                        </div>
                        <div class="wrap">
                            <div class="message active">
                                <div class="profile-picture">
                                    <img src="https://images.unsplash.com/photo-1562695914-1970cc32ef52?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODQ1MjMyMDV8&ixlib=rb-4.0.3&q=85"
                                        alt="Profile Picture" />
                                </div>
                                <div class="speech-bubble">
                                    <p>Because they make everything up!</p>
                                </div>
                            </div>
                            <div class="message active">
                                <div class="speech-bubble">
                                    <p>😂😂😂😂😂😂</p>
                                </div>
                            </div>
                            <div class="message active">
                                <div class="speech-bubble">
                                    <p>😂</p>
                                </div>
                            </div>
                        </div>
                        <div class="wrap outgoing">
                            <div class="message active">
                                <div class="profile-picture">
                                    <img src="https://images.unsplash.com/photo-1562695914-1970cc32ef52?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2ODQ1MjMyMDV8&ixlib=rb-4.0.3&q=85"
                                        alt="Profile Picture" />
                                </div>
                                <div class="speech-bubble">
                                    <p>Because they make everything up!</p>
                                </div>
                            </div>
                            <div class="message active">
                                <div class="speech-bubble">
                                    <p>😂😂😂😂😂😂</p>
                                </div>
                            </div>
                            <div class="message active">
                                <div class="speech-bubble">
                                    <p>😂</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card__footer">
                    <div class="send">
                        <button class="primary">🚀</button>
                        <textarea name="msg" id="msg" rows="1" placeholder="Enter your message"></textarea>
                    </div>
                </div>
            </div>
        </div>`
                }
            })
        }
    }

    /**
     * fetch children when first needed
     *
     * @returns {Promise<[string, CustomElementConstructor][]>}
     */
    loadChildComponents() {
        return Promise.all([
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
