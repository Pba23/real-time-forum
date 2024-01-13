// @ts-check

import { Environment } from "../lib/environment.js"
import { throttle } from "../lib/utils.js";

/* global CustomEvent */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class MessageList
 */
export default class MessageList extends HTMLElement {
    constructor() {
        super()
        this.chat = null;
        this.page = 1; // Initial offset for pagination
        this.firstScroll = false;

        /**
         * Listens to the event name/typeArg: 'list-messages'
         * which is returned when adding a message
         *
         * @param {CustomEvent & {detail: import("../controllers/message.js").MessageEventDetail}} event
         */
        this.messagesListener = event => {
            this.render(event.detail.fetch)
        }

        this.loadMoreMessageListener = event => {
            event.detail.fetch.then((data) => {
                const messages = data.messages
                if (!messages) return
                if (this.firstCard) {
                    messages.forEach((message, i) => setTimeout(() => {
                        console.log(i * 30);
                        const messageElement = this.createMessage(message, false);
                        if (typeof messageElement !== 'string') this.insertBefore(messageElement, this.firstCard)
                    }, i * 150))
                }
            })
        }

        this.newMessage = event => {
            this.addNewMessage(event.detail)
        }
    }

    addNewMessage(message, scroll = true) {
        if (this.lastCard) {
            // @ts-ignore
            this.appendChild(this.createMessage(message, false))
            if (scroll) this.scrollToEnd()
        } else {
            // @ts-ignore
            this.innerHTML = this.createMessage(message)
        }
    }

    scrollToEnd() {
        if (!this.firstScroll) {
            const chatElement = document.getElementById("chat")
            if (chatElement) chatElement.addEventListener("scroll", this.handleScroll.bind(this))
        }
        if (this.lastCard) {
            this.lastCard.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
    }

    connectedCallback() {
        // listen for messages
        // @ts-ignore
        document.body.addEventListener('list-messages', this.messagesListener)
        // @ts-ignore
        document.body.addEventListener('load-more-messages', this.loadMoreMessageListener);
        const chat = this.getAttribute("chat")
        if (chat) {
            this.chat = JSON.parse(chat);
            const eventName = 'message-' + this.chat.talker.id + '-' + Environment.auth?.id
            document.body.addEventListener(eventName, this.newMessage)

            // on every connect it will attempt to get newest messages
            this.dispatchEvent(new CustomEvent('get-messages', {
                detail: {
                    chatID: this.chat.talker.id
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }
    }

    disconnectedCallback() {
        // @ts-ignore
        document.body.removeEventListener('list-messages', this.messagesListener);
        document.body.removeEventListener('load-more-messages', this.loadMoreMessageListener);
        const eventName = 'message-' + this.chat.talker.id + '-' + Environment.auth?.id
        document.body.removeEventListener(eventName, this.newMessage)
        // @ts-ignore
        const chatElement = document.getElementById("chat")
        if (chatElement) chatElement.removeEventListener("scroll", this.handleScroll.bind(this))
    }

    /**
     * Handle scroll events.
     */
    handleScroll(e) {
        if (!this.firstScroll) {
            this.firstScroll = true
            return
        }
        const chatElement = document.getElementById("chat");
        if (chatElement) {
            throttle(() => {
                const scrollPosition = chatElement.scrollTop; // Corrected this line
                // Detect if scrolled to the top
                if (scrollPosition === 0) {
                    this.page++;
                    this.dispatchEvent(
                        new CustomEvent("get-messages", {
                            detail: {
                                chatID: this.chat.talker.id,
                                limit: 10,
                                page: this.page,
                            },
                            bubbles: true,
                            cancelable: true,
                            composed: true,
                        })
                    );
                }
            }, 300)(e);
        }
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
     * renders each received message
     *
     * @param {Promise<import("../lib/typing.js").MultipleMessages>} fetchMessages
     * @return {void}
     */
    render(fetchMessages) {
        this.innerHTML = ""
        fetchMessages.then((data) => {
            if (!data.messages) {
                this.innerHTML = /* html */`Start the discussion`
                return
            }
            const messages = data.messages.reverse();

            messages.forEach((message, i, arr) => setTimeout(() => this.addNewMessage(message, i === arr.length - 1), i * 30))
        });
    }

    /**
     * html snipper for message to be filled
     *
     * @param {import("../lib/typing.js").MessageItem} message
     * @return {Node | string}
     */
    createMessage(message, text = true) {
        const outgoing = message.authorID == Environment.auth?.id
        const avatar = outgoing ? Environment.auth?.nickname.toUpperCase() : this.chat.talker.nickname.toUpperCase()
        const card = /* html */`
        <div class="wrap ${outgoing ? 'outgoing' : ''}">
            <div class="message active">
                <div class="profile-picture">
                    <img src="https://ui-avatars.com/api/?name=${avatar}&background=random" alt="Profile Picture">
                </div>
                <div class="speech-bubble">
                    <p>${message.text}</p>
                    <span class="time">${message.createDate}</span>
                </div>
            </div>
        </div>`
        if (text) return card
        const div = document.createElement('div')
        div.innerHTML = card
        return div.children[0]
    }

    /**
    * returns the last card element
    *
    * @readonly
    * @return {HTMLElement | null}
    */
    get lastCard() {
        return this.querySelector('.wrap:last-child>.message>.speech-bubble')
    }

    /**
    * returns the first card element
    *
    * @readonly
    * @return {HTMLElement | null}
    */
    get firstCard() {
        return this.querySelector('.wrap:first-child')
    }
}
