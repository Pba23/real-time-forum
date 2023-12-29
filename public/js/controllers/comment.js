// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */

/**
 *
 * @typedef {{ slug?: string, body: string }} AddCommentsEventDetail
 */

/**
 *
 * @typedef {{
  fetch: Promise<import("../lib/typing.js").CommentItem>
}} CommentEventDetail
*/

/**
 *
 * @typedef {{ slug?: string }} GetCommentsEventDetail
 */

/**
 *
 * @typedef {{
      fetch: Promise<import("../lib/typing.js").MultipleComments>
    }} CommentsEventDetail
 */

/**
 *
 * @typedef {{ slug?: string, id: string }} DeleteCommentEventDetail
 */

import { Environment } from '../lib/environment.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'comment' on 'add-comment'
 * dispatches: 'list-comments' on 'get-comments'
 * does nothing on 'deleteComment'
 *
 * @export
 * @class Comments
 */
export default class Comments extends HTMLElement {
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
         * Listens to the event name/typeArg: 'add-comment'
         *
         * @param {CustomEvent & {detail: AddCommentsEventDetail}} event
         */
        this.addCommentListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const postID = event.detail.comment.postID
            const url = `${Environment.fetchBaseUrl}/comment/${postID}`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('comment', {
                /** @type {CommentEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        method: 'POST',
                        body: JSON.stringify(event.detail.comment),
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
         * Listens to the event name/typeArg: 'get-comments'
         *
         * @param {CustomEvent & {detail: GetCommentsEventDetail}} event
         */
        this.getCommentsListener = event => {
            // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
            const postID = event.detail.postID
            const url = `${Environment.fetchBaseUrl}/comments/${postID}`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('list-comments', {
                /** @type {CommentsEventDetail} */
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
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('add-comment', this.addCommentListener)
        // @ts-ignore
        this.addEventListener('get-comments', this.getCommentsListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('add-comment', this.addCommentListener)
        // @ts-ignore
        this.removeEventListener('get-comments', this.getCommentsListener)
    }
}
