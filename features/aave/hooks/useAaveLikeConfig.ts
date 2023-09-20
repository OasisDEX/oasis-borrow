import { getAppConfig } from 'helpers/config'
import { useMemo } from 'react'
import { AppConfigType } from 'types/config'

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
  const result = useMemo(() => {
    const { aaveLike } = getAppConfig('parameters')
    if (!checkTypes(aaveLike)) {
      console.error('useAaveLieConfig: Invalid config', aaveLike)
      return {
        orderInformation: {
          showFlashloanInformation: false,
        },
      }
    }
    return aaveLike
  }, [])

  return result
}
