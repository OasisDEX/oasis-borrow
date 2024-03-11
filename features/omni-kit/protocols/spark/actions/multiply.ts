import type {
  AaveLikeAdjustArgsOmni,
  AaveLikeOpenArgsOmni,
  SparkAdjustDependenciesOmni,
  SparkCloseArgsOmni,
  SparkCloseDependenciesOmni,
  SparkOpenDependenciesOmni,
} from '@oasisdex/dma-library'
import { strategies } from '@oasisdex/dma-library'

export const sparkActionOpen = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: AaveLikeOpenArgsOmni
  dependencies: SparkOpenDependenciesOmni
}) => {
  return strategies.spark.omni.multiply.open(commonPayload, dependencies)
}

export const sparkActionAdjust = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: AaveLikeAdjustArgsOmni
  dependencies: SparkAdjustDependenciesOmni
}) => {
  return strategies.spark.omni.multiply.adjust(commonPayload, dependencies)
}

export const sparkActionClose = ({
  commonPayload,
  dependencies,
}: {
  commonPayload: SparkCloseArgsOmni
  dependencies: SparkCloseDependenciesOmni
}) => {
  return strategies.spark.omni.multiply.close(commonPayload, dependencies)
}
