// @ts-check
/* global HTMLElement */

import { Environment } from "../lib/environment.js"

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Header
 */
export default class Header extends HTMLElement {
    constructor() {
        super()

        /**
         * Listens to the event name/typeArg: 'user'
         *
         * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
         */
        this.userListener = event => {
            event.detail.fetch.then(user => {
                if (this.shouldComponentRender(user)) this.render(user)
                this.user = user
            }).catch(error => {
                console.log(`Error@UserFetch: ${error}`)
                // @ts-ignore
                if (this.shouldComponentRender(null)) this.render(null)
                this.user = null
            })
        }

        /**
         * Logs out the user and dispatches a 'logout' event.
         *
         */
        this.logoutUserListener = () => {
            this.dispatchEvent(new CustomEvent('logout', {
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }
    }

    connectedCallback() {
        this.user = undefined
        this.render(Environment.auth);

        // @ts-ignore
        document.body.addEventListener('user', this.userListener)
        this.dispatchEvent(new CustomEvent('get-user', {
            bubbles: true,
            cancelable: true,
            composed: true
        }))
    }

    disconnectedCallback() {
        // @ts-ignore
        document.body.removeEventListener('user', this.userListener)
    }

    /**
   * evaluates if a render is necessary
   *
   * @param {import("../lib/typing.js").AuthUser} user
   * @return {boolean}
   */
    shouldComponentRender(user) {
        return this.user !== user
    }

    /**
    * @return {HTMLButtonElement | null}
    */
    get button() {
        return this.querySelector('button#logout')
    }

    /**
     * renders the header within the body, which is in this case the navbar
     *
     * @param {import("../lib/typing.js").AuthUser | null} [user = undefined]
     * @return {void}
     */
    render(user) {
        this.innerHTML = /* html */`
        <header>
            <a href="#/">
                <img class="logo" src="./img/logo.svg" draggable="false">
            </a>
            <div>
                ${user ? /* html */`
                <a href="#/profile">Welcome, ${user.nickname}</a>
                <a href="#/add-post" class="btn small primary not mr--8">New Post</a>
                <button id="logout" class="primary small mr--8">Logout</button>
                `
                : /* html */`
                <a href="#/login" class="btn primary not mr--8">Login</a>
                <a href="#/register" class="btn primary not">Register</a>`
            }
            </div>
        </header>`
        if (this.button) {
            this.button.addEventListener('click', this.logoutUserListener);
        }
    }
}
