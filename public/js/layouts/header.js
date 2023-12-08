// @ts-check

/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 */
export default class Header extends HTMLElement {
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
        <header>
            <img class="logo" src="./img/logo.svg" draggable="false">
            <div>
                <button class="primary mr--8">Login</button>
                <button class="primary">Register</button>
            </div>
        </header>`
    }
}
