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
import { AppSpinner } from 'helpers/AppSpinner'
import { formatAmount, formatBigNumber, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { DetailsSection } from '../../../../../components/DetailsSection'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { useManageAaveStateMachineContext } from '../containers/AaveManageStateMachineContext'

type ManageSectionComponentProps = {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
}

const mockData = {
  earnId: 3920,
  pnl: 'n/a',
  earnings: new BigNumber(34000.21),
  earningsAfterFees: new BigNumber(31000.21),
  APYtotal: new BigNumber(8.3),
  APYtoDate: new BigNumber(2.2),
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

  const totalCollateral = oraclePrice.times(accountData.totalCollateralETH)

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
              value: mockData.pnl,
              token: state.context.token,
            })}
            modal={<div>Explanation of the thing, probably</div>}
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.earnings-to-date')}
            value={formatBigNumber(mockData.earnings, 2)}
            unit={state.context.token}
            footnote={t('manage-earn-vault.earnings-to-date-after-fees', {
              afterFees: formatBigNumber(mockData.earningsAfterFees, 2),
              symbol: state.context.token,
            })}
            modal={
              <Grid gap={2}>
                <Heading variant="header3">{t('manage-earn-vault.earnings-to-date')}</Heading>
                <Text variant="paragraph2">{t('manage-earn-vault.earnings-to-date-modal')}</Text>
              </Grid>
            }
          />
          <DetailsSectionContentCard
            title={t('manage-earn-vault.net-apy')}
            value={formatPercent(mockData.APYtotal, { precision: 1 })}
            footnote={`To date: ${formatPercent(mockData.APYtoDate, { precision: 1 })}`}
            modal={<div>Explanation of the thing, probably</div>}
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
            modal={<div>Explanation of the thing, probably</div>}
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
            value={`${formatAmount(totalCollateral, 'STETH')} stETH`}
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
