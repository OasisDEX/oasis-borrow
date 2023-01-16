import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'

export function AjnaBorrowFormContentSetup() {
  const { t } = useTranslation()
  const {
    form: { dispatch, state },
    environment: { collateralToken, collateralTokenMarketPrice },
  } = useAjnaProductContext()
  const { depositAmount, depositAmountUSD } = state

  return (
    <>
      <VaultActionInput
        action="Deposit"
        amount={depositAmount}
        auxiliaryAmount={depositAmountUSD}
        hasAuxiliary={true}
        hasError={false}
        maxAmount={new BigNumber(100)}
        maxAmountLabel={t('balance')}
        maxAuxiliaryAmount={new BigNumber(100).times(collateralTokenMarketPrice)}
        onAuxiliaryChange={() => {}}
        onChange={handleNumericInput((n) => {
          dispatch({
            type: 'update-deposit',
            depositAmount: n,
            depositAmountUSD: n ? n.times(collateralTokenMarketPrice) : undefined,
          })
        })}
        onSetMax={() => {}}
        showMax={true}
        currencyCode={collateralToken}
        tokenUsdPrice={new BigNumber(1400)}
        disabled={false}
      />
    </>
  )
}
