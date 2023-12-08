// @ts-check

/* global HTMLElement */
/* global customElements */

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Register
 */
export default class Register extends HTMLElement {
    constructor() {
        super()

        this.submitListener = (e) => {
            if (this.registerForm?.checkValidity()) {
                e.preventDefault();

                this.dispatchEvent(new CustomEvent('registerUser', {
                    detail: {
                        /** @type {import("../lib/typing.js").Registration} */
                        user: {
                            nickname: (this.nicknameField) ? this.nicknameField.value : "",
                            firstname: (this.firstnameField) ? this.firstnameField.value : "",
                            lastname: (this.lastnameField) ? this.lastnameField.value : "",
                            age: (this.ageField) ? Number(this.ageField.value) : 0,
                            email: (this.emailField) ? this.emailField.value : "",
                            password: (this.passwordField) ? this.passwordField.value : "",
                            gender: (this.genderField) ? this.genderField.value : "male"
                        }
                    },
                    bubbles: true,
                    cancelable: true,
                    composed: true
                }))
            }
        }

        /**
         * Listens to the event name/typeArg: 'user'
         *
         * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
         */
        this.userListener = event => {
            console.log("User", event.detail);
            // @ts-ignore
            event.detail.fetch
                .then(user => (self.location.hash = '#/'))
                .catch(error => (this.errorMessages = error))
        }

    }

    connectedCallback() {
        if (this.shouldComponentRender()) this.render()
        this.registerForm?.addEventListener('submit', this.submitListener)
        // @ts-ignore
        document.body.addEventListener('user', this.userListener)
    }

    disconnectedCallback() {
        this.registerForm?.removeEventListener('submit', this.submitListener)
        // @ts-ignore
        document.body.removeEventListener('user', this.userListener)
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
     * renders the footer
     *
     * @return {void}
     */
    render() {
        this.innerHTML = /* html */`
        <main>
        <div class="l-grid__item aside f-height">
            <div class="card f-height mb--0">
                <div class="card__body p--32 text--center">
                    <h2 class="mb--24">🚀 Join the Real-Time Forum Community!</h2>
                    <p>
                        Connect with like-minded individuals, participate in discussions, and experience real-time chat
                        with other members.
                    </p>
                    <h2 class="mt--32 mb--24">Why join us?</h2>
                    <ul>
                        <li>🎤 Engage in meaningful discussions on various topics.</li>
                        <li>🗨️ Experience real-time chat for instant communication.</li>
                        <li>📰 Stay updated with the latest posts and comments.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="l-grid__item">
            <div class="card align--center justify--center f-height">
                <div class="card__header">
                    <h2>Login to Your Account</h2>
                </div>
                <div class="card__body px--32">
                    <ul class="error-messages"></ul>
                    <form id="register-form">
                        <div class="group">
                            <div class="item">
                                <label for="firstname">Firstname:</label>
                                <input placeholder="Enter your firstname" type="text" id="firstname" name="firstname"
                                    required>
                            </div>
                            <div class="item">
                                <label for="lastname">Lastname:</label>
                                <input placeholder="Enter your lastname" type="text" id="lastname" name="lastname"
                                    required>
                            </div>
                        </div>
                        <div class="group">
                            <div class="item">
                                <label for="nickname">Nickname:</label>
                                <input placeholder="Enter your nickname" type="text" id="nickname" name="nickname"
                                    required>
                            </div>
                            <div class="item">
                                <label for="email">Email:</label>
                                <input placeholder="Enter your email" type="email" id="email" name="email"
                                    required>
                            </div>
                        </div>
                        <div class="group">
                            <div class="item">
                                <label for="age">Age:</label>
                                <input placeholder="Enter your agee" type="number" id="age" name="age"
                                    required>
                            </div>
                            <div class="item radio">
                                <input id="male" name="gender" value="male" type="radio">
                                <label  for="male">Male</label>
                            </div>
                            <div class="item radio">
                                <input id="female" name="gender" value="female" type="radio">
                                <label  for="female">Female</label>
                            </div>
                        </div>
                        <label for="password">Password:</label>
                        <input placeholder="Enter your password" type="password" id="password" name="password" required>

                        <button class="primary my--16" type="submit">Login</button>
                    </form>

                    <p class="ml--16">Already have an account? <a href="#/login">Sign in here</a></p>
                </div>
            </div>
        </div>
        </main>
      `
    }

    /**
     * @return {HTMLFormElement | null}
     */
    get registerForm() {
        return this.querySelector('form')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get firstnameField() {
        return this.querySelector('input[name="firstname"]')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get lastnameField() {
        return this.querySelector('input[name="lastname"]')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get ageField() {
        return this.querySelector('input[name="age"]')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get genderField() {
        return this.querySelector('input[name="gender"]:checked');
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get nicknameField() {
        return this.querySelector('input[name="nickname"]')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get emailField() {
        return this.querySelector('input[name="email"]')
    }

    /**
     * @return {HTMLInputElement | null}
     */
    get passwordField() {
        return document.querySelector('input[name="password"]')
    }

    get errorMessages() {
        return this.querySelector('.error-messages')
    }

    set errorMessages(errors) {
        const ul = this.querySelector('.error-messages')
        if (ul && typeof errors === 'object') {
            ul.innerHTML = ''
            for (const key in errors) {
                const li = document.createElement('li')
                li.textContent = `${key}: ${errors[key].reduce((acc, curr) => `${acc}${acc ? ' | ' : ''}${curr}`, '')}`
                ul.appendChild(li)
            }
        }
    }
}
