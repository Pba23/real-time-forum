// @ts-check
/* global HTMLElement */
/* global customElements */

import { Environment } from "../lib/environment.js"

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Page404
 */
export default class Page404 extends HTMLElement {
  connectedCallback() {
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
                  <h1 class="big mb--32">404 😭</h1>
                  <img class="logo" src="./img/logo.svg" draggable="false">
                  <h2 class="mb--8">
                    The resource you are looking for could not be found.
                  </h2>
                  <h2 class="mb--8">Back to <a href="#/">home</a>.</h2>
                </div>
            </div>
        </div>
      `
  }
}
