import { expect } from 'chai'

import { replaceBasePathIfNeeded } from './useRedirect'

describe('Replace base path in the beginning of each path', () => {
  it('happy path', () => {
    const basePath = '/borrow'
    const path = '/borrow/new/path'

    expect(replaceBasePathIfNeeded(path, basePath)).to.be.eq('/new/path')
  })

  it('should not replace anything ', () => {
    const basePath = '/borrow'
    const path = '/new/path'

    expect(replaceBasePathIfNeeded(path, basePath)).to.be.eq('/new/path')
  })

  it('should not replace basePath like occurrence which is not in the beginning of the path', () => {
    const basePath = '/borrow'
    const path = '/borrow/new/path/borrow'

    expect(replaceBasePathIfNeeded(path, basePath)).to.be.eq('/new/path/borrow')
  })

  it('should default to "/" if the replaced path becomes empty', () => {
    const basePath = '/borrow'
    const path = '/borrow'

    expect(replaceBasePathIfNeeded(path, basePath)).to.be.eq('/')
  })
})
