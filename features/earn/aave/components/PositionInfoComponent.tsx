import { IPosition } from '@oasisdex/oasis-actions'
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
import { ManageSectionModal } from 'features/aave/manage/components'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { PreparedAaveReserveData } from 'lendingProtocols/aave-v2/pipelines/aaveV2PrepareReserveData'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

type PositionInfoComponentProps = {
  aaveReserveDataDebtToken: PreparedAaveReserveData
  oraclePrice: BigNumber
  apy?: BigNumber
  position: IPosition
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
  oraclePrice,
  apy,
  position,
}: PositionInfoComponentProps) => {
  const { t } = useTranslation()

  const netValueInCollateralToken = position.collateral.normalisedAmount.minus(
    position.debt.normalisedAmount.div(position.oraclePriceForCollateralDebtExchangeRate),
  )

  const formattedNetValueInCollateralToken =
    (position && amountFromWei(netValueInCollateralToken, position.collateral.symbol)) || zero

  const formattedCollateralValue = formatPositionBalance(position.collateral)
  const formattedDebtValue = formatPositionBalance(position.debt)

  const belowCurrentRatio = oraclePrice.minus(position.liquidationPrice).times(100)

  return (
    <DetailsSection
      title={t('manage-earn-vault.overview-earn-aave')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('net-value')}
            value={formatBigNumber(formattedNetValueInCollateralToken, 2)}
            unit={position.collateral.symbol}
            modal={
              <ManageSectionModal
                heading={t('net-value')}
                description={
                  <>
                    <Grid gap={2}>
                      <Text as="p" variant="paragraph2" sx={{ mt: 2 }}>
                        {t('manage-earn-vault.net-value-calculation', {
                          oraclePrice: formatBigNumber(
                            position.oraclePriceForCollateralDebtExchangeRate || zero,
                            4,
                          ),
                          collateralSymbol: position.collateral.symbol,
                          debtSymbol: position.debt.symbol,
                        })}
                      </Text>
                    </Grid>
                    <Grid gap={2} columns={[1, 2]}>
                      <div />
                      <Box>{t('manage-earn-vault.eth-value')}</Box>
                      <Box>{t('manage-earn-vault.collateral-value-in-vault')}</Box>
                      <Box>{formattedCollateralValue}</Box>
                      <Box>{t('manage-earn-vault.debt-value-in-vault')}</Box>
                      <Box>{formattedDebtValue}</Box>
                      <Box>{t('net-value')}</Box>
                      <Box>
                        {formatAmount(
                          formattedNetValueInCollateralToken,
                          position.collateral.symbol,
                        )}{' '}
                        {position.collateral.symbol}
                      </Box>
                    </Grid>
                  </>
                }
              />
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
                        href="https://dune.com/chrisbduck/steth-eth-monitor"
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
              url: 'https://dune.com/dataalways/stETH-De-Peg', // should we move this url to a file? an env?
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
