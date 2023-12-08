// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */

/**
 *
 * @typedef {{ email: string, password: string }} loginUserEventDetail
 */

/**
 *
 * @typedef {{
      fetch: Promise<import("../lib/typing.js").AuthUser>
      updated?: Boolean
    }} UserEventDetail
 */

import { Environment } from '../lib/environment.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'user' on 'loginUser'
 * dispatches: 'user' on 'registerUser'
 * dispatches: 'user' on 'updateUser'
 * dispatches: 'user' on 'getUser'
 * dispatches: 'user' (reject) on 'logoutUser'
 * dispatches: 'profile' on 'getProfile'
 *
 * @export
 * @class User
 */
export default class User extends HTMLElement {
    constructor() {
        super()

        /**
         * Used to cancel ongoing, older fetches
         * this makes sense, if you only expect one and most recent true result and not multiple
         *
         * @type {AbortController | null}
         */
        this.abortController = this.abortControllerProfile = null

        this.registerUserListener = event => {
            if (!event.detail.user) return

            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/sign-up`
            // answer with event
            this.dispatchEvent(new CustomEvent('user', {
                /** @type {UserEventDetail} */
                detail: {
                    fetch: fetch(url,
                        {
                            method: 'POST',
                            ...Environment.fetchHeaders,
                            body: JSON.stringify(event.detail.user),
                            signal: this.abortController.signal
                        })
                        .then(response => {
                            if (response.status >= 200 && response.status <= 299) return response.json()
                            throw new Error(response.statusText)
                        })
                        .then(data => {
                            if (data.errors) throw data.errors
                            if (data.user) {
                                this.user = data.user
                                console.log(this.user);
                                // Environment.token = data.user.token
                            }
                            return data.user
                        })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        this.loginUserListener = event => {
            if (!event.detail.user) return

            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/sign-in`
            // answer with event
            this.dispatchEvent(new CustomEvent('user', {
                /** @type {UserEventDetail} */
                detail: {
                    fetch: fetch(url,
                        {
                            method: 'POST',
                            ...Environment.fetchHeaders,
                            body: JSON.stringify(event.detail.user),
                            signal: this.abortController.signal
                        })
                        .then(response => {
                            if (response.status >= 200 && response.status <= 299) return response.json()
                            throw new Error(response.statusText)
                        })
                        .then(data => {
                            if (data.errors) throw data.errors
                            if (data.user) {
                                this.user = data.user
                                console.log(this.user);
                                // Environment.token = data.user.token
                            }
                            return data.user
                        })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }

        this.getUserListener = event => {
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/me`
            // answer with event
            this.dispatchEvent(new CustomEvent('user', {
                /** @type {UserEventDetail} */
                detail: {
                    fetch: this.user ? Promise.resolve(this.user) : Environment.auth ? fetch(url,
                        {
                            method: 'GET',
                            credentials: 'include',
                            ...Environment.fetchHeaders,
                            signal: this.abortController.signal
                        })
                        .then(response => {
                            if (response.status >= 200 && response.status <= 299) return response.json()
                            throw new Error(response.statusText)
                        })
                        .then(data => {
                            if (data.user) {
                                this.user = data.user
                                Environment.auth = data.user
                            }
                            return data.user
                        })
                        .catch(error => {
                            if (error && typeof error.toString === 'function' && !error.toString().includes('aborted')) Environment.auth = ''
                            console.log(`Error@UserFetch: ${error}`)
                        }) : Promise.reject(new Error('No token found'))
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }
    }

    connectedCallback() {
        this.addEventListener('registerUser', this.registerUserListener)
        this.addEventListener('loginUser', this.loginUserListener)
        this.addEventListener('getUser', this.getUserListener)
    }

    disconnectedCallback() {
        this.removeEventListener('registerUser', this.registerUserListener)
        this.removeEventListener('loginUser', this.loginUserListener)
        this.removeEventListener('getUser', this.getUserListener)
    }
}
