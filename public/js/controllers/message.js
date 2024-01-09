// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */

/**
 *
 * @typedef {{ slug?: string, body: string }} AddMessagesEventDetail
 */

/**
 *
 * @typedef {{
  fetch: Promise<import("../lib/typing.js").MessageItem>
}} MessageEventDetail
*/

/**
 *
 * @typedef {{ slug?: string }} GetMessagesEventDetail
 */

/**
 *
 * @typedef {{
      fetch: Promise<import("../lib/typing.js").MultipleMessages>
    }} MessagesEventDetail
 */

/**
 *
 * @typedef {{ slug?: string, id: string }} DeleteMessageEventDetail
 */

import { Environment } from '../lib/environment.js'
import { dispatchCustomEvent } from '../lib/utils.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'message' on 'add-message'
 * dispatches: 'list-messages' on 'get-messages'
 * does nothing on 'deleteMessage'
 *
 * @export
 * @class Messages
 */
export default class Messages extends HTMLElement {
    constructor() {
        super()

        /**
         * Used to cancel ongoing, older fetches
         * this makes sense, if you only expect one and most recent true result and not multiple
         *
         * @type {AbortController | null}
         */
        this.abortController = null

        /**
         * Listens to the event name/typeArg: 'add-message'
         *
         * @param {CustomEvent & {detail: AddMessagesEventDetail}} event
         */
        this.addMessageListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const url = `${Environment.fetchBaseUrl}/chat/new`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            dispatchCustomEvent(this, 'message', url, {
                method: 'POST',
                body: JSON.stringify(event.detail.message),
                signal: this.abortController.signal,
                credentials: 'include',
                ...Environment.fetchHeaders
            })
        }

        /**
         * Listens to the event name/typeArg: 'get-messages'
         *
         * @param {CustomEvent & {detail: GetMessagesEventDetail}} event
         */
        this.getMessagesListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = event.detail.chatID || Environment.slug || ''
            const url = `${Environment.fetchBaseUrl}/chat/messages/${slug}`

            // reset old AbortController and assign new one
            // if (this.abortController) this.abortController.abort()
            // this.abortController = new AbortController()
            // answer with event
            dispatchCustomEvent(this, 'list-messages', url, {
                // signal: this.abortController.signal,
                credentials: 'include',
                ...Environment.fetchHeaders
            })
        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('add-message', this.addMessageListener)
        // @ts-ignore
        this.addEventListener('get-messages', this.getMessagesListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('add-message', this.addMessageListener)
        // @ts-ignore
        this.removeEventListener('get-messages', this.getMessagesListener)
    }
}
