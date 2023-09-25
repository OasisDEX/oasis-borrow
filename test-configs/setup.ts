import '@testing-library/jest-dom'
import '@inrupt/jest-jsdom-polyfills' // Some libraries are using certain parts of the Web API that do not appear in jsdom (which is used in the Jest framework).

import { LocalStorage } from './mock-local-storage'

beforeEach(() => {
  localStorage = new LocalStorage()
  sessionStorage = new LocalStorage()
})
