import { TxState } from '@oasisdex/transactions'
import { Box, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { AutomationBotRemoveTriggerData } from 'blockchain/calls/automationBot'
import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../components/dumb/RetryableLoadingButton'

export interface CancelSlFormLayoutProps {
  liquidationPrice: BigNumber
  removeTriggerConfig: RetryableLoadingButtonProps
  txState?: TxState<AutomationBotRemoveTriggerData>
}

export function CancelSlFormLayout(props: CancelSlFormLayoutProps) {

  const { t } = useTranslation()
  const header = t(`cancel-stoploss.header`)
  const description = t(`cancel-stoploss.description`)
  const summaryHeader = t(`cancel-stoploss.summary-header`)
  const liquidation = t(`cancel-stoploss.liquidation`)
  const total = t(`cancel-stoploss.total`)
  const messages = [t(`notice`)]
  return (
    <Grid columns={[1]}>
      <Box>
        <Text variant="strong" mb={2}>
          {header}
        </Text>
        <Text variant="subheader">
          {description}
        </Text>
      </Box>
      <Text variant="strong">
          {summaryHeader}
        </Text>
        <Grid columns={2}>
        <Box>
        <Text variant="subheader">
          {liquidation}
        </Text>
        </Box>
        <Box>
        {`$${formatCryptoBalance(props.liquidationPrice)}`}
        </Box>
        <Box>
          <Text variant="subheader">
            {total}
          </Text>
        </Box>
        <Box>$250.00</Box>
        </Grid>
        <MessageCard {...{ messages, type: 'warning' }} />
      <Box>
        <RetryableLoadingButton {...props.removeTriggerConfig} />
      </Box>
    </Grid>
  )
}
