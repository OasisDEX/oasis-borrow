import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { useRefinanceContext } from 'features/refinance/contexts'
import type { SDKSimulation } from 'features/refinance/hooks/useSdkSimulation'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatLtvDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { PositionUtils } from 'summerfi-sdk-client'
import { type Percentage } from 'summerfi-sdk-common'
import { Text } from 'theme-ui'

const getChangeVariant = (
  changeType: 'ltv' | 'liquidationPrice',
  change: BigNumber,
  isShort: boolean,
): 'positive' | 'negative' => {
  let changeDirection: 'isPositive' | 'isNegative'
  switch (changeType) {
    case 'ltv':
      changeDirection = 'isNegative'
      break
    case 'liquidationPrice':
      changeDirection = 'isPositive'
      break
    default:
      throw new Error('Invalid change type')
  }
  if (isShort) {
    return change[changeDirection]() ? 'positive' : 'negative'
  } else {
    // Long position
    return change[changeDirection]() ? 'negative' : 'positive'
  }
}

export const RefinanceReviewChangesSection = ({ simulation }: { simulation: SDKSimulation }) => {
  const { t } = useTranslation()

  const {
    environment: { debtPrice },
    poolData,
    position,
  } = useRefinanceContext()

  const ltv = new BigNumber(poolData.maxLtv.loanToValue)
  const liquidationPrice = new BigNumber(position.liquidationPrice)
  const debt = new BigNumber(position.debtTokenData.amount)
  const debtToken = position.debtTokenData.token.symbol

  const simulatedPosition = simulation.simulatedPosition

  if (!simulatedPosition) {
    return null
  }

  // TECH DEBT: This is a temporary fix to get the liquidation threshold from SDK as there is no other way currently
  let liquidationThreshold: Percentage | undefined
  try {
    liquidationThreshold = (simulatedPosition.pool as any).collaterals.get({
      token: simulatedPosition.collateralAmount.token,
    })?.maxLtv?.ratio
  } catch (e) {
    console.error('Error getting liquidation threshold', e)
  }
  if (liquidationThreshold == null) {
    return null
  }
  const afterLtv = new BigNumber(liquidationThreshold ? liquidationThreshold.toProportion() : 0)
  // TECH DEBT END

  const afterLiquidationPriceInUsd = PositionUtils.getLiquidationPriceInUsd({
    liquidationThreshold: liquidationThreshold,
    debtPriceInUsd: debtPrice,
    position: simulatedPosition,
  })

  const afterLiquidationPrice = new BigNumber(afterLiquidationPriceInUsd)
  const afterDebt = new BigNumber(simulatedPosition.debtAmount.amount)
  const afterDebtToken = simulatedPosition.debtAmount.token.symbol

  const ltvChange = afterLtv.minus(ltv).div(ltv)
  const liquidationPriceChange = afterLiquidationPrice.minus(liquidationPrice).div(liquidationPrice)

  const formatted = {
    ltv: formatLtvDecimalAsPercent(ltv),
    afterLtv: formatLtvDecimalAsPercent(afterLtv),
    ltvChange: formatLtvDecimalAsPercent(ltvChange),
    liquidationPrice: formatCryptoBalance(liquidationPrice),
    afterLiquidationPrice: formatCryptoBalance(afterLiquidationPrice),
    liquidationPriceChange: formatDecimalAsPercent(liquidationPriceChange),
    debt: <ItemValueWithIcon tokens={[debtToken]}>{formatCryptoBalance(debt)}</ItemValueWithIcon>,
    afterDebt: (
      <ItemValueWithIcon tokens={[afterDebtToken]}>
        {formatCryptoBalance(afterDebt)}
      </ItemValueWithIcon>
    ),
  }

  return (
    <InfoSection
      items={[
        {
          label: t('refinance.sidebar.whats-changing.review-all-changes'),
          dropdownValues: [
            {
              label: t('system.liq-price-short'),
              value: formatted.liquidationPrice,
              change: formatted.afterLiquidationPrice,
              secondary: {
                value: formatted.liquidationPriceChange,
                variant: getChangeVariant(
                  'liquidationPrice',
                  liquidationPriceChange,
                  position.isShort,
                ),
              },
            },
            {
              label: t('system.ltv-short'),
              value: formatted.ltv,
              change: formatted.afterLtv,
              secondary: {
                value: formatted.ltvChange,
                variant: getChangeVariant('ltv', ltvChange, position.isShort),
              },
            },
            {
              label: t('system.debt'),
              value: formatted.debt,
              change: formatted.afterDebt,
            },
            {
              label: t('system.automations'),
              value: 'On',
              change: (
                <Text as="span" sx={{ color: 'critical100' }}>
                  Off
                </Text>
              ),
            },
          ],
        },
      ]}
      withListPadding={false}
      wrapperSx={{ backgroundColor: 'unset' }}
    />
  )
}
