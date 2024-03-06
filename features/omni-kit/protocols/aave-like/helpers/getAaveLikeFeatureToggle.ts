import { useAppConfig } from 'helpers/config'
import { isAaveLikeLendingProtocol, LendingProtocol } from 'lendingProtocols'

export const getAaveLikeFeatureToggle = (protocol: LendingProtocol) => {
  if (!isAaveLikeLendingProtocol(protocol)) {
    throw Error('Given protocol is not aave-like')
  }

  const {
    AaveV2SafetySwitch,
    AaveV2SuppressValidation,
    AaveV3SafetySwitch,
    AaveV3SuppressValidation,
    SparkSafetySwitch,
    SparkSuppressValidation,
  } = useAppConfig('features')

  return {
    [LendingProtocol.AaveV2]: {
      safetySwitch: AaveV2SafetySwitch,
      suppressValidation: AaveV2SuppressValidation,
    },
    [LendingProtocol.AaveV3]: {
      safetySwitch: AaveV3SafetySwitch,
      suppressValidation: AaveV3SuppressValidation,
    },
    [LendingProtocol.SparkV3]: {
      safetySwitch: SparkSafetySwitch,
      suppressValidation: SparkSuppressValidation,
    },
  }[protocol]
}
