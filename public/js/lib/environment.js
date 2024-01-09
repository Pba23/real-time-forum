// @ts-check

/* global self */
/* global location */

/**
 * This global Helper-Class holds all Environment relevant data
 *
 * @class EnvironmentClass
 */
class EnvironmentClass {
  constructor() {
    this._fetchBaseUrl = 'http://localhost:8085'
    document.addEventListener('DOMContentLoaded', () => {
      // Retrieve the ToastList element
    });
    this.toastWidget = document.querySelector('toast-list');
  }

  /**
   * get the fetchBaseUrl
   *
   * @return {string}
   */
  get fetchBaseUrl() {
    return this._fetchBaseUrl
  }

  /**
   * set the fetchBaseUrl
   *
   * @param {string} url
   */
  set fetchBaseUrl(url) {
    const link = document.createElement('link')
    link.setAttribute('rel', 'preconnect')
    link.setAttribute('href', this._fetchBaseUrl = url)
    document.head.appendChild(link)
  }

  /**
   * get fetch header
   *
   * @returns {{headers: {}}}
   */
  get fetchHeaders() {
    return {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }
  }


  /**
   * get JWT token
   *
   * @return {import("./typing").AuthUser | null}
   */
  get auth() {
    const auth = self.localStorage.getItem('auth')
    return auth ? JSON.parse(auth) : null
  }

  /**
   * set JWT token
   *
   * @param {import("./typing").AuthUser | null} auth
   */
  set auth(auth) {
    if (auth) {
      self.localStorage.setItem('auth', JSON.stringify(auth))
    } else {
      self.localStorage.removeItem('auth')
    }
  }

  /**
   * get page slug
   */
  get slug() {
    const urlEnding = this.urlEnding
    if (urlEnding && urlEnding[0].match(/[a-z0-9]{1,100}$/)) return urlEnding[0]
    return null
  }

  /**
   * get url ending
   */
  get urlEnding() {
    return location.hash.match(/[^/]+$/)
  }
}
// @ts-ignore
export const Environment = self.Environment = new EnvironmentClass()