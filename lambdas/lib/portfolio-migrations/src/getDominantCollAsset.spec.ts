import { MigrationAsset } from 'shared/domain-types'
import { getDominantCollAsset } from './getDominantCollAsset'

describe('getDominantCollAsset', () => {
  it('should not find dominant asset', () => {
    const assets: MigrationAsset[] = [
      { usdValue: 99 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      // Add more items as needed
    ] as any
    const result = getDominantCollAsset(assets)
    expect(result).toBe(undefined)
  })

  it('should not find dominant asset', () => {
    const assets: MigrationAsset[] = [] as any
    const result = getDominantCollAsset(assets)
    expect(result).toBe(undefined)
  })

  it('should find dominant asset', () => {
    const assets: MigrationAsset[] = [
      { usdValue: 100 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      // Add more items as needed
    ] as any
    const result = getDominantCollAsset(assets)
    expect(result?.usdValue).toBe(100)
  })
})
