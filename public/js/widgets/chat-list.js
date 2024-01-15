// @ts-check

/* global customElements */
/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 * this organism always renders new when connected to keep most recent and does not need shouldComponentRender
 *
 * @export
 * @class ListChatPreviews
 */
export default class ChatList extends HTMLElement {
  constructor() {
    super()

    /**
     * Listens to the event name/typeArg: 'list-chatting-users'
     *
     * @param {CustomEvent & {detail: import("../controllers/chat.js").ListChatsEventDetail}} event
     */
    this.listChatsListener = event => this.render(event.detail.fetch)

    this.chatListener = event => event.detail.fetch.then(data => {
      const chat = data.chat
      if (this.firstItem) {
        if (this.childComponentsPromise) {
          this.childComponentsPromise.then(children => {
            const chatItem = children[0][1]
            const chatItemElement = new chatItem(chat)
            // @ts-ignore
            this.insertBefore(chatItemElement, this.firstItem)
          });
        }
      } else {
        // @ts-ignore
        this.appendChild(this.createComment(chat))
      }
    })
  }

  connectedCallback() {
    // listen for Chats
    // @ts-ignore
    document.body.addEventListener('list-chatting-users', this.listChatsListener)
    // @ts-ignore
    document.body.addEventListener('chat', this.chatListener)
    this.dispatchEvent(new CustomEvent('request-chatting-users', {
      /** @type {import("../controllers/chat.js").RequestListChatsEventDetail} */
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback() {
    // @ts-ignore
    document.body.removeEventListener('chat', this.chatListener)
    // @ts-ignore
    document.body.removeEventListener('list-chatting-users', this.listChatsListener)
  }

  /**
   * renders each received Chat
   *
   * @param {Promise<import("../lib/typing.js").ChatItem[]>} fetchAllChats
   * @return {void}
   */
  render(fetchAllChats) {
    Promise.all([fetchAllChats, this.loadChildComponents()]).then(result => {
      const [chats, children] = result
      if (!chats || !chats.length) {
        this.innerHTML = '<div class="Chat-preview">No Chats are here... yet.</div>'
      } else {
        this.innerHTML = ''
        chats.forEach((c, i) => {
          /** @type {import("./chat-item.js").default & any} */
          // @ts-ignore
          const ChatItem = new children[0][1](c, i)
          this.appendChild(ChatItem)
        })
        if (!this.getAttribute('no-scroll')) this.scrollToEl(this)
      }
      // @ts-ignore
    }).catch(error => (this.innerHTML = console.warn(error) || (error && typeof error.toString === 'function' && error.toString().includes('aborted') ? '<div class="Chat-preview">Loading...</div>' : '<div class="Chat-preview">An error occurred fetching the Chats!</div>')))
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('./chat-item.js').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['chat-item', module.default]
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
    return this.querySelector('chat-item:nth-child(1)')
  }

  scrollToEl(el) {
    const rect = el.getBoundingClientRect()
    // check if the element is outside the viewport, otherwise don't scroll
    if (rect && rect.top < 0) el.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' })
  }
}
