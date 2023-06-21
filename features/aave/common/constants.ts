import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

export const wstethRiskRatio = new RiskRatio(new BigNumber(9.99), RiskRatio.TYPE.MULITPLE)
