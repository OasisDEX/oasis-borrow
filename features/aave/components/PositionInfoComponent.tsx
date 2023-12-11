import type { IPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { AppLink } from 'components/Links'
import type { IStrategyInfo } from 'features/aave/types'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/ajna/history/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'

import { ManageSectionModal } from './ManageSectionModal'

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

type PositionInfoComponentProps = {
  aaveReserveDataDebtToken: AaveLikeReserveData
  apy?: BigNumber
  position: IPosition
  cumulatives?: AaveCumulativeData
  oracleAssetPrice: IStrategyInfo['oracleAssetPrice']
}

// todo: export and pull from oasisdex/oasis-actions
interface IPositionBalance {
  amount: BigNumber
  precision: number
  symbol: string
}

function formatPositionBalance(positionBalance: IPositionBalance): string {
  return (
    formatAmount(
      amountFromWei(positionBalance.amount, positionBalance.symbol),
      positionBalance.symbol,
    ) +
      ' ' +
      positionBalance?.symbol || '0'
  )
}

export const PositionInfoComponent = ({
  aaveReserveDataDebtToken,
  apy,
  position,
  cumulatives,
  oracleAssetPrice,
}: PositionInfoComponentProps) => {
  const { t } = useTranslation()

  // Todo: move to lib
  const netValueInDebtToken = position.collateral.normalisedAmount
    .times(position.oraclePriceForCollateralDebtExchangeRate)
    .minus(position.debt.normalisedAmount)

  const formattedNetValueInDebtToken = (position && amountFromWei(netValueInDebtToken, 18)) || zero // TODO

  const formattedCollateralValue = formatPositionBalance(position.collateral)
  const formattedDebtValue = formatPositionBalance(position.debt)

  const belowCurrentRatio = position.oraclePriceForCollateralDebtExchangeRate
    .minus(position.liquidationPrice)
    .times(100)

  const pnlWithoutFees = cumulatives?.cumulativeWithdrawInQuoteToken
    .plus(formattedNetValueInDebtToken)
    .minus(cumulatives.cumulativeDepositInQuoteToken)
    .div(cumulatives.cumulativeDepositInQuoteToken)

  return (
    <DetailsSection
      title={t('manage-earn-vault.overview-earn-aave')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('net-value')}
            value={formatBigNumber(formattedNetValueInDebtToken, 2)}
            unit={position.debt.symbol}
            modal={
              cumulatives && (
                <OmniMultiplyNetValueModal
                  cumulatives={{
                    cumulativeDepositUSD: cumulatives?.cumulativeDepositInQuoteToken.times(
                      oracleAssetPrice.deposit,
                    ),
                    cumulativeWithdrawUSD: cumulatives.cumulativeWithdrawInQuoteToken.times(
                      oracleAssetPrice.deposit,
                    ),
                    cumulativeFeesUSD: cumulatives.cumulativeFees,
                  }}
                  netValue={formattedNetValueInDebtToken.times(oracleAssetPrice.deposit)}
                  pnl={pnlWithoutFees}
                  pnlUSD={pnlWithoutFees && cumulatives.cumulativeDeposit.times(pnlWithoutFees)}
                  collateralPrice={oracleAssetPrice.deposit}
                  collateralToken={position.debt.symbol}
                />
              )
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.net-apy')}
            value={apy ? formatPercent(apy, { precision: 2 }) : '-'}
            modal={
              <ManageSectionModal
                heading={t('manage-earn-vault.net-apy')}
                description={t('manage-earn-vault.net-apy-modal-aave')}
              />
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.liquidation-price-ratio')}
            value={formatBigNumber(position.liquidationPrice, 2)}
            unit={t('manage-earn-vault.below-current-ratio', {
              percentage: formatPercent(belowCurrentRatio, {
                precision: 0,
              }),
            })}
            customUnitStyle={{
              fontSize: 3,
            }}
            modal={
              <ManageSectionModal
                heading={t('manage-earn-vault.liquidation-price-ratio')}
                description={
                  <Trans
                    i18nKey="manage-earn-vault.liquidation-price-ratio-modal-aave"
                    components={[
                      <AppLink
                        target="_blank"
                        href={EXTERNAL_LINKS.DUNE_ORG_STETHETH_PEG_HISTORY}
                      />,
                      <br />,
                    ]}
                  />
                }
              />
            }
            customBackground={getLiquidationPriceRatioColor(belowCurrentRatio)}
            link={{
              label: t('manage-earn-vault.ratio-history'),
              url: EXTERNAL_LINKS.DUNE_ORG_STETHETH_PEG_HISTORY,
            }}
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.total-collateral')}
            value={formattedCollateralValue}
          />
          <DetailsSectionFooterItem
            title={t('manage-earn-vault.position-debt', {
              debtToken: position.debt.symbol,
            })}
            value={formattedDebtValue}
          />
          <DetailsSectionFooterItem
            title={t('system.variable-annual-fee')}
            value={
              aaveReserveDataDebtToken?.variableBorrowRate
                ? formatPercent(aaveReserveDataDebtToken.variableBorrowRate.times(100), {
                    precision: 2,
                  })
                : zero.toString()
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
