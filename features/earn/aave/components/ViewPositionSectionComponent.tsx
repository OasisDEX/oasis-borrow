import BigNumber from 'bignumber.js'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
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
import { AaveProtocolData } from 'features/aave/manage/state'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { useSimulationYields } from 'helpers/useSimulationYields'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { DetailsSection } from '../../../../components/DetailsSection'
import { PreparedAaveReserveData } from '../../../aave/helpers/aavePrepareReserveData'
import { ManageSectionModal } from '../../../aave/manage/components/ManageSectionModal'

export type ViewPositionSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  aaveProtocolData?: AaveProtocolData
  strategyConfig?: StrategyConfig
}

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  if (ratio.isLessThanOrEqualTo(critical)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(warning) ? 'warning10' : 'success10'
}

export function ViewPositionSectionComponent({
  aaveReserveDataETH,
  aaveProtocolData,
  strategyConfig,
}: ViewPositionSectionComponentProps) {
  const { t } = useTranslation()

  const { accountData, oraclePrice, position } = aaveProtocolData!

  const simulations = useSimulationYields({
    amount: accountData?.totalCollateralETH,
    riskRatio: position?.riskRatio,
    fields: ['7Days'],
  })

  const netValue = accountData.totalCollateralETH.minus(accountData.totalDebtETH)
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
            unit={strategyConfig!.tokens!.debt}
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
                        {formatAmount(
                          accountData.totalCollateralETH || zero,
                          strategyConfig!.tokens!.debt,
                        )}{' '}
                        {strategyConfig!.tokens!.debt}
                      </Box>
                      <Box>{t('manage-earn-vault.debt-value-in-vault')}</Box>
                      <Box>
                        {formatAmount(
                          accountData.totalDebtETH || zero,
                          strategyConfig!.tokens!.debt,
                        )}{' '}
                        {strategyConfig!.tokens!.debt}
                      </Box>
                      <Box>{t('net-value')}</Box>
                      <Box>
                        {formatAmount(netValue || zero, strategyConfig!.tokens!.debt)}{' '}
                        {strategyConfig!.tokens!.debt}
                      </Box>
                    </Grid>
                  </>
                }
              />
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.net-apy')}
            value={simulations?.apy ? formatPercent(simulations.apy, { precision: 2 }) : '-'}
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
            value={`${formatAmount(totalCollateralInStEth, strategyConfig!.tokens!.debt)} ${
              strategyConfig!.tokens!.collateral
            }`}
          />
          <DetailsSectionFooterItem
            title={t('manage-earn-vault.position-eth-debt')}
            value={`${formatAmount(accountData.totalDebtETH, strategyConfig!.tokens!.debt)} ${
              strategyConfig!.tokens!.debt
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
