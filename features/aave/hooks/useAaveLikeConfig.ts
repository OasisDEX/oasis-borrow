import { useAppConfig } from 'helpers/config'
import { useMemo } from 'react'
import type { AppConfigType } from 'types/config'

const checkTypes = (
  config: AppConfigType['parameters']['aaveLike'],
): config is AppConfigType['parameters']['aaveLike'] => {
  return (
    config &&
    'orderInformation' in config &&
    typeof config.orderInformation === 'object' &&
    'showFlashloanInformation' in config.orderInformation &&
    typeof config.orderInformation.showFlashloanInformation === 'boolean'
  )
}

export const useAaveLikeConfig = () => {
  const { aaveLike } = useAppConfig('parameters')

  const result = useMemo(() => {
    if (!checkTypes(aaveLike)) {
      console.error('useAaveLieConfig: Invalid config', aaveLike)
      return {
        orderInformation: {
          showFlashloanInformation: false,
        },
      }
    }
    return aaveLike
  }, [aaveLike])

  return result
}
