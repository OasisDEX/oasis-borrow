import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { ItemValueWithIcon } from 'components/infoSection/ItemValueWithIcon'
import { useRefinanceContext } from 'features/refinance/contexts'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatLtvDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
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

export const RefinanceReviewChangesSection = () => {
  const { t } = useTranslation()

  const { poolData, position, simulation, automations } = useRefinanceContext()

  const ltv = new BigNumber(poolData.maxLtv.loanToValue)
  const liquidationPrice = new BigNumber(position.liquidationPrice)
  const debt = new BigNumber(position.debtTokenData.amount)
  const debtToken = position.debtTokenData.token.symbol

  if (!simulation.refinanceSimulation) {
    return null
  }
  const targetPosition = simulation.refinanceSimulation.targetPosition

  const isAutomationEnabled = Object.values(automations).some((item) => item.enabled)

  const afterLtv = new BigNumber(
    simulation.liquidationThreshold ? simulation.liquidationThreshold.toProportion() : 0,
  )

  const afterLiquidationPriceInUsd = simulation.liquidationPrice
  const afterLiquidationPrice = new BigNumber(afterLiquidationPriceInUsd)
  const afterDebt = new BigNumber(targetPosition.debtAmount.amount)
  const afterDebtToken = targetPosition.debtAmount.token.symbol

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
              label: t('max-ltv'),
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
              value: t(isAutomationEnabled ? 'on' : 'off'),
              change: (
                <Text as="span" sx={{ color: 'critical100' }}>
                  {t('off')}
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
