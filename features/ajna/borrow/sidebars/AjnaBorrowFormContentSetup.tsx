import BigNumber from 'bignumber.js'
import { VaultActionInput } from 'components/vault/VaultActionInput'

export function AjnaBorrowFormContentSetup() {
  return (
    <>
      <VaultActionInput
        action="Deposit"
        amount={new BigNumber(0)}
        auxiliaryAmount={new BigNumber(1500)}
        hasAuxiliary={true}
        hasError={false}
        maxAmount={new BigNumber(100)}
        maxAmountLabel={'Balance'}
        maxAuxiliaryAmount={new BigNumber(10000)}
        onChange={() => {}}
        onSetMax={() => {}}
        showMax={true}
        currencyCode={'WBTC'}
        tokenUsdPrice={new BigNumber(1500)}
        disabled={false}
      />
    </>
  )
}
