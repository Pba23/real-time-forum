// @ts-check

/* global HTMLElement */
/* global customElements */
/* global CustomEvent */
/* global self */

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Chat
 */
export default class Chat extends HTMLElement {

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
    }


    /**
     * renders the post
     *
     * @return {void}
     */
    // @ts-ignore
    render() {
        this.innerHTML = /* html */`<h1>Chat</h1>`

    }
}
