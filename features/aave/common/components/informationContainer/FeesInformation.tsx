import { Icon } from '@makerdao/dai-ui-icons'
import { IStrategy } from '@oasisdex/oasis-actions'
import { Box, Flex, Grid, Text } from '@theme-ui/components'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  formatGasEstimationETH,
  getEstimatedGasFeeTextOld,
  VaultChangesInformationItem,
} from '../../../../../components/vault/VaultChangesInformation'
import { HasGasEstimation } from '../../../../../helpers/form'
import { formatAmount } from '../../../../../helpers/formatters/format'

interface FeesInformationProps {
  transactionParameters: IStrategy
  token: string
  estimatedGasPrice?: HasGasEstimation
}

export function FeesInformation({
  estimatedGasPrice,
  transactionParameters,
  token,
}: FeesInformationProps) {
  const { t } = useTranslation()
  const [showBreakdown, setShowBreakdown] = React.useState(false)
  const fee = transactionParameters.simulation.swap.targetTokenFee.plus(
    transactionParameters.simulation.swap.sourceTokenFee,
  )
  return (
    <>
      <VaultChangesInformationItem
        label={t('transaction-fee')}
        value={
          <Flex
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            {`${formatAmount(fee, token)} ${token} +`}
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
            value={`${formatAmount(fee, token)} ${token}`}
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
