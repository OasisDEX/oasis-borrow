import BigNumber from "bignumber.js";
import { VaultAction, VaultActionInput } from "components/vault/VaultActionInput";
import { ChangeEvent } from "react";
import { Box } from "theme-ui";
import { DsrDepositInfoSection } from "./DsrDepositInfoSection";

interface DsrWithdrawDaiFormProps {
  onWithdrawAmountChange: (e: ChangeEvent<HTMLInputElement>) => void
  action: VaultAction
  amount: BigNumber | undefined
  maxAmount: BigNumber | undefined
}

export default function DsrWithdrawDaiFrom({
  onWithdrawAmountChange,
  action,
  amount,
  maxAmount
}: DsrWithdrawDaiFormProps) {
  return (
    <Box
      sx={{
        marginTop: 1
      }}
    >
      <VaultActionInput
        action={action}
        currencyCode={'DAI'}
        onChange={onWithdrawAmountChange}
        hasError={false}
        amount={amount}
        // TODO: This will be what is in the wallet or contract
        maxAmount={maxAmount}
        showMax
      />
      {amount && (
        <Box
          sx={{
            mt: 3
          }}
        >
          <DsrDepositInfoSection
            daiToDeposit={amount}
          />
        </Box>
      )}
    </Box>
  )
}