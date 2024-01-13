// @ts-check
import { Environment } from "../lib/environment.js"

/* global customElements */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class ChatPreview
 */
export default class ChatPreview extends HTMLElement {
    /**
     * customDefine
     *
     * @param {import("../lib/typing.js").ChatItem | null} [chat = null]
     */
    constructor(chat = null) {
        super()

        // allow innerHTML ChatPreview with chat as a string attribute
        this.chat = chat || JSON.parse((this.getAttribute('chat') || '').replace(/'/g, '"') || '{}')
        this.updateStatus = (event) => {
            this.chat.is_connected = event.detail
            this.render(this.chat)
        }

        this.updateLastMessage = (event) => {
            this.chat.last_message = event.detail.text
            this.chat.last_message_time = event.detail.createDate
            this.render(this.chat)
        }
    }

    connectedCallback() {
        if (this.shouldComponentRender()) this.render(this.chat)
        const statusEventName = 'status-' + this.chat.id
        document.body.addEventListener(statusEventName, this.updateStatus)
        const messageEventName = 'message-' + this.chat.id + '-' + Environment.auth?.id
        document.body.addEventListener(messageEventName, this.updateLastMessage)
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
     * @param {import("../lib/typing.js").ChatItem} [chat = this.chat]
     * @return {void | string}
     */
    render(chat = this.chat) {
        if (chat == undefined || chat == null) {
            this.innerHTML = `<div class="Chat-preview">No Chat is here... yet.</div>`
            return
        }
        this.innerHTML = /* html */`
        <div class="card item">
            <div class="card__body">
                <div class="display--flex flex--col f-width">
                    <h4 class="mr--16"><a class="not" href="#/chat/${chat.id}">${chat.nickname} ${chat.is_connected ? '🟢' : '🔴'}</a></h4>
                    <div class="display--flex f-width justify--space-between mb--8">
                        <span class="text--small text--gray">${chat.last_message ? chat.last_message : 'No messages'}</span>
                        <span class="text--small text--gray">${chat.last_message_time}</span>
                    </div>
                </div>
            </div>
        </div>`
    }
}
