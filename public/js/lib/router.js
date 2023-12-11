// @ts-check

/** @typedef {{
      name: string,
      path: string,
      regExp: RegExp,
      authPage?: boolean
      component?: HTMLElement
    }} Route
 */

/* global self */
/* global HTMLElement */
/* global location */
/* global customElements */

/**
 * As a controller, this component becomes a router
 *
 * @export
 * @class Router
 */
export default class Router extends HTMLElement {
    constructor() {
        super()

        /** @type {Route[]} */
        this.routes = [
            // Home page (URL: /#/ )
            {
                name: 'p-home',
                path: '../pages/home.js',
                regExp: new RegExp(/^#\/$/),
                authPage: false,
            },
            // Sign in/Sign up pages (URL: /#/login, /#/register )
            {
                name: 'p-login',
                path: '../pages/login.js',
                regExp: new RegExp(/^#\/login/),
                authPage: true,
            },
            {
                name: 'p-register',
                path: '../pages/register.js',
                regExp: new RegExp(/^#\/register/),
                authPage: true,
            },
        ]

        this.previousRoute = this.routes[0]

        /**
         * Listens to hash changes and forwards the new hash to route
         */
        this.hashChangeListener = event => {
            this.previousRoute = this.route(location.hash, false, event.newURL === event.oldURL)
        }
    }

    connectedCallback() {
        self.addEventListener('hashchange', this.hashChangeListener)
        this.previousRoute = this.route(this.routes.some(route => route.regExp.test(location.hash)) ? location.hash : '#/', true)
    }

    disconnectedCallback() {
        self.removeEventListener('hashchange', this.hashChangeListener)
    }

    /**
     * route to the desired hash/domain
     *
     * @param {string} hash
     * @param {boolean} [replace = false]
     * @param {boolean} [isUrlEqual = true]
     * @return {Route}
     */
    route(hash, replace = false, isUrlEqual = true) {
        // escape on route call which is not set by hashchange event and trigger it here, if needed
        if (location.hash !== hash) {
            if (replace) location.replace(hash);
            return this.previousRoute
        }

        let route
        // find the correct route or do nothing
        if ((route = this.routes.find(route => route.regExp.test(hash)))) {
            if (route.authPage) {
                console.log('Event sent', route.authPage, this.previousRoute.authPage);
                this.dispatchEvent(new CustomEvent('authPage', {
                    detail: {
                        authPage: true,
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }));
            } else if (this.previousRoute.authPage) {
                this.dispatchEvent(new CustomEvent('authPage', {
                    detail: {
                        authPage: false,
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }));
            }
            // reuse route.component, if already set, otherwise import and define custom element
            // @ts-ignore
            (route.component ? Promise.resolve(route.component) : import(route.path).then(module => {
                // don't define already existing customElements
                if (!customElements.get(route.name)) customElements.define(route.name, module.default)
                // save it to route object for reuse. grab child if it already exists.
                return (route.component = this.children && this.children[0] && this.children[0].tagName === route.name.toUpperCase() ? this.children[0] : document.createElement(route.name))
            })).then(component => {
                if (this.shouldComponentRender(route.name, isUrlEqual)) this.render(component)
                // @ts-ignore
            }).catch(error => console.warn('Router did not find:', route) || error)
        }

        return route ? route : this.previousRoute
    }

    /**
     * evaluates if a render is necessary
     *
     * @param {string} name
     * @param {boolean} [isUrlEqual = true]
     * @return {boolean}
     */
    shouldComponentRender(name, isUrlEqual = true) {
        if (!this.children || !this.children.length) return true
        return !isUrlEqual || this.children[0].tagName !== name.toUpperCase()
    }

    /**
     * renders the page
     *
     * @param {HTMLElement} component
     * @return {void}
     */
    render(component) {
        // clear previous content
        this.innerHTML = ''
        this.appendChild(component)
    }
}
