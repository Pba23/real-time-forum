import { Environment } from "./environment.js";


/**
 * Dispatches a custom event with the specified name, URL, and details.
 *
 * @param {string} eventName - The name of the custom event.
 * @param {string} url - The URL to fetch data from.
 * @param {object} details - Additional details for the custom event.
 * @param {function} [finishCallback=null] - An optional callback function to be called when the fetch is successful.
 * @param {function} [errorCallback=null] - An optional callback function to be called when an error occurs during the fetch.
 * @return {Promise} A promise that resolves with the response from the fetch request, or rejects with an error.
 */
export function dispatchCustomEvent(self, eventName, url, details, finishCallback = null, errorCallback = null) {
    self.dispatchEvent(new CustomEvent(eventName, {
        detail: {
            fetch: fetch(url, details)
                .catch(error => {
                    console.log(errorCallback);
                    if (errorCallback) return errorCallback(error)
                    throw error
                })
                .then(async response => {
                    if (response.status >= 200 && response.status <= 299) return response.json()
                    const errorMsg = (await response.json()).errors;
                    Environment.toastWidget.showToast(errorMsg, 'error')
                    throw new Error(response.statusText)
                })
                .then(response => {
                    if (finishCallback) return finishCallback(response)
                    return response
                })
        },
        bubbles: true,
        cancelable: true,
        composed: true,
    }));
}

/**
 * Throttle function that ensures a function is only called at most once in a specified amount of time.
 * @param {Function} func - The function to throttle.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The throttled function.
 */
export function throttle(func, delay) {
    let lastCall = 0;

    return function (...args) {
        const now = Date.now();

        if (now - lastCall >= delay) {
            func(...args);
            lastCall = now;
        }
    };
}
