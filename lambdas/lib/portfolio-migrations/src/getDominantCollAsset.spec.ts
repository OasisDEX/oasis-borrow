import { PortfolioMigrationAsset } from 'shared/domain-types'
import { getDominantCollAsset } from './getDominantCollAsset'

describe('getDominantCollAsset', () => {
  it('should not find dominant asset', () => {
    const assets: Pick<PortfolioMigrationAsset, 'usdValue'>[] = [
      { usdValue: 99 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      // Add more items as needed
    ]
    const result = getDominantCollAsset(assets as PortfolioMigrationAsset[])
    expect(result).toBe(undefined)
  })

  it('should not find dominant asset', () => {
    const assets: PortfolioMigrationAsset[] = [] as any
    const result = getDominantCollAsset(assets)
    expect(result).toBe(undefined)
  })

  it('should find dominant asset', () => {
    const assets: Pick<PortfolioMigrationAsset, 'usdValue'>[] = [
      { usdValue: 100 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      { usdValue: 1 /* other properties */ },
      // Add more items as needed
    ]
    const result = getDominantCollAsset(assets as PortfolioMigrationAsset[])
    expect(result?.usdValue).toBe(100)
  })
})
