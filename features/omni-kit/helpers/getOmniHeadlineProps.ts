import type { NetworkNames } from 'blockchain/networks'
import { shouldShowPairId } from 'features/omni-kit/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'
import { uniq, upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'

import { getTokenNameForHeadline } from './getTokenNameForHeadline'

interface OmniHeadlinePropsParams {
  collateralAddress?: string
  collateralIcon?: string
  collateralToken?: string
  headline?: string
  isYieldLoopWithData?: boolean
  networkName: NetworkNames
  pairId: number
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
  pairId,
  positionId,
  productType,
  protocol,
  quoteIcon,
  quoteToken,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  const resolvedPositionId = positionId ? ` #${positionId}` : ''
  const resolvedPairId =
    collateralToken &&
    quoteToken &&
    shouldShowPairId({
      collateralToken,
      networkName,
      protocol,
      quoteToken,
    })
      ? `-${pairId}`
      : ''
  const resolvedProductType = isYieldLoopWithData
    ? t('omni-kit.headline.yield-multiple')
    : upperFirst(productType)

  const collateralTokenHeaderName = getTokenNameForHeadline({ token: collateralToken })
  const quoteTokenHeaderName = getTokenNameForHeadline({ token: quoteToken })

  const title =
    headline ??
    t('omni-kit.headline.title', {
      collateralToken: collateralTokenHeaderName,
      productType: resolvedProductType,
      quoteToken: quoteTokenHeaderName,
      pairId: resolvedPairId,
    })

  return {
    ...(collateralToken && quoteToken && collateralIcon && quoteIcon
      ? {
          header: `${title}${resolvedPositionId}`,
          tokens: uniq([collateralIcon, quoteIcon]),
          protocol: {
            network: networkName,
            protocol,
          },
        }
      : {}),
  }
}
