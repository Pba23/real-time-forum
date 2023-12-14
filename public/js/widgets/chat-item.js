// @ts-check

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
        this.postID = null
        /**
     * Listens to the event name/typeArg: 'message'
     *
     * @param {CustomEvent & {detail: import("../controllers/chat.js").CommentEventDetail}} event
     */
        this.messageListener = event => event.detail.fetch.then((data) => {
            const message = data.message     
                // @ts-ignore
                this.appendChild(this.createMessage(message))
        })

        /**
         * Listens to the event name/typeArg: 'messages'
         * which is returned when adding a message
         *
         * @param {CustomEvent & {detail: import("../controllers/chat.js").CommentEventDetail}} event
         */
        this.messagesListener = event => {
            this.render(event.detail.fetch)
        }
    }

    connectedCallback() {
        // listen for messages
        // @ts-ignore
        document.body.addEventListener('message', this.messageListener)
        // @ts-ignore
        document.body.addEventListener('messages', this.messagesListener)
        this.postID = this.getAttribute("post-id");

        // on every connect it will attempt to get newest messages
        this.dispatchEvent(new CustomEvent('getmessages', {
            detail: {
                postID: this.postID
            },
            bubbles: true,
            cancelable: true,
            composed: true
        }))
    }

    disconnectedCallback() {
        // @ts-ignore
        document.body.removeEventListener('messages', this.messagesListener)
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
     * @param {Promise<import("../lib/typing.js").MultipleMessages> | null} fetchMessages
     * @return {void}
     */
    render(fetchMessages) {
        this.innerHTML = ""
        fetchMessages && fetchMessages.then((data) => {
            const messages = data.messages
            if (!messages) return
            this.innerHTML += messages.reduce((messagesStr, message) => (messagesStr += this.createMessage(message)), '')
        })
    }

    /**
     * html snipper for message to be filled
     *
     * @param {import("../lib/typing.js").MessageItem} message
     * @return {Node | string}
     */
    createMessage(message, text = true) {
        const card = /* html */`
        <div class="message active">
            <div class="profile-picture">
                <img src="${message.senderAvatar}" alt="Profile Picture">
            </div>
            <div class="speech-bubble">
                <p>${message.text}</p>
            </div>
        </div>`
        if (text) return card
        const div = document.createElement('div')
        div.classList.add("wrap", "outgoing")
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
        return this.querySelector('.message:nth-child(1)')
    }
}
