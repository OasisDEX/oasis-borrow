import { Jest } from '@jest/environment'

type Store = any
export class LocalStorage {
  store: Store
  constructor(private jest: Jest) {
    this.store = {}
  }

  key(n: number) {
    return this._key(n)
  }

  getItem(key: string) {
    return this._getItem(key)
  }

  setItem(key: string, value: any) {
    return this._setItem(key, value)
  }

  removeItem(key: string) {
    return this._removeItem(key)
  }

  clear() {
    return this._clear()
  }

  toString() {
    return this._toString()
  }

  get length() {
    return Object.keys(this.store).length
  }

  private _getItem = this.jest.fn((key: string) => this.store[key] || null)
  private _setItem = this.jest.fn((key: string, value: any) => {
    this.store[key] = value
  })
  private _removeItem = this.jest.fn((key: string) => {
    delete this.store[key]
  })

  private _clear = this.jest.fn(() => {
    Object.keys(this.store).map((key) => delete this.store[key])
  })

  private _toString = this.jest.fn(() => '[object Storage]')
  private _key = this.jest.fn((idx: number) => Object.keys(this.store)[idx] || null)

  // get length() {
  //   return Object.keys(this).length
  // }
  // for backwards compatibility
  // get __STORE__() {
  //   return this
  // }
}
