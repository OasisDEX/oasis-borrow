import type BigNumber from 'bignumber.js'
import type { NetworkNames } from 'blockchain/networks'
import { shouldShowPairId } from 'features/omni-kit/helpers'
import type { OmniProductType } from 'features/omni-kit/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
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
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  quoteAddress?: string
  quoteIcon?: string
  quoteToken?: string
  maxLtv?: BigNumber
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
  maxLtv,
}: OmniHeadlinePropsParams) {
  const { t } = useTranslation()

  const resolvedPositionId = positionId ? ` #${positionId}` : ''
  const resolvedMaxLtv =
    collateralToken &&
    quoteToken &&
    maxLtv &&
    shouldShowPairId({
      collateralToken,
      networkName,
      protocol,
      quoteToken,
    })
      ? ` ${formatDecimalAsPercent(maxLtv)}`
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
      // ux stuff, we are using max ltv as pair id here, so it's easy from user
      // perspective to distinguish between markets instead of using 1,2,3 etc.
      pairId: resolvedMaxLtv,
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
