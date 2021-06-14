import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import React, { ReactNode, useState } from 'react'

import { LeverageVaultState } from '../leverageVault'
import { getCollRatioColor } from './LeverageVaultDetails'

function LeverageVaultOrderInformationItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Flex
      sx={{
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 1,
        fontWeight: 'semiBold',
      }}
    >
      <Box sx={{ color: 'text.subtitle' }}>{label}</Box>
      <Box>{value}</Box>
    </Flex>
  )
}

export function LeverageVaultOrderInformation(props: LeverageVaultState) {
  const [showFees, setShowFees] = useState(false)
  const {
    multiply,
    afterCollateralizationRatio,
    afterOutstandingDebt,
    totalExposure,
    buyingCollateral,
    buyingCollateralUSD,
    token,
    txFees,
  } = props
  const collRatioColor = getCollRatioColor(props)

  return (
    <Grid>
      <Text variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
        Order information
      </Text>
      <LeverageVaultOrderInformationItem
        label={`Buying ${token}`}
        value={
          <Text>
            {formatCryptoBalance(buyingCollateral)} {token}
            {` `}
            <Text as="span" sx={{ color: 'text.subtitle' }}>
              (${formatAmount(buyingCollateralUSD, 'USD')})
            </Text>
          </Text>
        }
      />
      <LeverageVaultOrderInformationItem
        label={`Total ${token} exposure`}
        value={`${formatCryptoBalance(totalExposure || new BigNumber(0))} ${token}`}
      />
      <LeverageVaultOrderInformationItem
        label={`${token} Price (impact)`}
        value={
          <Text>
            $1,925.00{' '}
            <Text as="span" sx={{ color: 'onError' }}>
              (-0.25%)
            </Text>
          </Text>
        }
      />
      <LeverageVaultOrderInformationItem label={'Slippage Limit'} value={'5.00 %'} />
      <LeverageVaultOrderInformationItem label={'Multiply'} value={`${multiply?.toString()}x`} />
      <LeverageVaultOrderInformationItem
        label={'Outstanding Debt'}
        value={`${formatCryptoBalance(afterOutstandingDebt)} DAI`}
      />
      <LeverageVaultOrderInformationItem
        label={'Collateral Ratio'}
        value={
          <Text sx={{ color: collRatioColor }}>
            {formatPercent(afterCollateralizationRatio.times(100), {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Text>
        }
      />
      <LeverageVaultOrderInformationItem
        label={'Transaction Fee'}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowFees(!showFees)}
          >
            ${formatAmount(txFees, 'USD')}{' '}
            <Icon
              name={`chevron_${showFees ? 'up' : 'down'}`}
              size="auto"
              width="12px"
              sx={{ ml: 2 }}
            />
          </Flex>
        }
      />
      {showFees && (
        <Grid pl={3} gap={2}>
          <LeverageVaultOrderInformationItem
            label={'3rd party protocol fees'}
            value={`$${formatAmount(txFees, 'USD')}`}
          />
          <LeverageVaultOrderInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(txFees, 'USD')}`}
          />
        </Grid>
      )}
    </Grid>
  )
}
