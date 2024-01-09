// @ts-check
/* global HTMLElement */
/* global customElements */

/**
 *
 * @typedef {{
      authPage: Boolean
    }} AuthPageEventDetail
 */

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Aside
 */
export default class Aside extends HTMLElement {
    constructor() {
        super()
        this.isAuthPage = false
        this.isChat = false

        /**
        * Listens to the event name/typeArg: 'authPage'
        *
        * @param {CustomEvent & {detail: AuthPageEventDetail}} event
        */
        this.authPageListener = event => {
            if (this.isAuthPage === undefined || this.isAuthPage !== event.detail.authPage) {
                this.isAuthPage = event.detail.authPage
                this.render()
            }
        }
    }

    connectedCallback() {
        this.loadChildComponents()
        if (this.shouldComponentRender()) this.render()
        // @ts-ignore
        document.body.addEventListener('authPage', this.authPageListener)
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
     * renders the footer
     *
     * @return {void}
     */
    render() {
        this.innerHTML = this.isAuthPage ?
        /* html */`
        <div class="l-grid__item aside f-height">
            <div class="card f-height mb--0">
                <div class="card__body p--32 text--center">
                    <h2 class="mb--24">🚀 Join the ThunderForum Community!</h2>
                    <p>
                        Connect with like-minded individuals, participate in discussions, and experience real-time chat
                        with other members.
                    </p>
                    <h2 class="mt--32 mb--24">Why join us?</h2>
                    <ul>
                        <li>🎤 Engage in meaningful discussions on various topics.</li>
                        <li>🗨️ Experience real-time chat for instant communication.</li>
                        <li>📰 Stay updated with the latest posts and comments.</li>
                    </ul>
                </div>
            </div>
        </div>
      `
            : /* html */`
        <div class="l-grid__item aside f-height">
            <div class="mb--16">
                <button class="small primary" id="btnPost">Post</button>
                <button class="small primary" id="btnChat">Chat</button>
            </div>
            ${this.isChat ? /* html */`<chat-list></chat-list>` : /* html */`<post-list></post-list>`}
        </div>
      `

        if (this.btnPost && this.btnChat) {
            this.btnPost.addEventListener('click', () => { if (this.isChat) this.isChat = false; this.render() });
            this.btnChat.addEventListener('click', () => { if (!this.isChat) this.isChat = true; this.render() });
        }
    }


    /**
    * @return {HTMLButtonElement | null}
    */
    get btnPost() {
        return this.querySelector('button#btnPost')
    }

    /**
    * @return {HTMLButtonElement | null}
    */
    get btnChat() {
        return this.querySelector('button#btnChat')
    }

    /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
    loadChildComponents() {
        return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
            import('../widgets/post-list.js').then(
                /** @returns {[string, CustomElementConstructor]} */
                module => ['post-list', module.default]
            ),
            import('../widgets/chat-list.js').then(
                /** @returns {[string, CustomElementConstructor]} */
                module => ['chat-list', module.default]
            ),
        ]).then(elements => {
            elements.forEach(element => {
                // don't define already existing customElements
                // @ts-ignore
                if (!customElements.get(element[0])) customElements.define(...element)
            })
            return elements
        }))
    }
}
