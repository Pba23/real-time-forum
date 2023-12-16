// @ts-check
/* global HTMLElement */
/* global customElements */

import { Environment } from "../lib/environment.js"

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Home
 */
export default class Home extends HTMLElement {
    connectedCallback() {
        if (!Environment.auth) {
            self.location.hash = '#/login'
        }
        this.loadChildComponents()
        if (this.shouldComponentRender()) this.render()
    }

    /**
     * evaluates if a render is necessary
     *
     * @return {boolean}
     */
    shouldComponentRender() {
        return !this.innerHTML
    }

    /**
     * renders the footer
     *
     * @return {void}
     */
    render() {
        this.innerHTML = /* html */`
        <div class="l-grid__item">
            <div class="card f-height">
                <h1>Welcome</div>
            </div>
        </div>
      `
    }

    /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
    loadChildComponents() {
        return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
        ]).then(elements => {
            elements.forEach(element => {
                // don't define already existing customElements
                // @ts-ignore
                if (!customElements.get(element[0])) customElements.define(...element)
            })
            return elements
        }))
    }
}
