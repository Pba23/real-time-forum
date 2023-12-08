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