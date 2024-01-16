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
        this.typing = false;
        /**
     * Listens to the event name/typeArg: 'message'
     *
     * @param {CustomEvent & {detail: import("../controllers/message.js").MessagesEventDetail}} event
     */
        this.messageListener = event => event.detail.fetch.then((data) => {
            if (this.textField) {
                this.textField.value = ''
                if (this.typing) {
                    this.typing = false;
                    this.dispatchEvent(new CustomEvent('typing', {
                        detail: {
                            isTyping: this.typing,
                            to: this.chat.talker.id
                        }, // slug gets decided at Chat.js controller, could also be done by request event to router
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    }))
                }
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
                const eventName = 'typing-' + Environment.auth?.id + "-" + this.chat.talker.id
                document.body.addEventListener(eventName, this.displayTypingIndicator)
            })
        }

        this.submitListener = (e) => {
            if (e) e.preventDefault();
            if (this.messageForm?.checkValidity()) {
                const message = {
                    text: (this.textField) ? this.textField.value : "",
                    authorID: Environment.auth ? this.user.id : '',
                    receiverID: this.chat.talker.id
                }
                this.dispatchEvent(new CustomEvent('add-message', {
                    detail: {
                        /** @type {import("../lib/typing.js").AddMessage} */
                        message
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
            }
        }

        this.textAreaKeyDownListener = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitListener();
            }
        };

        this.textAreaKeyUpListener = (e) => {
            if (e.key === 'Enter' && e.shiftKey && this.textField) {
                e.preventDefault();
                // Add a new line without submitting the message
                this.textField.value += '\n';
            }
        };

        // Event listener for typing start
        this.inputListener = () => {
            if (!this.typing) {
                this.typing = true;
                this.dispatchEvent(new CustomEvent('typing', {
                    detail: {
                        isTyping: this.typing,
                        to: this.chat.talker.id
                    }, // slug gets decided at Chat.js controller, could also be done by request event to router
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
            }
        };

        // Event listener for typing start
        this.blurListener = () => {
            if (this.typing) {
                this.typing = false;
                this.dispatchEvent(new CustomEvent('typing', {
                    detail: {
                        isTyping: this.typing,
                        to: this.chat.talker.id
                    }, // slug gets decided at Chat.js controller, could also be done by request event to router
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
            }
        };

        this.displayTypingIndicator = (e) => {
            const talker = document.getElementById("talker");
            if (e.detail) {
                talker?.classList.add("typing")
            } else {
                talker?.classList.remove("typing")
            }
        }
    }

    connectedCallback() {
        if (!Environment.auth) {
            self.location.hash = '#/login'
        }
        this.chat = null;
        this.user = Environment.auth
        this.loadChildComponents()

        // listen for chats
        // @ts-ignore
        document.body.addEventListener('message', this.messageListener)
        // @ts-ignore
        document.body.addEventListener('chat-load', this.chatListener)
        // on every connect it will attempt to get newest chats
        this.dispatchEvent(new CustomEvent('request-chat-infos', {
            /** @type {import("../controllers/chat.js").RequestChatEventDetail} */
            detail: {}, // slug gets decided at Chat.js controller, could also be done by request event to router
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
        this.messageForm?.removeEventListener('keydown', this.textAreaKeyDownListener);
        this.messageForm?.removeEventListener('keyup', this.textAreaKeyUpListener);
        this.messageForm?.removeEventListener('input', this.inputListener);
        this.messageForm?.removeEventListener('blur', this.blurListener);
        this.innerHTML = ''
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
     * renders the chat
     *
     * @param {import("../lib/typing.js").AuthUser} [user = this.user]
     * @return {void}
     */
    // @ts-ignore
    render(user = this.user) {
        if (user !== undefined) this.user = user
        if (!this.chat || !this.user) return

        if (!this.chat.talker) self.location.hash = '#/404';

        document.title = `Talk with ${this.chat.talker.nickname} | ThunderForum 💜`
        this.innerHTML = /* html */`
        <div class="l-grid__item">
            <div id="chat" class="card f-height">
                <div class="card__header justify--space-between">
                    <h3 id="talker">Talk with ${this.chat.talker ? this.chat.talker.nickname : `...`} <span>is typing</span></h3>
                </div>
                <div class="card__body">
                    <message-list chat='${JSON.stringify(this.chat)}'></message-list>
                </div>
                <div class="card__footer">
                    <form class="send">
                        <button type="submit" class="primary">🚀</button>
                        <textarea name="msg" id="msg" rows="1" placeholder="Enter your message" required></textarea>
                    </form>
                </div>
            </div>
        </div>`

        this.messageForm?.addEventListener('input', this.inputListener);
        this.textField?.addEventListener('blur', this.blurListener);
        this.messageForm?.addEventListener('keydown', this.textAreaKeyDownListener);
        this.messageForm?.addEventListener('keyup', this.textAreaKeyUpListener);
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
