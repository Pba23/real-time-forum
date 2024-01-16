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
        this.render()
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
                <div class="card__body flex--center flex--col spe">
                    <h1 class="mb--32">Welcome ${Environment.auth?.nickname}, <br/> to the ThunderForum! 👋</h1>
                    <p>
                        Connect with like-minded individuals, participate in discussions, <br/>
                        and experience real-time chat with other members.
                    </p>
                    <h2 class="mt--32 mb--24">Why join us?</h2>
                    <ul>
                        <li>🎤 Engage in meaningful discussions on various topics.</li>
                        <li>🗨️ Experience real-time chat for instant communication.</li>
                        <li>📰 Stay updated with the latest posts and comments.</li>
                    </ul>
                </div>
            </div>
        </div>
      `
    }
}
