import { TxState } from '@oasisdex/transactions'
import { Box, Card, Grid } from '@theme-ui/components'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { PickCloseState, PickCloseStateProps } from 'components/stateless/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/stateless/SliderValuePicker'
import React from 'react'

import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../components/stateless/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/stateless/TxStatusSection'

export interface AdjustSlFormLayoutProps {
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
  txState: TxState<AutomationBotAddTriggerData> | undefined
}

export function AdjustSlFormLayout(props: AdjustSlFormLayoutProps) {
  return (
    <Card sx={{ borderRadius: 'large', border: 'lightMuted' }}>
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
