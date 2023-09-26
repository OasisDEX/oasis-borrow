import '@testing-library/jest-dom'

import { LocalStorage } from './mock-local-storage'

beforeEach(() => {
  localStorage = new LocalStorage()
  sessionStorage = new LocalStorage()
})
