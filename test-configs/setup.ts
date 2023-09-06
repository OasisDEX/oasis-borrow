/* eslint-disable no-global-assign */
import { LocalStorage } from 'test-configs/mock-local-storage'

import '@testing-library/jest-dom'

beforeEach(() => {
  localStorage = new LocalStorage()
  sessionStorage = new LocalStorage()
})
