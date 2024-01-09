// @ts-check

/* global customElements */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class PostPreview
 */
export default class ToastList extends HTMLElement {
    /**
     * customDefine
     *
     */
    constructor() {
        super()
    }

    connectedCallback() {
        if (this.shouldComponentRender()) this.render()
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
     * Displays a toast message
     * @param {string} message - The message to display in the toast
     * @param {string} type - The type of toast (e.g., 'info', 'success', 'error')
     */
    showToast(message, type = 'info') {
        if (!this.toastContainer) return

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 300);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000); // Adjust the duration as needed
    }

    /**
    * returns the toast container
    *
    * @readonly
    * @return {HTMLElement | null}
    */
    get toastContainer() {
        return this.querySelector('#toast-container')
    }

    /**
     * renders the post
     *
     * @return {void | string}
     */
    render() {
        this.innerHTML = /* html */`<div id="toast-container" class="toast-container"></div>`
    }
}
