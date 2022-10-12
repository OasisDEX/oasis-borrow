import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'

export const aaveStrategiesList = ['AAVE-STETH']
export const aaveStETHMinimumRiskRatio = new RiskRatio(new BigNumber(1.1), RiskRatio.TYPE.MULITPLE)
