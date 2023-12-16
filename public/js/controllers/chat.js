// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */
/* global self */

/**
 *
 * @typedef {{ slug?: string }} RequestChatEventDetail
 */

/**
 *
 * @typedef {{
      slug: RequestChatEventDetail,
      fetch: Promise<import("../lib/typing.js").ChatItem>
    }} ChatEventDetail
 */

/**
 *
 * @typedef {{ tag?: string, author?: string, favorite?: string, limit?: number, offset?: number, showYourFeed?: boolean }} RequestListChatsEventDetail
 */

/**
 *
 * @typedef {{
  fetch: Promise<import("../lib/typing.js").ChatItem[]>
}} ListChatsEventDetail
*/

import { Environment } from '../lib/environment.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'chat' on 'requestChat'
 * dispatches: 'chat' on 'chatChat'
 * reroutes to home on 'deleteChat'
 * dispatches: 'listChats' on 'requestListChats'
 *
 * @export
 * @class Chat
 */
export default class Chat extends HTMLElement {
    constructor() {
        super()

        /**
         * Used to cancel ongoing, older fetches
         * this makes sense, if you only expect one and most recent true result and not multiple
         *
         * @type {AbortController | null}
         */
        this.abortController = null
        this.abortControllerList = null

        this.publishChatListener = event => {
            const url = `${Environment.fetchBaseUrl}/chat`

            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            // answer with event
            this.dispatchEvent(new CustomEvent('chat', {
                detail: {
                    fetch: fetch(url,
                        {
                            method: event.detail.slug ? 'PUT' : 'CHAT',
                            ...Environment.fetchHeaders,
                            body: JSON.stringify(event.detail),
                            credentials: "include",
                            signal: this.abortController.signal
                        })
                        .then(response => {
                            if (response.status >= 200 && response.status <= 299) return response.json()
                            throw new Error(response.statusText)
                        })
                        .then(data => {
                            if (data.errors) throw data.errors
                            self.location.hash = `#/chats/${data.chat.slug}`
                            return data
                        })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'requestChat'
         *
         * @param {CustomEvent & {detail: RequestChatEventDetail}} event
         */
        this.requestChatListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = event.detail.slug || Environment.slug || ''
            const url = `${Environment.fetchBaseUrl}/chat/${slug}`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('chat', {
                /** @type {ChatEventDetail} */
                detail: {
                    slug,
                    fetch: fetch(url, {
                        signal: this.abortController.signal,
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    }).then(data => {
                        return data.chat
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'requestListChats'
         *
         * @param {CustomEvent & {detail: RequestListChatsEventDetail}} event
         */
        // @ts-ignore
        this.requestListChatsListener = event => {
            const url = `${Environment.fetchBaseUrl}/chat/users`
            // reset old AbortController and assign new one
            if (this.abortControllerList) this.abortControllerList.abort()
            this.abortControllerList = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('listChats', {
                /** @type {ListChatsEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        signal: this.abortControllerList.signal,
                        credentials: "include",
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    }).then(data => {
                        return data.users
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('publishChat', this.publishChatListener)
        // @ts-ignore
        this.addEventListener('requestListChats', this.requestListChatsListener)
        // @ts-ignore
        this.addEventListener('requestChat', this.requestChatListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('requestListChats', this.requestListChatsListener)
        // @ts-ignore
        this.removeEventListener('requestChat', this.requestChatListener)
    }
}
