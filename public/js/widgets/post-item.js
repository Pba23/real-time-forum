// @ts-check

/* global customElements */
/* global HTMLElement */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class PostPreview
 */
export default class PostPreview extends HTMLElement {
    /**
     * customDefine
     *
     * @param {import("../lib/typing.js").PostItem | null} [post = null]
     */
    constructor(post = null) {
        super()

        // allow innerHTML PostPreview with post as a string attribute
        this.post = post || JSON.parse((this.getAttribute('post') || '').replace(/'/g, '"') || '{}')
    }

    connectedCallback() {
        if (this.shouldComponentRender()) this.render(this.post)
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
     * renders the post
     *
     * @param {import("../lib/typing.js").PostItem} [post = this.post]
     * @return {void | string}
     */
    render(post = this.post) {
        if (post == undefined || post == null) {
            this.innerHTML = `<div class="Post-preview">No Post is here... yet.</div>`
            return
        }
        this.innerHTML = /* html */`
        <div class="card item">
            <div class="card__body">
                <div class="display--flex flex--col f-width">
                    <h4 class="mr--16"><a class="not" href="#/post/${post.slug}">${post.title}</a></h4>
                    <div class="display--flex f-width justify--space-between mb--8">
                        <span class="text--small text--gray">${post.modifiedDate}</span>
                        <a href="#">${post.authorName}</a>
                    </div>
                    <div class="display--flex f-width justify--space-between">
                        ${post.listOfCategories.split("#").reduce((tagListStr, tag) =>
                    tagListStr += /* html */`<a href="#/tag/${tag}">#${tag}</a>`, '')}
                    </div>
                </div>
            </div>
        </div>`
    }
}
