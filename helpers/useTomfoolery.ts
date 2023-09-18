import dayjs from 'dayjs'
import { getLocalAppConfig } from 'helpers/config'

import { useLocalStorage } from './useLocalStorage'

export const foolishnessDate = dayjs(`${new Date().getFullYear()}-04-01`)

export function useTomfoolery(): [boolean, () => void] {
  const { Sillyness: sillinessToggleEnabled } = getLocalAppConfig('features')
  const foolishnessDateEnabled = dayjs().isSame(foolishnessDate, 'day')
  const [mischiefEnabled, setMischief] = useLocalStorage('MischiefEnabled', true)
  return [
    mischiefEnabled ? sillinessToggleEnabled || foolishnessDateEnabled : false,
    () => setMischief(false),
  ]
}
