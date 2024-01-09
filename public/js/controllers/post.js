// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */
/* global self */

/**
 *
 * @typedef {{ slug?: string }} RequestPostEventDetail
 */

/**
 *
 * @typedef {{
      slug: RequestPostEventDetail,
      fetch: Promise<import("../lib/typing.js").EntirePost>
    }} PostEventDetail
 */

/**
 *
 * @typedef {{ tag?: string, author?: string, favorite?: string, limit?: number, offset?: number, showYourFeed?: boolean }} RequestListPostsEventDetail
 */

/**
 *
 * @typedef {{
  fetch: Promise<import("../lib/typing.js").PostItem[]>
}} ListPostsEventDetail
*/

import { Environment } from '../lib/environment.js'
import { dispatchCustomEvent } from '../lib/utils.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'post' on 'request-post'
 * dispatches: 'post' on 'postPost'
 * reroutes to home on 'deletePost'
 * dispatches: 'list-posts' on 'request-list-posts'
 *
 * @export
 * @class Post
 */
export default class Post extends HTMLElement {
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

        this.publishPostListener = event => {
            const url = `${Environment.fetchBaseUrl}/post`

            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            // answer with event
            dispatchCustomEvent(this, 'post-published', url,
                {
                    method: 'POST',
                    ...Environment.fetchHeaders,
                    body: JSON.stringify(event.detail),
                    credentials: "include",
                    signal: this.abortController.signal
                }, data => {
                    if (data.errors) throw data.errors
                    self.location.hash = `#/posts/${data.post.slug}`
                    return data
                })
        }

        /**
         * Listens to the event name/typeArg: 'request-post'
         *
         * @param {CustomEvent & {detail: RequestPostEventDetail}} event
         */
        this.requestPostListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const slug = event.detail.slug || Environment.slug || ''
            const url = `${Environment.fetchBaseUrl}/post/${slug}`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            dispatchCustomEvent(this, 'get-post', url, {
                signal: this.abortController.signal,
                ...Environment.fetchHeaders
            }, data => data.post)
        }

        /**
         * Listens to the event name/typeArg: 'request-list-posts'
         *
         * @param {CustomEvent & {detail: RequestListPostsEventDetail}} event
         */
        // @ts-ignore
        this.requestListPostsListener = event => {
            const url = `${Environment.fetchBaseUrl}/posts`
            // reset old AbortController and assign new one
            if (this.abortControllerList) this.abortControllerList.abort()
            this.abortControllerList = new AbortController()
            // answer with event
            dispatchCustomEvent(this, 'list-posts', url, {
                signal: this.abortControllerList.signal,
                ...Environment.fetchHeaders
            }, data => data.posts)
        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('publish-post', this.publishPostListener)
        // @ts-ignore
        this.addEventListener('request-list-posts', this.requestListPostsListener)
        // @ts-ignore
        this.addEventListener('request-post', this.requestPostListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('publish-post', this.publishPostListener)
        // @ts-ignore
        this.removeEventListener('request-list-posts', this.requestListPostsListener)
        // @ts-ignore
        this.removeEventListener('request-post', this.requestPostListener)
    }
}
