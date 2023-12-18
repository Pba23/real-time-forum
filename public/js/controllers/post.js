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

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'post' on 'requestPost'
 * dispatches: 'post' on 'postPost'
 * reroutes to home on 'deletePost'
 * dispatches: 'listPosts' on 'requestListPosts'
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
            console.log("publishPostListener");

            // answer with event
            this.dispatchEvent(new CustomEvent('post-published', {
                detail: {
                    fetch: fetch(url,
                        {
                            method: 'POST',
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
                            self.location.hash = `#/posts/${data.post.slug}`
                            return data
                        })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'requestPost'
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
            this.dispatchEvent(new CustomEvent('post', {
                /** @type {PostEventDetail} */
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
                        return data.post
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        /**
         * Listens to the event name/typeArg: 'requestListPosts'
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
            this.dispatchEvent(new CustomEvent('listPosts', {
                /** @type {ListPostsEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        signal: this.abortControllerList.signal,
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    }).then(data => {
                        return data.posts
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
        this.addEventListener('publishPost', this.publishPostListener)
        // @ts-ignore
        this.addEventListener('requestListPosts', this.requestListPostsListener)
        // @ts-ignore
        this.addEventListener('requestPost', this.requestPostListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('requestListPosts', this.requestListPostsListener)
        // @ts-ignore
        this.removeEventListener('requestPost', this.requestPostListener)
    }
}
