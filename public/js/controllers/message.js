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

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'message' on 'addMessage'
 * dispatches: 'messages' on 'getMessages'
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
         * Listens to the event name/typeArg: 'addMessage'
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
            this.dispatchEvent(new CustomEvent('message', {
                /** @type {MessageEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(event.detail.message),
                        signal: this.abortController.signal,
                        credentials: 'include',
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'getMessages'
         *
         * @param {CustomEvent & {detail: GetMessagesEventDetail}} event
         */
        this.getMessagesListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = event.detail.slug || Environment.slug || ''
            const id = slug.split("-")[1]
            const url = `${Environment.fetchBaseUrl}/chat/messages/${id}`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('messages', {
                /** @type {MessagesEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        signal: this.abortController.signal,
                        credentials: 'include',
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    }).then(data => {
                        return data
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'deleteMessage'
         *
         * @param {CustomEvent & {detail: DeleteMessageEventDetail}} event
         */
        this.deleteMessageListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = (event.detail && event.detail.slug) || Environment.slug || ''
            const url = `${Environment.fetchBaseUrl}/messages/${event.detail.id}`
            fetch(url, {
                method: 'DELETE',
                credentials: 'include',
                ...Environment.fetchHeaders
            }).then(response => {
                if (response.status >= 200 && response.status <= 299) return
                throw new Error(response.statusText)
                // @ts-ignore
            })
        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('addMessage', this.addMessageListener)
        // @ts-ignore
        this.addEventListener('getMessages', this.getMessagesListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('addMessage', this.addMessageListener)
        // @ts-ignore
        this.removeEventListener('getMessages', this.getMessagesListener)
    }
}
