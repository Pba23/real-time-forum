// @ts-check
/* global HTMLElement */
/* global customElements */

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Home
 */
export default class Home extends HTMLElement {
    connectedCallback() {
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
        <main>
            <div class="l-grid__item aside f-height">
                <post-list></post-list>
            </div>
        </main>
      `
    }

    /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
    loadChildComponents() {
        return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
            import('../widgets/post-list.js').then(
                /** @returns {[string, CustomElementConstructor]} */
                module => ['post-list', module.default]
            ),
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
