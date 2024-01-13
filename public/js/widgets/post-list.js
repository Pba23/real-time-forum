// @ts-check

/* global customElements */
/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 * this organism always renders new when connected to keep most recent and does not need shouldComponentRender
 *
 * @export
 * @class ListPostPreviews
 */
export default class PostList extends HTMLElement {
  constructor() {
    super()

    /**
     * Listens to the event name/typeArg: 'list-posts'
     *
     * @param {CustomEvent & {detail: import("../controllers/post.js").ListPostsEventDetail}} event
     */
    this.listPostsListener = event => this.render(event.detail.fetch)

    this.postListener = event => event.detail.fetch.then(data => {
      const post = data.post
      this.addNewPost(post);
    })
  }

  addNewPost(post) {
    console.log(post);
    if (this.childComponentsPromise) {
      this.childComponentsPromise.then(children => {
        const postItem = children[0][1];
        const postItemElement = new postItem(post);
        // @ts-ignore
        if (this.firstItem) {
          this.insertBefore(postItemElement, this.firstItem);
        } else {
          // @ts-ignore
          this.appendChild(postItemElement);
        }
      });
    }
  }

  connectedCallback() {
    // listen for Posts
    // @ts-ignore
    document.body.addEventListener('list-posts', this.listPostsListener)
    // @ts-ignore
    document.body.addEventListener('new-post', event => this.addNewPost(event.detail))
    // @ts-ignore
    document.body.addEventListener('post-published', this.postListener)
    this.dispatchEvent(new CustomEvent('request-list-posts', {
      /** @type {import("../controllers/post.js").RequestListPostsEventDetail} */
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback() {
    // @ts-ignore
    document.body.removeEventListener('get-post', this.postListener)
    // @ts-ignore
    document.body.removeEventListener('list-posts', this.listPostsListener)
  }

  /**
   * renders each received Post
   *
   * @param {Promise<import("../lib/typing.js").PostItem[]>} fetchAllPosts
   * @return {void}
   */
  render(fetchAllPosts) {
    Promise.all([fetchAllPosts, this.loadChildComponents()]).then(result => {
      const [posts, children] = result
      if (!posts || !posts.length) {
        this.innerHTML = '<div class="Post-preview">No Posts are here... yet.</div>'
      } else {
        this.innerHTML = ''
        posts.forEach(p => {
          /** @type {import("./post-item.js").default & any} */
          // @ts-ignore
          const PostPreview = new children[0][1](p)
          this.appendChild(PostPreview)
        })
        if (!this.getAttribute('no-scroll')) this.scrollToEl(this)
      }
      // @ts-ignore
    }).catch(error => (this.innerHTML = console.warn(error) || (error && typeof error.toString === 'function' && error.toString().includes('aborted') ? '<div class="Post-preview">Loading...</div>' : '<div class="Post-preview">An error occurred fetching the Posts!</div>')))
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('./post-item.js').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['post-item', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  /**
* returns the first card element
*
* @readonly
* @return {HTMLElement | null}
*/
  get firstItem() {
    return this.querySelector('post-item:nth-child(1)')
  }

  scrollToEl(el) {
    const rect = el.getBoundingClientRect()
    // check if the element is outside the viewport, otherwise don't scroll
    if (rect && rect.top < 0) el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' })
  }
}
