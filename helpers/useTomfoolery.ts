import dayjs from 'dayjs'

import { useFeatureToggle } from './useFeatureToggle'
import { useLocalStorage } from './useLocalStorage'

export const foolishnessDate = dayjs(`${new Date().getFullYear()}-04-01`)

export function useTomfoolery(): [boolean, () => void] {
  const sillinessToggleEnabled = useFeatureToggle('Sillyness')
  const foolishnessDateEnabled = dayjs().isSame(foolishnessDate, 'day')
  const [mischiefEnabled, setMischief] = useLocalStorage('MischiefEnabled', true)
  return [
    mischiefEnabled ? sillinessToggleEnabled || foolishnessDateEnabled : false,
    () => setMischief(false),
  ]
}
