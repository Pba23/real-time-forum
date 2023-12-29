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
            <label for="fileInput1" class="upload-area mb-1" id="customFileButton1">
                <span class="upload-area-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="340.531"
                        height="419.116" viewBox="0 0 340.531 419.116">
                        <g id="files-new" clip-path="url(#clip-files-new)">
                            <path id="Union_2" data-name="Union 2"
                                d="M-2904.708-8.885A39.292,39.292,0,0,1-2944-48.177V-388.708A39.292,39.292,0,0,1-2904.708-428h209.558a13.1,13.1,0,0,1,9.3,3.8l78.584,78.584a13.1,13.1,0,0,1,3.8,9.3V-48.177a39.292,39.292,0,0,1-39.292,39.292Zm-13.1-379.823V-48.177a13.1,13.1,0,0,0,13.1,13.1h261.947a13.1,13.1,0,0,0,13.1-13.1V-323.221h-52.39a26.2,26.2,0,0,1-26.194-26.195v-52.39h-196.46A13.1,13.1,0,0,0-2917.805-388.708Zm146.5,241.621a14.269,14.269,0,0,1-7.883-12.758v-19.113h-68.841c-7.869,0-7.87-47.619,0-47.619h68.842v-18.8a14.271,14.271,0,0,1,7.882-12.758,14.239,14.239,0,0,1,14.925,1.354l57.019,42.764c.242.185.328.485.555.671a13.9,13.9,0,0,1,2.751,3.292,14.57,14.57,0,0,1,.984,1.454,14.114,14.114,0,0,1,1.411,5.987,14.006,14.006,0,0,1-1.411,5.973,14.653,14.653,0,0,1-.984,1.468,13.9,13.9,0,0,1-2.751,3.293c-.228.2-.313.485-.555.671l-57.019,42.764a14.26,14.26,0,0,1-8.558,2.847A14.326,14.326,0,0,1-2771.3-147.087Z"
                                transform="translate(2944 428)" fill="var(--c-action-primary)" />
                        </g>
                    </svg>
                </span>
                <span class="upload-area-title" style="display: none;">
                    Drag file(s) here to upload.
                </span>
                <span class="upload-area-description" style="display: none;">
                    Alternatively, you can select a file by <strong>clicking</strong> on this area
                </span>
                <input type="file" id="fileInput1" style="display: none;" name="image">
            </label>

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
