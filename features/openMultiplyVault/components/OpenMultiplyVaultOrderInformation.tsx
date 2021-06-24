import { Icon } from '@makerdao/dai-ui-icons'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import React, { ReactNode, useState } from 'react'

import { OpenMultiplyVaultState } from '../openMultiplyVault'
import { getCollRatioColor } from './OpenMultiplyVaultDetails'

function OpenMultiplyVaultOrderInformationItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
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

export function OpenMultiplyVaultOrderInformation(props: OpenMultiplyVaultState) {
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
      <OpenMultiplyVaultOrderInformationItem
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
      <OpenMultiplyVaultOrderInformationItem
        label={`Total ${token} exposure`}
        value={`${formatCryptoBalance(totalExposure || new BigNumber(0))} ${token}`}
      />
      <OpenMultiplyVaultOrderInformationItem
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
      <OpenMultiplyVaultOrderInformationItem label={'Slippage Limit'} value={'5.00 %'} />
      <OpenMultiplyVaultOrderInformationItem
        label={'Multiply'}
        value={`${multiply?.toString()}x`}
      />
      <OpenMultiplyVaultOrderInformationItem
        label={'Outstanding Debt'}
        value={`${formatCryptoBalance(afterOutstandingDebt)} DAI`}
      />
      <OpenMultiplyVaultOrderInformationItem
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
      <OpenMultiplyVaultOrderInformationItem
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
          <OpenMultiplyVaultOrderInformationItem
            label={'3rd party protocol fees'}
            value={`$${formatAmount(txFees, 'USD')}`}
          />
          <OpenMultiplyVaultOrderInformationItem
            label={'Oasis fee'}
            value={`$${formatAmount(txFees, 'USD')}`}
          />
        </Grid>
      )}
    </Grid>
  )
}
