import { Environment } from '../lib/environment.js'

export default class SocketHandler extends HTMLElement {
  constructor() {
    super();
    this.socket = new WebSocket('ws://localhost:8085/ws');

    this.socket.onopen = () => {
      if (Environment.auth) {
        this.login()
      }
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'post':
          const postEventName = `new-post`
          this.dispatchEvent(new CustomEvent(postEventName, {
            detail: data.post,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'comment':
          const commentEventName = `comment-${data.postID}`
          this.dispatchEvent(new CustomEvent(commentEventName, {
            detail: data.comment,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'status':
          const statusEventName = `status-${data.userID}`
          this.dispatchEvent(new CustomEvent(statusEventName, {
            detail: data.online,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'message':
          const chatID = Environment.auth.id === data.message.authorID ? data.message.receiverID : data.message.authorID
          const messageEventName = `message-${chatID}-${Environment.auth.id}`
          this.dispatchEvent(new CustomEvent(messageEventName, {
            detail: data.message,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'typing':
          break
      }
    };

    this.login = () => {
      this.socket.send(JSON.stringify({ type: 'login', data: { userID: Environment.auth.id } }));
    }

    this.logout = () => {
      this.socket.send(JSON.stringify({ type: 'logout', data: { userID: Environment.auth.id } }));
      Environment.auth = null
      self.location.hash = '#/login'
    }
  }


  connectedCallback() {
    this.addEventListener('ok-login', this.login)
    this.addEventListener('ok-logout', this.logout)
  }

  disconnectedCallback() {
    this.removeEventListener('ok-login', this.login)
    this.removeEventListener('ok-logout', this.logout)
  }
}

