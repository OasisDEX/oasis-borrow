import BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'

export const getAjnaBreakEven = ({
  openPositionFees,
  depositAmount,
  apy1Day,
}: {
  openPositionFees: BigNumber
  depositAmount?: BigNumber
  apy1Day?: BigNumber
}) => {
  if (!apy1Day || !depositAmount) return undefined

  return (
    Math.log(depositAmount.plus(openPositionFees).div(depositAmount).toNumber()) /
    apy1Day.toNumber()
  )
}

export const getAjnaSimulationData = ({
  depositAmount,
  apy,
}: {
  depositAmount?: BigNumber
  apy?: BigNumber
}) => ({
  earnings: depositAmount && apy && depositAmount.times(apy),
  netValue: depositAmount && apy && depositAmount.plus(depositAmount.times(apy)),
})

export const getAjnaSimulationRows = ({
  rowsInput,
  quoteToken,
  depositAmount,
}: {
  rowsInput: { apy?: BigNumber; translation: string }[]
  quoteToken: string
  depositAmount?: BigNumber
}) => {
  return rowsInput.map((row) => {
    const { earnings, netValue } = getAjnaSimulationData({ depositAmount, apy: row.apy })

    return [
      row.translation,
      earnings ? `${formatCryptoBalance(earnings)} ${quoteToken}` : '-',
      netValue ? `${formatCryptoBalance(netValue)} ${quoteToken}` : '-',
    ]
  })
}
