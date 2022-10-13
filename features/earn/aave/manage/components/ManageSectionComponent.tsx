import { Position } from '@oasisdex/oasis-actions'
import { useActor } from '@xstate/react'
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
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Grid, Text } from 'theme-ui'

import { DetailsSection } from '../../../../../components/DetailsSection'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'
import { ManageSectionModal } from './ManageSectionModal'

type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}

const getLiquidationPriceRatioColor = (ratio: BigNumber) => {
  if (ratio.isLessThanOrEqualTo(0.05)) {
    return 'critical10'
  }
  return ratio.isLessThanOrEqualTo(0.2) ? 'warning10' : 'success10'
}

export function ManageSectionComponent({
  aaveReserveState,
  aaveReserveDataETH,
}: ManageSectionComponentProps) {
  const { t } = useTranslation()
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const {
    accountData,
    oraclePrice, // STETH price data
  } = state.context.protocolData || {}

  if (!accountData?.totalDebtETH || !aaveReserveState?.liquidationThreshold || !oraclePrice) {
    return <AppSpinner />
  }

  const managedPosition = new Position(
    { amount: accountData.totalDebtETH },
    { amount: accountData.totalCollateralETH },
    oraclePrice, // oracle price for STETH, not needed/used to calculate liquidation price ratio
    {
      liquidationThreshold: aaveReserveState.liquidationThreshold,
      dustLimit: new BigNumber(0), // not needed/used to calculate liquidation price ratio
      maxLoanToValue: new BigNumber(0), // not needed/used to calculate liquidation price ratio
    },
  )

  // Net value (= in ETH terms is:Calculated the same as for other earn positions,
  // but then in eth terms: stETH collateral times the stETH/ETH price, minus the ETH debt.)
  // accountData has them iin ETH so the conversion isn't needed
  const netValue = accountData
    ? accountData.totalCollateralETH.minus(accountData.totalDebtETH)
    : zero

  const totalCollateralInStEth = oraclePrice.times(accountData.totalCollateralETH)

  return (
    <DetailsSection
      title={t('manage-earn-vault.overview-earn-aave')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('net-value')}
            value={formatBigNumber(netValue || zero, 2)}
            unit={state.context.token}
            footnote={t('manage-earn-vault.pnl', {
              value: 'n/a',
              token: state.context.token,
            })}
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
                        {formatAmount(accountData.totalCollateralETH || zero, state.context.token)}{' '}
                        {state.context.token}
                      </Box>
                      <Box>{t('manage-earn-vault.debt-value-in-vault')}</Box>
                      <Box>
                        {formatAmount(accountData.totalDebtETH || zero, state.context.token)}{' '}
                        {state.context.token}
                      </Box>
                      <Box>{t('net-value')}</Box>
                      <Box>
                        {formatAmount(netValue || zero, state.context.token)} {state.context.token}
                      </Box>
                    </Grid>
                  </>
                }
              />
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.net-apy')}
            value="n/a"
            footnote="To date: 'n/a'"
            modal={
              <ManageSectionModal
                heading={t('manage-earn-vault.net-apy')}
                description={t('manage-earn-vault.net-apy-modal-aave')}
              />
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.liquidation-price-ratio')}
            value={formatBigNumber(managedPosition.liquidationPrice, 2)}
            unit={`(${formatPercent(
              oraclePrice.minus(managedPosition.liquidationPrice).times(100),
              {
                precision: 0,
              },
            )} below current ratio)`}
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
            customBackground={getLiquidationPriceRatioColor(managedPosition.liquidationPrice)}
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
            value={`${formatAmount(totalCollateralInStEth, 'STETH')} stETH`}
          />
          <DetailsSectionFooterItem
            title={t('manage-earn-vault.position-eth-debt')}
            value={`${formatAmount(accountData.totalDebtETH, state.context.token)} ${
              state.context.token
            }`}
          />
          <DetailsSectionFooterItem
            title={t('system.variable-annual-fee')}
            value={
              aaveReserveDataETH?.variableBorrowRate
                ? formatPercent(aaveReserveDataETH.variableBorrowRate, { precision: 2 })
                : zero.toString()
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
