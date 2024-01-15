// @ts-check
import { Environment } from "../lib/environment.js"

/* global customElements */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class ChatPreview
 */
export default class ChatPreview extends HTMLElement {
  /**
   * customDefine
   *
   * @param {import("../lib/typing.js").ChatItem | null} [chat = null]
   */
  constructor(chat = null, index = 0) {
    super()

    // allow innerHTML ChatPreview with chat as a string attribute
    this.chat = chat || JSON.parse((this.getAttribute('chat') || '').replace(/'/g, '"') || '{}')
    this.index = `${index + 1}`
    this.updateStatus = (event) => {
      this.chat.is_connected = event.detail
      this.render(this.chat)
    }

    this.updateLastMessage = (event) => {
      this.chat.last_message = event.detail.text
      this.chat.last_message_time = event.detail.createDate
      if (this.cardItem && this.cardItems && this.cardItemLastMessage && this.cardItemLastMessageDate) {
        this.index = `1`
        this.style.order = this.index
        this.cardItems.forEach(cardItem => {
          // @ts-ignore
          console.log(cardItem.style.order);
          // @ts-ignore
          console.log(parseInt(cardItem.style.order) + 1);
          // @ts-ignore
          cardItem.style.order = `${parseInt(cardItem.style.order) + 1}`
        })
        this.cardItemLastMessage.innerText = this.chat.last_message
        this.cardItemLastMessageDate.innerText = this.chat.last_message_time
      }
      // this.render(this.chat)
    }
  }

  connectedCallback() {
    if (this.shouldComponentRender()) this.render(this.chat)
    const statusEventName = 'status-' + this.chat.id
    document.body.addEventListener(statusEventName, this.updateStatus)
    const messageEventName = 'message-' + this.chat.id + '-' + Environment.auth?.id
    document.body.addEventListener(messageEventName, this.updateLastMessage)
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
   * renders the chat
   *
   * @param {import("../lib/typing.js").ChatItem} [chat = this.chat]
   * @return {void | string}
   */
  render(chat = this.chat) {
    if (chat == undefined || chat == null) {
      this.innerHTML = `<div class="Chat-preview">No Chat is here... yet.</div>`
      return
    }
    this.style.order = `${this.index + 1}`
    this.innerHTML = /* html */`
      <div class="card item">
          <div class="card__body">
              <div class="display--flex flex--col f-width">
                  <h4 class="mr--16"><a class="not" href="#/chat/${chat.id}">${chat.nickname} ${chat.is_connected ? '🟢' : '🔴'}</a></h4>
                  <div class="display--flex f-width justify--space-between mb--8">
                      <span class="last-msg text--small text--gray">${chat.last_message ? chat.last_message : 'No messages'}</span>
                      <span class="last-msg-date text--small text--gray">${chat.last_message_time}</span>
                  </div>
              </div>
          </div>
      </div>`
  }

  /**
  *
  * @readonly
  * @return {HTMLElement | null}
  */
  get cardItem() {
    return this.querySelector('.card.item')
  }

  /**
  *
  * @readonly
  * @return {HTMLElement | null}
  */
  get cardItemLastMessage() {
    return this.querySelector('.card.item .last-msg')
  }

  /**
  *
  * @readonly
  * @return {HTMLElement | null}
  */
  get cardItemLastMessageDate() {
    return this.querySelector('.card.item .last-msg-date')
  }

  /**
  *
  * @readonly
  * @return {NodeListOf<Element>}
  */
  get cardItems() {
    return document.querySelectorAll('chat-item')
  }
}
