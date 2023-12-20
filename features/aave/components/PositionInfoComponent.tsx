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
import { calculateViewValuesForPosition } from 'features/aave/services'
import type { ProductType } from 'features/aave/types'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import { getOmniNetValuePnlData } from 'features/omni-kit/helpers/getOmniNetValuePnlData'
import type { AaveCumulativeData } from 'features/omni-kit/protocols/aave/history/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import {
  formatAmount,
  formatBigNumber,
  formatDecimalAsPercent,
  formatPercent,
} from 'helpers/formatters/format'
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
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: AaveLikeReserveData
  debtTokenReserveData: AaveLikeReserveData
  cumulatives?: AaveCumulativeData
  productType: ProductType
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
  collateralTokenPrice,
  debtTokenPrice,
  collateralTokenReserveData,
  debtTokenReserveData,
  productType,
}: PositionInfoComponentProps) => {
  const { t } = useTranslation()
  const currentPositionThings = calculateViewValuesForPosition(
    position,
    collateralTokenPrice,
    debtTokenPrice,
    collateralTokenReserveData.liquidityRate,
    debtTokenReserveData.variableBorrowRate,
  )

  const formattedCollateralValue = formatPositionBalance(position.collateral)
  const formattedDebtValue = formatPositionBalance(position.debt)

  const belowCurrentRatio = position.oraclePriceForCollateralDebtExchangeRate
    .minus(position.liquidationPrice)
    .times(100)

  const netValuePnlModalData = getOmniNetValuePnlData({
    cumulatives,
    productType,
    collateralTokenPrice,
    netValueInCollateralToken: currentPositionThings.netValueInCollateralToken,
    collateralToken: position.collateral.symbol,
    oraclePriceForCollateralDebtExchangeRate: position.oraclePriceForCollateralDebtExchangeRate,
  })
  return (
    <DetailsSection
      title={t('manage-earn-vault.overview-earn-aave')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('net-value')}
            value={formatBigNumber(netValuePnlModalData.netValue.inToken, 2)}
            footnote={
              netValuePnlModalData.pnl?.percentage &&
              `${t('omni-kit.content-card.net-value.footnote')} ${
                netValuePnlModalData.pnl.percentage.gte(zero) ? '+' : ''
              }
              ${formatDecimalAsPercent(netValuePnlModalData.pnl.percentage)}`
            }
            unit={netValuePnlModalData.netValue.netValueToken}
            modal={cumulatives && <OmniMultiplyNetValueModal {...netValuePnlModalData} />}
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
                        key="DUNE_ORG_STETHETH_PEG_HISTORY"
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
