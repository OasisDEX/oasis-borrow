import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { uniq, upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

interface OmniHeadlinePropsParams {
  collateralAddress?: string
  collateralIcon?: string
  collateralToken?: string
  headline?: string
  isYieldLoopWithData?: boolean
  networkName: NetworkNames
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  quoteAddress?: string
  quoteIcon?: string
  quoteToken?: string
}

export function getOmniHeadlineProps({
  collateralIcon,
  collateralToken,
  headline,
  isYieldLoopWithData,
  networkName,
  positionId,
  productType,
  protocol,
  quoteIcon,
  quoteToken,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  const resolvedProductType = isYieldLoopWithData
    ? t('omni-kit.headline.yield-multiple')
    : upperFirst(productType)
  const title =
    headline ??
    t('omni-kit.headline.title', {
      collateralToken,
      productType: resolvedProductType,
      quoteToken,
    })
  const id = positionId ? ` #${positionId}` : ''

  return {
    ...(collateralToken && quoteToken && collateralIcon && quoteIcon
      ? {
          header: `${title}${id}`,
          tokens: uniq([collateralIcon, quoteIcon]),
          protocol: {
            network: networkName,
            protocol,
          },
        }
      : {}),
  }
}
