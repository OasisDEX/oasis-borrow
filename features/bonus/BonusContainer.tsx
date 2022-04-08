import { useObservable } from '../../helpers/observableHook'
import { useAppContext } from '../../components/AppContextProvider'
import BigNumber from 'bignumber.js'

type BonusContainerProps = {
  cdpId: BigNumber
}

export function BonusContainer(props: BonusContainerProps) {
  const { bonus$ } = useAppContext()
  const [bonusViewModel] = useObservable(bonus$(props.cdpId))
  if (bonusViewModel) {
    return (
      <>
        {bonusViewModel.bonuses[0].amount.toString()}
        {bonusViewModel.bonuses[0].symbol.toString()}
      </>
    )
  }
  return <>hello</>
}
