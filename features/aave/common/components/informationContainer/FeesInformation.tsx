import { Icon } from '@makerdao/dai-ui-icons'
import { Swap } from '@oasisdex/dma-library'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { amountFromWei } from 'blockchain/utils'
import {
  formatGasEstimationETH,
  getEstimatedGasFeeTextOld,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { HasGasEstimation } from 'helpers/form'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface FeesInformationProps {
  estimatedGasPrice?: HasGasEstimation
  swap?: Swap
}

export function FeesInformation({ estimatedGasPrice, swap }: FeesInformationProps) {
  const { t } = useTranslation()
  const [showBreakdown, setShowBreakdown] = React.useState(false)

  const oasisFeeDisplay =
    swap && swap.tokenFee.gt(zero)
      ? formatAmount(
          amountFromWei(swap.tokenFee, swap[swap.collectFeeFrom].symbol),
          swap[swap.collectFeeFrom].symbol,
        ) +
        ' ' +
        swap[swap.collectFeeFrom].symbol
      : '0'

  return (
    <>
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {`${oasisFeeDisplay} + `}
            <Text ml={1}>
              {getEstimatedGasFeeTextOld(estimatedGasPrice, true, formatGasEstimationETH)}
            </Text>
            <Icon
              name={`chevron_${showBreakdown ? 'up' : 'down'}`}
              size="auto"
              width="12px"
              sx={{ ml: 2 }}
            />
          </Flex>
        }
      />
      {showBreakdown && (
        <Grid pl={3} gap={2}>
          <VaultChangesInformationItem
            label={t('vault-changes.oasis-fee')}
            value={oasisFeeDisplay}
          />
          <VaultChangesInformationItem
            label={t('max-gas-fee')}
            value={getEstimatedGasFeeTextOld(estimatedGasPrice, false, formatGasEstimationETH)}
            tooltip={<Box>{t('gas-explanation')}</Box>}
          />
        </Grid>
      )}
    </>
  )
}
