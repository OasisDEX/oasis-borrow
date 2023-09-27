import type { MixpanelAutomationEventsAdditionalParams, MixpanelPages } from 'analytics/types'

export interface MaxGasPriceSectionProps {
  onChange: (item: number) => void
  value: number
  analytics: {
    page: MixpanelPages
    additionalParams: Pick<MixpanelAutomationEventsAdditionalParams, 'vaultId' | 'ilk'>
  }
}
