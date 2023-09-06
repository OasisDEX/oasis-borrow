type Store = any

export class LocalStorage {
  store: Store
  constructor() {
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

  private _getItem = jest.fn((key: string) => this.store[key] || null)
  private _setItem = jest.fn((key: string, value: any) => {
    this.store[key] = value
  })
  private _removeItem = jest.fn((key: string) => {
    delete this.store[key]
  })

  private _clear = jest.fn(() => {
    Object.keys(this.store).map((key) => delete this.store[key])
  })

  private _toString = jest.fn(() => '[object Storage]')
  private _key = jest.fn((idx: number) => Object.keys(this.store)[idx] || null)
}
