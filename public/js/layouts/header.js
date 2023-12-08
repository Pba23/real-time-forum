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
            <a href="#/">
                <img class="logo" src="./img/logo.svg" draggable="false">
            </a>
            <div>
                <a href="#/login" class="btn primary not mr--8">Login</a>
                <a href="#/register" class="btn primary not">Register</a>
            </div>
        </header>`
    }
}
