import '@testing-library/jest-dom'
import '@inrupt/jest-jsdom-polyfills'

import { LocalStorage } from './mock-local-storage'

beforeEach(() => {
  localStorage = new LocalStorage()
  sessionStorage = new LocalStorage()
})
