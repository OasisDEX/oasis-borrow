import type {
  AaveAdjustArgsOmni,
  AaveAdjustDependenciesOmni,
  AaveCloseArgsOmni,
  AaveCloseDependenciesOmni,
  AaveOpenArgsOmni,
  AaveOpenDependenciesOmni,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'

const defaultPromise = Promise.resolve(undefined)

export const aaveActionOpen = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AaveOpenArgsOmni
  dependencies: AaveOpenDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }

  return strategies.aave.multiply.omni[protocolVersion as 'v2' | 'v3'].open(
    commonPayload,
    dependencies,
  )
}

export const aaveActionAdjust = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AaveAdjustArgsOmni
  dependencies: AaveAdjustDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }
  return strategies.aave.multiply.omni[protocolVersion as 'v2' | 'v3'].adjust(
    commonPayload,
    dependencies,
  )
}

export const aaveActionClose = ({
  commonPayload,
  dependencies,
  protocolVersion,
}: {
  commonPayload: AaveCloseArgsOmni
  dependencies: AaveCloseDependenciesOmni
  protocolVersion?: string
}) => {
  if (!protocolVersion) {
    return defaultPromise
  }
  return strategies.aave.multiply.omni[protocolVersion as 'v2' | 'v3'].close(
    commonPayload,
    dependencies,
  )
}
