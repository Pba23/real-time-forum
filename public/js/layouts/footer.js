// @ts-check

/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 */
export default class Footer extends HTMLElement {
    connectedCallback() {
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
        <footer>
            Copyright made with <span class="heart">❤️</span> and ☕
        </footer>
    `
    }
}
