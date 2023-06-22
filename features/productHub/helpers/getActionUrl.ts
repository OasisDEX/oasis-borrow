import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export function getActionUrl({ earnStrategy, label, product, protocol }: ProductHubItem): string {
  switch (protocol) {
    case LendingProtocol.Ajna:
      const productInUrl = earnStrategy?.includes('Yield Loop')
        ? ProductHubProductType.Multiply
        : product

      return `/ajna/${productInUrl}/${label.replace('/', '-')}`
    case LendingProtocol.AaveV2:
    case LendingProtocol.AaveV3:
    case LendingProtocol.Maker:
      return '/'
  }
}
