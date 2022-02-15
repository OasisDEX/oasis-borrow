import { TxState } from '@oasisdex/transactions'
import { Box, Grid } from '@theme-ui/components'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import React, { ReactNode } from 'react'
import { Flex } from 'theme-ui'

import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/dumb/TxStatusSection'

export interface AdjustSlFormLayoutProps {
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
  gasEstimation: ReactNode
  accountIsController: boolean
  txState?: TxState<AutomationBotAddTriggerData>
}

export function AdjustSlFormLayout(props: AdjustSlFormLayoutProps) {
  return (
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
      {props.accountIsController && (
        <Box>
          <RetryableLoadingButton {...props.addTriggerConfig} />
        </Box>
      )}
      {/* TODO for now added as new line of text, this should be eventually included within changes information */}
      <Flex>Gas estimation: {props.gasEstimation}</Flex>
    </Grid>
  )
}
