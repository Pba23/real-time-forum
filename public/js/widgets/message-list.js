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
        this.chatID = null
        /**
     * Listens to the event name/typeArg: 'message'
     *
     * @param {CustomEvent & {detail: import("../controllers/message.js").MessagesEventDetail}} event
     */
        this.messageListener = event => event.detail.fetch.then((data) => {
            const message = data.message
            this.addNewMessage(message)
        })

        /**
         * Listens to the event name/typeArg: 'messages'
         * which is returned when adding a message
         *
         * @param {CustomEvent & {detail: import("../controllers/message.js").MessageEventDetail}} event
         */
        this.messagesListener = event => {
            this.render(event.detail.fetch)
        }

        this.newMessage = event => {
            console.log(event);
        }
    }

    addNewMessage(message) {
        if (this.firstCard) {
            // @ts-ignore
            this.insertBefore(this.createMessage(message, false), this.firstCard)
        } else {
            // @ts-ignore
            this.appendChild(this.createMessage(message))
        }
    }

    connectedCallback() {
        // listen for messages
        // @ts-ignore
        document.body.addEventListener('message', this.messageListener)
        // @ts-ignore
        document.body.addEventListener('new-message', this.newMessage)
        // @ts-ignore
        document.body.addEventListener('messages', this.messagesListener)
        this.chatID = this.getAttribute("chat-id");
        console.log(this.chatID);

        // on every connect it will attempt to get newest messages
        this.dispatchEvent(new CustomEvent('getMessages', {
            detail: {
                chatID: this.chatID
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
            console.log(data);
            const messages = data.messages
            if (!messages) {
                this.innerHTML = /* html */`<div class="card__body">Start the discussion</div>`
                return
            }
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
                <img src="${message.senderAvatar? '' : `https://ui-avatars.com/api/?name=John+Doe&background=random`}" alt="Profile Picture">
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
