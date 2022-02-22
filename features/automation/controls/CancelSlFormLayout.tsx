import { TxState } from '@oasisdex/transactions'
import { Box, Grid, Text } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { AutomationBotRemoveTriggerData } from 'blockchain/calls/automationBot'
import { MessageCard } from 'components/MessageCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { AutomationFormButtons } from '../common/components/AutomationFormButtons'

export interface CancelSlFormLayoutProps {
  liquidationPrice: BigNumber
  removeTriggerConfig: RetryableLoadingButtonProps
  toggleForms: () => void
  gasEstimation: ReactNode
  accountIsController: boolean
  txProgressing: boolean
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
        <Text variant="subheader">{description}</Text>
      </Box>
      <Text variant="strong">{summaryHeader}</Text>
      <Grid columns={2}>
        <Box>
          <Text variant="subheader">{liquidation}</Text>
        </Box>
        <Box>{`$${formatCryptoBalance(props.liquidationPrice)}`}</Box>
        <Box>
          <Text variant="subheader">{total}</Text>
        </Box>
        {/* TODO LW implement when it will be available in addTrigger */}
        {/* https://app.shortcut.com/oazo-apps/story/3284/add-total-tx-costs-for-transactions-in-automation */}
        {/* <Box>$250.00</Box> */}
        <Box>{props.gasEstimation}</Box>
      </Grid>
      <MessageCard {...{ messages, type: 'warning' }} />
      {props.accountIsController && !props.txProgressing && (
        <AutomationFormButtons
          triggerConfig={props.removeTriggerConfig}
          toggleForms={props.toggleForms}
          toggleKey="protection.navigate-adjust"
        />
      )}
    </Grid>
  )
}
