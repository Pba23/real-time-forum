/**
 * Registration
 *
 * @typedef {{
      firstname: string,
      lastname: string,
      nickname: string,
      age: number,
      gender: string,
      email: string,
      password: string
    }} Registration
*/
/**
 * Login
 *
 * @typedef {{
      identifiant: string,
      password: string
    }} Login
*/

/**
 * User
 *
 * @typedef {{
      id: string,
      nickname: string,
      firstname: string,
      lastname: string,
      age: int,
      gender: string,
      is_logged_in: bool,
      email: string,
      avatar_url: string
    }} AuthUser
*/

/**
 * PostItem
 *
 * @typedef {{
    id: int,
    title: string,
    slug: string,
    authorName: string,
    imageURL: string,
    modifiedDate: string,
    numberOfComments: int,
    listOfCategories: string[]
 }} PostItem
 */

/**
 * ChatItem
 *
 * @typedef {{
      id: string
      nickname: string
      is_connected: bool
      last_message: string
      last_message_time: string
 }} ChatItem
 */

/**
 * EntirePost
 *
 * @typedef {{
    id: int,
    title: string,
    description: string,
    slug: string,
    authorName: string,
    imageURL: string,
    modifiedDate: string,
    numberOfComments: int,
    listOfCategories: string[]
 }} EntirePost
 */

/**
* CommentItem
*
* @typedef {{
      id: string,
      index: int,
      depth: string,
      text: string,
      authorID: string,
      authorName: string,
      authorAvatar: string,
      parentID: string,
      lastModifiedDate: string,
      nbrLikesComment: int,
      nbrDislikesComment: int,
   }} CommentItem
*/

/**
* MessageItem
*
* @typedef {{
      id: string,
      text: string,
      senderID: string,
      senderName: string,
      senderAvatar: string,
      receiverID: string,
      lastModifiedDate: string,
   }} MessageItem
*/
/**
* AddComment
*
* @typedef {{
      text: string,
      postID: string,
      authorID: string
   }} AddComment
*/

/**
* AddMessage
*
* @typedef {{
      text: string,
      receiverID: string,
      authorID: string
   }} AddMessage
*/
/**
 * MultipleComments
 *
 * @typedef {{
      comments: CommentItem[]
    }} MultipleComments
 */
/**
 * MultipleMessages
 *
 * @typedef {{
      messages: MessageItem[]
    }} MultipleMessages
 */
// the line below is a workaround to fix 'is not a module' import error, it seems as it is needed to be recognized by JSDoc types
export class IgnoreMe { }