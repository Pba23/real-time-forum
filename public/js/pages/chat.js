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
 * @class Chat
 */
export default class Chat extends HTMLElement {
    constructor() {
        super()
        /**
     * Listens to the event name/typeArg: 'message'
     *
     * @param {CustomEvent & {detail: import("../controllers/message.js").MessagesEventDetail}} event
     */
        this.messageListener = event => event.detail.fetch.then((data) => {
            if (this.textField) {
                this.textField.value = ''
            }
        })

        /**
         * Listens to the event name/typeArg: 'chat'
         *
         * @param {CustomEvent & {detail: import("../controllers/chat.js").ChatEventDetail}} event
         */
        this.chatListener = (event) => {
            event.detail.fetch.then(chat => {
                this.chat = chat
                this.render()
                this.messageForm?.addEventListener('submit', this.submitListener)
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
                this.messageForm?.addEventListener('submit', this.submitListener)
            }).catch(error => {
                // @ts-ignore
                this.render(null)
                this.messageForm?.addEventListener('submit', this.submitListener)
                console.log(`Error@UserFetch: ${error}`)
            })
        }

        this.submitListener = (e) => {
            e.preventDefault();
            if (this.messageForm?.checkValidity()) {
                console.log("Listen");
                this.dispatchEvent(new CustomEvent('addMessage', {
                    detail: {
                        /** @type {import("../lib/typing.js").AddMessage} */
                        message: {
                            text: (this.textField) ? this.textField.value : "",
                            authorID: Environment.auth ? this.user.id : '',
                            receiverID: this.chat?.id
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
        this.fetchSingleChat = undefined
        this.loadChildComponents()

        // listen for chats
        // @ts-ignore
        document.body.addEventListener('message', this.messageListener)
        // @ts-ignore
        document.body.addEventListener('chat', this.chatListener)
        // on every connect it will attempt to get newest chats
        this.dispatchEvent(new CustomEvent('requestChat', {
            /** @type {import("../controllers/chat.js").RequestChatEventDetail} */
            detail: {}, // slug gets decided at Chat.js controller, could also be done by request event to router
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
        document.body.removeEventListener('chat', this.chatListener)
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
     * renders the chat
     *
     * @param {import("../lib/typing.js").AuthUser} [user = this.user]
     * @return {void}
     */
    // @ts-ignore
    render(user = this.user) {
        if (user !== undefined) this.user = user

        if (!this.chat) {
            this.innerHTML = /* html */`<div class="l-grid__item"><div class="card f-height"><div class="card__body">Start the discussion</div></div></div>`
        } else {
            this.innerHTML = /* html */`<div class="l-grid__item">
            <div class="card f-height">
                <div class="card__header justify--space-between">
                    <h3>Talk with ${this.chat.nickname}</h3>
                </div>
                <div class="card__body">
                    <div class="outer-wrap">
                        <message-list chat-id="${this.chat.id}"></message-list>
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
     * Returns the message form element.
     *
     * @return {HTMLFormElement | null} The message form element.
     */
    get messageForm() {
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
            import('../widgets/message-list.js').then(
                /** @returns {[string, CustomElementConstructor]} */
                module => ['message-list', module.default]
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
