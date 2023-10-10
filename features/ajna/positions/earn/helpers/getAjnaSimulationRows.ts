import type BigNumber from 'bignumber.js'
import { formatCryptoBalance } from 'helpers/formatters/format'

const getAjnaSimulationData = ({
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
