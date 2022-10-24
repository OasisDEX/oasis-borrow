import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'

export const aaveStrategiesList = ['stETHeth']
export const aaveStETHMinimumRiskRatio = new RiskRatio(new BigNumber(2.01), RiskRatio.TYPE.MULITPLE)
