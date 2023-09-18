import { clone } from 'lodash'

export const cleanObjectToNull = (object: Record<string, any | any[]> | any) => {
  // this is used to replace everything in config to null, so its easy to change the values in localStorage
  let newObject = clone(object)
  if (object !== null) {
    switch (typeof newObject) {
      case 'object':
        if (newObject instanceof Array) {
          const length = newObject.length
          for (let i = 0; i < length; i++) {
            newObject[i] = cleanObjectToNull(newObject[i])
          }
        } else {
          Object.keys(newObject).forEach((key) => {
            newObject[key] = cleanObjectToNull(newObject[key])
          })
        }
        break
      default:
        newObject = null
        break
    }
  }
  return newObject
}

export const cleanObjectFromNull = (object: Record<string, any | any[]> | any) => {
  // this is used to replace everything null in config to undefined
  // so it doesnt overwrite the actual config (unless its not null, so changed)
  let newObject = clone(object)
  if (object !== null) {
    switch (typeof newObject) {
      case 'object':
        if (newObject === null) {
          newObject = undefined
        }
        if (newObject instanceof Array) {
          const length = newObject.length
          for (let i = 0; i < length; i++) {
            newObject[i] = cleanObjectFromNull(newObject[i])
          }
        } else {
          Object.keys(newObject).forEach((key) => {
            newObject[key] = cleanObjectFromNull(newObject[key])
          })
        }
        break
      default:
        newObject = undefined
        break
    }
  }
  return newObject
}
