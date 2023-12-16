import { Environment } from '../lib/environment.js'

export default class SocketHandler extends HTMLElement {
  constructor() {
    super();
    this.socket = new WebSocket('ws://localhost:8080/ws');

    this.socket.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case 'post':
          console.log("POST");
          break;
        case 'comment':
          console.log("COMMENT");
          break;
        case 'status':
          console.log("STATUS");
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
      this.socket = new WebSocket('ws://localhost:8080/ws');
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

