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
          console.log("POST", data);
          const postEventName = `new-post`
          console.log(postEventName);
          this.dispatchEvent(new CustomEvent(postEventName, {
            detail: data.post,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'comment':
          console.log("COMMENT", data);
          const commentEventName = `comment-${data.postID}`
          console.log(commentEventName);
          this.dispatchEvent(new CustomEvent(commentEventName, {
            detail: data.comment,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'status':
          const statusEventName = `status-${data.userID}`
          console.log(statusEventName);
          this.dispatchEvent(new CustomEvent(statusEventName, {
            detail: data.online,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'message':
          console.log(data.message);
          const messageEventName = `message-${data.message.authorID}`
          console.log(messageEventName);
          this.dispatchEvent(new CustomEvent(messageEventName, {
            detail: data.message,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'typing':
          console.log("TYPING");
          break
      }
    };

    this.login = () => {
      console.log("login");
      this.socket.send(JSON.stringify({ type: 'login', data: { userID: Environment.auth.id } }));
    }

    this.logout = () => {
      console.log("logout");
      this.socket.send(JSON.stringify({ type: 'logout', data: { userID: Environment.auth.id } }));
      Environment.auth = null
      self.location.hash = '#/login'
    }
  }


  connectedCallback() {
    console.log("CONNECTED");
    this.addEventListener('ok-login', this.login)
    this.addEventListener('ok-logout', this.logout)
  }

  disconnectedCallback() {
    console.log("DISCONNECTED");
    this.removeEventListener('ok-login', this.login)
    this.removeEventListener('ok-logout', this.logout)
  }
}

