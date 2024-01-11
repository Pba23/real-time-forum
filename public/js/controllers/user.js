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
import { dispatchCustomEvent } from '../lib/utils.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'user' on 'login'
 * dispatches: 'user' on 'sign-up'
 * dispatches: 'user' on 'updateUser'
 * dispatches: 'user' on 'get-user'
 * dispatches: 'user' (reject) on 'logout'
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
            let finishCallback = data => {
                if (data.errors) throw data.errors
                if (data.user) {
                    this.user = data.user
                    Environment.auth = data.user;
                    document.dispatchEvent(new CustomEvent('ok-login', {
                        detail: {},
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    }))
                }
                return data.user
            }

            finishCallback = finishCallback.bind(this)
            // answer with event
            dispatchCustomEvent(this, 'user', url,
                {
                    method: 'POST',
                    ...Environment.fetchHeaders,
                    body: JSON.stringify(event.detail.user),
                    signal: this.abortController.signal
                }, finishCallback)
        }

        this.loginUserListener = event => {
            if (!event.detail.user) return

            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/sign-in`
            let finishCallback = data => {
                if (data.errors) throw data.errors
                if (data.user) {
                    this.user = data.user
                    Environment.auth = data.user;
                    this.dispatchEvent(new CustomEvent('ok-login', {
                        detail: {},
                        bubbles: true,
                        cancelable: true,
                        composed: true
                    }))
                }
                return data.user
            }

            finishCallback = finishCallback.bind(this)
            // answer with event
            dispatchCustomEvent(this, 'user', url,
                {
                    method: 'POST',
                    ...Environment.fetchHeaders,
                    body: JSON.stringify(event.detail.user),
                    signal: this.abortController.signal
                }, finishCallback)
        }

        this.getUserListener = event => {
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/me`
            let finishCallback = data => {
                if (data.user) {
                    this.user = data.user
                    Environment.auth = data.user
                }
                return data.user
            }

            finishCallback = finishCallback.bind(this)
            const errorCallback = error => {
                if (error && typeof error.toString === 'function' && !error.toString().includes('aborted')) Environment.auth = null
                console.log(`Error@UserFetch: ${error}`)
            }

            if (this.user) {
                this.dispatchEvent(new CustomEvent('user', {
                    detail: {
                        fetch: Promise.resolve(this.user)
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                }))
            } else if (Environment.auth) {
                // answer with event
                dispatchCustomEvent(this, 'user', url,
                    {
                        method: 'GET',
                        credentials: 'include',
                        ...Environment.fetchHeaders,
                        signal: this.abortController.signal
                    }, finishCallback, errorCallback)
            } else {
                Promise.reject(new Error('No token found'))
            }
        }

        this.logoutUserListener = event => {
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()

            const url = `${Environment.fetchBaseUrl}/logout`
            let finishCallback = data => {
                this.dispatchEvent(new CustomEvent('ok-logout', {
                    detail: {},
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
                this.user = undefined
            }
            const errorCallback = error => {
                if (error && typeof error.toString === 'function' && !error.toString().includes('aborted')) Environment.auth = null
                console.log(`Error@UserFetch: ${error}`)
            }

            finishCallback = finishCallback.bind(this)
            // answer with event
            dispatchCustomEvent(this, 'user', url,
                {
                    method: 'DELETE',
                    credentials: 'include',
                    ...Environment.fetchHeaders,
                    signal: this.abortController.signal
                }, finishCallback, errorCallback)
        }
    }

    connectedCallback() {
        this.addEventListener('sign-up', this.registerUserListener)
        this.addEventListener('login', this.loginUserListener)
        this.addEventListener('logout', this.logoutUserListener)
        this.addEventListener('get-user', this.getUserListener)
    }

    disconnectedCallback() {
        this.removeEventListener('sign-up', this.registerUserListener)
        this.removeEventListener('login', this.loginUserListener)
        this.removeEventListener('logout', this.logoutUserListener)
        this.removeEventListener('get-user', this.getUserListener)
    }
}
