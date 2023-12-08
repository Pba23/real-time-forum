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
    this._fetchBaseUrl = 'http://localhost:8080'

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
   * @return {string | null}
   */
  get auth() {
    return self.localStorage.getItem('auth')
  }

  /**
   * set JWT token
   *
   * @param {string} auth
   */
  set auth(auth) {
    if (auth && auth !== '') {
      self.localStorage.setItem('auth', auth)
    } else {
      self.localStorage.removeItem('auth')
    }
  }

  /**
   * get page slug
   */
  get slug() {
    const urlEnding = this.urlEnding
    if (urlEnding && urlEnding[0].match(/.*-[a-z0-9]{1,100}$/)) return urlEnding[0]
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
