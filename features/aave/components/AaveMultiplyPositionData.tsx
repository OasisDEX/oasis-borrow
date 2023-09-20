import type { IPosition } from '@oasisdex/dma-library'
import { getCurrentPositionLibCallData } from 'actions/aave-like/helpers'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { calculateViewValuesForPosition } from 'features/aave/services'
import type { StrategyType } from 'features/aave/types'
import { StopLossTriggeredBanner } from 'features/automation/protection/stopLoss/controls/StopLossTriggeredBanner'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { displayMultiple } from 'helpers/display-multiple'
import { formatAmount, formatDecimalAsPercent, formatPrecision } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { zero } from 'helpers/zero'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveData,
} from 'lendingProtocols/aave-like-common'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

import { LiquidationPriceCard } from './LiquidationPriceCard'
import { NetValueCard } from './NetValueCard'

type AaveMultiplyPositionDataProps = {
  currentPosition: IPosition
  nextPosition?: IPosition
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: AaveLikeReserveData
  debtTokenReserveData: AaveLikeReserveData
  debtTokenReserveConfigurationData: AaveLikeReserveConfigurationData
  aaveHistory: VaultHistoryEvent[]
  isAutomationAvailable?: boolean
  strategyType: StrategyType
}

export function AaveMultiplyPositionData({
  currentPosition,
  nextPosition,
  collateralTokenPrice,
  debtTokenPrice,
  collateralTokenReserveData,
  debtTokenReserveData,
  debtTokenReserveConfigurationData,
  aaveHistory,
  isAutomationAvailable,
  strategyType,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()
  const [collateralToken, debtToken] = getCurrentPositionLibCallData(currentPosition)

  const currentPositionThings = calculateViewValuesForPosition(
    currentPosition,
    collateralTokenPrice,
    debtTokenPrice,
    collateralTokenReserveData.liquidityRate,
    debtTokenReserveData.variableBorrowRate,
  )

  const nextPositionThings =
    nextPosition &&
    calculateViewValuesForPosition(
      nextPosition,
      collateralTokenPrice,
      debtTokenPrice,
      collateralTokenReserveData.liquidityRate,
      debtTokenReserveData.variableBorrowRate,
    )

  const netBorrowCostInUSDC = currentPositionThings.debt
    .times(debtTokenPrice)
    .times(NaNIsZero(currentPositionThings.netBorrowCostPercentage))

  const stopLossTriggered =
    aaveHistory[0] &&
    'eventType' in aaveHistory[0] &&
    aaveHistory[0].eventType === 'executed' &&
    aaveHistory[0].autoKind === 'aave-stop-loss' &&
    currentPosition.debt.amount.isZero()

  return (
    <Grid>
      {stopLossTriggered && (
        <StopLossTriggeredBanner descriptionKey="automation.trigger-executed-banner-short-description" />
      )}
      <DetailsSection
        title={t('system.overview')}
        content={
          <DetailsSectionContentCardWrapper>
            <LiquidationPriceCard
              currentPositionThings={currentPositionThings}
              position={currentPosition}
              strategyType={strategyType}
              nextPositionThings={nextPositionThings}
              collateralTokenPrice={collateralTokenPrice}
              debtTokenPrice={debtTokenPrice}
              collateralTokenReserveData={collateralTokenReserveData}
              debtTokenReserveData={debtTokenReserveData}
              debtTokenReserveConfigurationData={debtTokenReserveConfigurationData}
            />
            <ContentCardLtv
              loanToValue={currentPosition.riskRatio.loanToValue}
              liquidationThreshold={currentPosition.category.liquidationThreshold}
              afterLoanToValue={nextPosition?.riskRatio.loanToValue}
              maxLoanToValue={currentPosition.category.maxLoanToValue}
              isAutomationAvailable={isAutomationAvailable}
            />
            <DetailsSectionContentCard
              title={t('system.net-borrow-cost')}
              value={formatDecimalAsPercent(
                NaNIsZero(currentPositionThings.netBorrowCostPercentage),
              )}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.netBorrowCostPercentage.lte(zero)
                    ? 'positive'
                    : 'negative',
                  value: `${formatDecimalAsPercent(
                    NaNIsZero(nextPositionThings.netBorrowCostPercentage),
                  )} ${t('after')}`,
                }
              }
              modal={
                <Grid gap={2}>
                  <Heading variant="header4">
                    {t('aave-position-modal.net-borrow-cost.first-header')}
                  </Heading>
                  <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                    {t('aave-position-modal.net-borrow-cost.first-description-line')}
                    <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
                      {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
                    </Text>
                  </Text>
                  <Card as="p" variant="vaultDetailsCardModal">
                    {formatDecimalAsPercent(
                      NaNIsZero(currentPositionThings.netBorrowCostPercentage),
                    )}
                  </Card>
                  <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                    {t('aave-position-modal.net-borrow-cost.second-description-line')}
                  </Text>
                  <Heading variant="header4">
                    {t('aave-position-modal.net-borrow-cost.second-header', {
                      debtToken: debtToken.symbol,
                    })}
                  </Heading>
                  <Text as="p" variant="paragraph3" sx={{ mb: 1 }}>
                    {t('aave-position-modal.net-borrow-cost.third-description-line', {
                      debtToken: debtToken.symbol,
                    })}
                    <Text as="span" variant="boldParagraph3" sx={{ mt: 1 }}>
                      {t('aave-position-modal.net-borrow-cost.positive-negative-line')}
                    </Text>
                  </Text>
                  <Card as="p" variant="vaultDetailsCardModal">
                    {`${formatPrecision(netBorrowCostInUSDC, 2)} ${debtToken.symbol}`}
                  </Card>
                </Grid>
              }
            />
            <NetValueCard
              strategyType={strategyType}
              currentPositionThings={currentPositionThings}
              currentPosition={currentPosition}
              nextPositionThings={nextPositionThings}
            />
          </DetailsSectionContentCardWrapper>
        }
        footer={
          <DetailsSectionFooterItemWrapper columns={2}>
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.total-exposure', { token: collateralToken.symbol })}
              value={`${formatAmount(
                currentPositionThings.totalExposure,
                collateralToken.symbol,
              )} ${collateralToken.symbol}`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.totalExposure.gt(currentPositionThings.totalExposure)
                    ? 'positive'
                    : 'negative',
                  value: `${formatAmount(
                    nextPositionThings.totalExposure,
                    collateralToken.symbol,
                  )} ${collateralToken.symbol} ${t('after')}`,
                }
              }
            />
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.position-debt')}
              value={`${formatPrecision(currentPositionThings.debt, 4)} ${debtToken.symbol}`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.debt.gt(currentPositionThings.debt)
                    ? 'positive'
                    : 'negative',
                  value: `${formatPrecision(
                    nextPositionThings.debt.lt(zero) ? zero : nextPositionThings.debt,
                    4,
                  )} ${nextPosition.debt.symbol} ${t('after')}`,
                }
              }
            />
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.multiple')}
              value={displayMultiple(currentPosition.riskRatio.multiple)}
              change={
                nextPosition && {
                  variant: nextPosition.riskRatio.multiple.gt(currentPosition.riskRatio.multiple)
                    ? 'positive'
                    : 'negative',
                  value: `${nextPosition.riskRatio.multiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t(
                    'after',
                  )}`,
                }
              }
            />
            <DetailsSectionFooterItem
              sx={{ pr: 3 }}
              title={t('system.buying-power')}
              value={`${formatPrecision(currentPositionThings.buyingPower, 2)} USD`}
              change={
                nextPositionThings && {
                  variant: nextPositionThings.buyingPower.gt(currentPositionThings.buyingPower)
                    ? 'positive'
                    : 'negative',
                  value: `${formatPrecision(nextPositionThings.buyingPower, 2)} USD ${t('after')}`,
                }
              }
            />
          </DetailsSectionFooterItemWrapper>
        }
      />
    </Grid>
  )
}
