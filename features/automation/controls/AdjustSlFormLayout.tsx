import { TxState } from '@oasisdex/transactions'
import { Box, Card, Grid } from '@theme-ui/components'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import React from 'react'

import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/dumb/TxStatusSection'

export interface AdjustSlFormLayoutProps {
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
  txState?: TxState<AutomationBotAddTriggerData>
}

export function AdjustSlFormLayout(props: AdjustSlFormLayoutProps) {
  return (
    <Card
      sx={{
        borderRadius: 'large',
        border: 'lightMuted',
        boxShadow: 'vaultDetailsCard',
        padding: '24px',
      }}
    >
      <Grid columns={[1]}>
        <Box>
          <SliderValuePicker {...props.slValuePickerConfig} />
        </Box>
        <Box>
          <PickCloseState {...props.closePickerConfig} />
        </Box>
        <Box>
          <TxStatusSection txState={props.txState} />
        </Box>
        <Box>
          <RetryableLoadingButton {...props.addTriggerConfig} />
        </Box>
      </Grid>
    </Card>
  )
}
