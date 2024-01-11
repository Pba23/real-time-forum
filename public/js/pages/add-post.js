// @ts-check

/* global HTMLElement */
/* global CustomEvent */

import { Environment } from '../lib/environment.js'

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Editor
 */
export default class AddPage extends HTMLElement {
  constructor() {
    super()

    this.publishListener = event => {
      event.preventDefault()
      const regex = /#\w+/g;

      const post = {
        imageUrl: "/uploads/banner.2.jpg",
        title: this.titleField?.value,
        description: this.descriptionField?.value,
        categories: this.categoriesField?.value.match(regex)?.map(tag => tag.slice(1)) || [],
      }

      this.dispatchEvent(new CustomEvent('publish-post', {
        detail: post,
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.postListener = event => event.detail.fetch.then().catch(error => (this.errorMessages = error))
  }

  connectedCallback() {
    if (!Environment.auth) {
      self.location.hash = '#/login'
    }
    document.body.addEventListener('get-post', this.postListener)
    this.render()
    this.postForm?.addEventListener('submit', this.publishListener)
  }

  disconnectedCallback() {
    this.postForm?.removeEventListener('submit', this.publishListener)
    document.body.removeEventListener('get-post', this.postListener)
  }

  /**
   * renders the Editor
   *
   * @return {void}
   */
  render() {
    this.innerHTML = /* html */`
      <div class="l-grid__item">
        <div class="card align--center justify--center f-height">
          <div class="card__header">
            <h2>Create a new Post</h2>
          </div>
          <div class="card__body px--32">
            <ul class="error-messages"></ul>
            <form id="register-form">
              <label for="title">Title:</label>
              <input placeholder="Enter your post title" type="text" id="title" name="title" required>
              <label for="description">Description:</label>
              <input placeholder="Enter your post description" type="text" id="description" name="description" required>
              <label for="categories">Categories:</label>
              <input placeholder="Enter your post categories separated by space and started with #" type="text" id="categories" name="categories" required>
              <button class="primary my--16" type="submit">Publish post</button>
            </form>
          </div>
        </div>
      </div>
    `
  }

  /**
   * @return {HTMLFormElement | null}
   */
  get postForm() {
    return this.querySelector('form')
  }

  /**
   * @return {HTMLInputElement | null}
   */
  get titleField() {
    return this.querySelector('input[name=title]')
  }

  /**
   * @return {HTMLInputElement | null}
   */
  get descriptionField() {
    return this.querySelector('input[name=description]')
  }

  /**
   * @return {HTMLInputElement | null}
   *
   */
  get categoriesField() {
    return this.querySelector('input[name=categories]')
  }

  set errorMessages(errors) {
    const ul = this.querySelector('.error-messages')
    if (ul && typeof errors === 'object') {
      ul.innerHTML = ''
      for (const key in errors) {
        const li = document.createElement('li')
        li.textContent = `${key}: ${errors[key].reduce((acc, curr) => `${acc}${acc ? ' | ' : ''}${curr}`, '')}`
        ul.appendChild(li)
      }
    }
  }
}
