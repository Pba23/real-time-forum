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
      firstname: string,
      lastname: string,
      nickname: string,
      age: number,
      gender: string,
      email: string
    }} User
*/

// the line below is a workaround to fix 'is not a module' import error, it seems as it is needed to be recognized by JSDoc types
export class IgnoreMe { }