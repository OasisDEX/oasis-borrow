import moment from 'moment'

import { useFeatureToggle } from './useFeatureToggle'
import { useLocalStorage } from './useLocalStorage'

export const foolishnessDate = moment(`${new Date().getFullYear()}-04-01`)

export function useTomfoolery(): [boolean, () => void] {
  const sillinessToggleEnabled = useFeatureToggle('Sillyness')
  const foolishnessDateEnabled = moment().isSame(foolishnessDate, 'day')
  const [mischiefEnabled, setMischief] = useLocalStorage('MischiefEnabled', true)
  return [
    mischiefEnabled ? sillinessToggleEnabled || foolishnessDateEnabled : false,
    () => setMischief(false),
  ]
}
