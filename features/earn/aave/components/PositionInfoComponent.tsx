import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { AaveUserAccountData } from 'blockchain/calls/aave/aaveLendingPool'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { AppLink } from 'components/Links'
import { StrategyConfig } from 'features/aave/common/StrategyConfigType'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { DetailsSection } from '../../../../components/DetailsSection'
import { ManageSectionModal } from '../../../aave/manage/components/ManageSectionModal'

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

type PositionInfoComponentProps = {
  aaveReserveDataETH: PreparedAaveReserveData
  tokens: StrategyConfig['tokens']
  oraclePrice: BigNumber
  accountData: AaveUserAccountData
  apy?: BigNumber
  position?: IPosition
}

export const PositionInfoComponent = ({
  aaveReserveDataETH,
  tokens,
  oraclePrice,
  accountData,
  apy,
  position,
}: PositionInfoComponentProps) => {
  const { t } = useTranslation()

  // Net value (= in ETH terms is:Calculated the same as for other earn positions,
  // but then in eth terms: stETH collateral times the stETH/ETH price, minus the ETH debt.)
  // accountData has them iin ETH so the conversion isn't needed
  const netValue = accountData
    ? accountData.totalCollateralETH.minus(accountData.totalDebtETH)
    : zero
  const totalCollateralInStEth = oraclePrice.times(accountData.totalCollateralETH)

  const belowCurrentRatio = position
    ? oraclePrice.minus(position.liquidationPrice).times(100)
    : zero
  return (
    <DetailsSection
      title={t('manage-earn-vault.overview-earn-aave')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('net-value')}
            value={formatBigNumber(netValue || zero, 2)}
            unit={tokens!.collateral}
            modal={
              <ManageSectionModal
                heading={t('net-value')}
                description={
                  <>
                    <Grid gap={2}>
                      <Text as="p" variant="paragraph2" sx={{ mt: 2 }}>
                        {t('manage-earn-vault.net-value-calculation', {
                          stETHPrice: formatBigNumber(oraclePrice || zero, 4),
                        })}
                      </Text>
                    </Grid>
                    <Grid gap={2} columns={[1, 2]}>
                      <div />
                      <Box>{t('manage-earn-vault.eth-value')}</Box>
                      <Box>{t('manage-earn-vault.collateral-value-in-vault')}</Box>
                      <Box>
                        {formatAmount(accountData.totalCollateralETH || zero, tokens!.collateral)}{' '}
                        {tokens!.collateral}
                      </Box>
                      <Box>{t('manage-earn-vault.debt-value-in-vault')}</Box>
                      <Box>
                        {formatAmount(accountData.totalDebtETH || zero, tokens!.collateral)}{' '}
                        {tokens!.collateral}
                      </Box>
                      <Box>{t('net-value')}</Box>
                      <Box>
                        {formatAmount(netValue || zero, tokens!.collateral)} {tokens!.collateral}
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
            value={formatBigNumber(position ? position.liquidationPrice : zero, 2)}
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
                      <AppLink target="_blank" href="https://dune.com/dataalways/stETH-De-Peg" />,
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
            value={`${formatAmount(totalCollateralInStEth, tokens!.debt)} ${tokens!.debt}`}
          />
          <DetailsSectionFooterItem
            title={t('manage-earn-vault.position-eth-debt')}
            value={`${formatAmount(accountData.totalDebtETH, tokens!.collateral)} ${
              tokens!.collateral
            }`}
          />
          <DetailsSectionFooterItem
            title={t('system.variable-annual-fee')}
            value={
              aaveReserveDataETH?.variableBorrowRate
                ? formatPercent(aaveReserveDataETH.variableBorrowRate.times(100), { precision: 2 })
                : zero.toString()
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
