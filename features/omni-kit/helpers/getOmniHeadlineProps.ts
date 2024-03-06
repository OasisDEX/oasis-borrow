import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralAddress?: string
  collateralIcon?: string
  collateralToken?: string
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  networkName: NetworkNames
  quoteAddress?: string
  quoteIcon?: string
  quoteToken?: string
  isYieldLoopWithData?: boolean
}

export function getOmniHeadlineProps({
  collateralIcon,
  collateralToken,
  positionId,
  productType,
  protocol,
  quoteIcon,
  quoteToken,
  networkName,
  isYieldLoopWithData,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  const title = t('omni-kit.headline.title', {
    collateralToken,
    productType: isYieldLoopWithData
      ? t('omni-kit.headline.yield-multiple')
      : upperFirst(productType),
    quoteToken,
  })
  const id = positionId ? ` #${positionId}` : ''

  return {
    ...(collateralToken && quoteToken && collateralIcon && quoteIcon
      ? {
          header: `${title}${id}`,
          tokens: [collateralIcon, quoteIcon],
          protocol: {
            network: networkName,
            protocol,
          },
        }
      : {}),
  }
}
