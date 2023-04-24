import { getToken } from 'blockchain/tokensMetadata'
import { EarnPositionVM } from 'components/dumb/PositionList'
import { Dsr } from 'features/dsr/utils/createDsr'
import { zero } from 'helpers/zero'

export function getDsrPosition({
  address,
  pots,
}: {
  pots?: Dsr
  address: string
}): EarnPositionVM[] {
  const netValue =
    pots?.pots.dsr.value && 'dai' in pots?.pots.dsr.value ? pots.pots.dsr.value.dai : zero

  const dsrPosition: EarnPositionVM[] = [
    {
      type: 'earn',
      netValue: `$${netValue.toFixed(2)}`,
      pnl: '-',
      sevenDayYield: '-',
      liquidity: 'unlimited',
      icon: getToken('DAI').iconCircle,
      ilk: 'DAI Savings Rate',
      positionId: 'n/a',
      editLinkProps: {
        href: `/earn/dsr/${address}`,
      },
      isOwnerView: true,
    },
  ]

  return netValue.gt(zero) ? dsrPosition : []
}
