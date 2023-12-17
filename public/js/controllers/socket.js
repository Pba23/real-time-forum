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
          console.log("POST");
          break;
        case 'comment':
          console.log("COMMENT");
          break;
        case 'status':
          const eventName = `status-${data.userID}`
          console.log(eventName);
          this.dispatchEvent(new CustomEvent(eventName, {
            detail: data.online,
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          break;
        case 'message':
          console.log("MESSAGE");
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

