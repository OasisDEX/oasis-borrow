import { Box, Grid } from '@theme-ui/components'
import { PickCloseState, PickCloseStateProps } from 'components/stateless/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/stateless/SliderValuePicker'

import { RetryableLoadingButton, RetryableLoadingButtonProps } from '../../../components/stateless/RetryableLoadingButton'

export interface AdjustSlFormLayoutProps {
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
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
        <RetryableLoadingButton {...props.addTriggerConfig} />
      </Box>
    </Grid>
  )
}
