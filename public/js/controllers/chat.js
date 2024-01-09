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
import { dispatchCustomEvent } from '../lib/utils.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'chat' on 'request-chat-infos'
 * dispatches: 'chat' on 'chatChat'
 * reroutes to home on 'deleteChat'
 * dispatches: 'list-chatting-users' on 'request-chatting-users'
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

        /**
         * Listens to the event name/typeArg: 'request-chat-infos'
         *
         * @param {CustomEvent & {detail: RequestChatEventDetail}} event
         */
        this.requestChatListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = event.detail.slug || Environment.slug || ''
            const url = `${Environment.fetchBaseUrl}/chat/user/${slug}`

            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            dispatchCustomEvent(this, 'chat-load', url, {
                signal: this.abortController.signal,
                credentials: "include",
                ...Environment.fetchHeaders
            })
        }

        /**
         * Listens to the event name/typeArg: 'request-chatting-users'
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
            dispatchCustomEvent(this, 'list-chatting-users', url, {
                signal: this.abortControllerList.signal,
                credentials: "include",
                ...Environment.fetchHeaders
            }, data => data.users)

        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('request-chatting-users', this.requestListChatsListener)
        // @ts-ignore
        this.addEventListener('request-chat-infos', this.requestChatListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('request-chatting-users', this.requestListChatsListener)
        // @ts-ignore
        this.removeEventListener('request-chat-infos', this.requestChatListener)
    }
}
