import { clone } from 'lodash'

export const cleanObjectToNull = (object: any) => {
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

export const cleanObjectFromNull = (obj: any) => {
  // this is used to remove all null values from config
  const newObj = clone(obj)
  Object.keys(newObj).forEach((key) => {
    if (newObj[key] && typeof newObj[key] === 'object') {
      newObj[key] = cleanObjectFromNull(newObj[key])
    } else if (newObj[key] === null) {
      delete newObj[key]
    }
  })
  return newObj
}
