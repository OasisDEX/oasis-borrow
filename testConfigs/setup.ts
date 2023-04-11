import { Jest } from '@jest/environment'

import { LocalStorage } from './mockLocalStorage'

const localStorageMock = (jest: Jest) => {
  if (localStorage === undefined) {
    localStorage = new LocalStorage(jest)
  }
  if (sessionStorage === undefined) {
    sessionStorage = new LocalStorage(jest)
  }
}

export default localStorageMock
