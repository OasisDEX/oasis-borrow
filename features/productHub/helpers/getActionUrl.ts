import { ProductHubItem } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export function getActionUrl({ label, product, protocol }: ProductHubItem): string {
  switch (protocol) {
    case LendingProtocol.Ajna:
      return `/ajna/${product}/${label.replace('/', '-')}`
    case LendingProtocol.AaveV2:
    case LendingProtocol.AaveV3:
    case LendingProtocol.Maker:
      return '/'
  }
}
