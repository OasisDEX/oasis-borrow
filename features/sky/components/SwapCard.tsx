import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { SkyTokensSwapType } from 'features/sky/components/types'
import { useSkyTokenSwap } from 'features/sky/hooks/useSkyTokenSwap'
import { Button, Card, Flex, Heading, Spinner } from 'theme-ui'

export const SwapCard = ({
  primaryToken,
  secondaryToken,
  primaryTokenBalance,
  primaryTokenAllowance,
  secondaryTokenBalance,
  secondaryTokenAllowance,
  walletAddress,
  setIsLoadingAllowance,
  isLoadingAllowance,
  depositAction,
}: SkyTokensSwapType) => {
  const {
    amount,
    action,
    actionLabel,
    isLoading,
    maxAmount,
    onAmountChange,
    onSetMax,
    buttonDisabled,
    setIsTokenSwapped,
    isTokenSwapped,
    resolvedPrimaryTokenData,
    resolvedSecondaryTokenData,
  } = useSkyTokenSwap({
    primaryToken,
    secondaryToken,
    primaryTokenBalance,
    primaryTokenAllowance,
    secondaryTokenBalance,
    secondaryTokenAllowance,
    walletAddress,
    setIsLoadingAllowance,
    isLoadingAllowance,
    depositAction,
  })

  return (
    <Card
      sx={{
        p: 4,
        border: 'lightMuted',
      }}
    >
      <Flex
        sx={{
          position: 'relative',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 3,
          mb: 3,
          borderBottom: 'lightMuted',
          zIndex: 1,
        }}
      >
        <Heading
          as="p"
          variant="boldParagraph2"
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {resolvedPrimaryTokenData.token} to {resolvedSecondaryTokenData.token}
        </Heading>
        <Button variant="outlineSmall" onClick={() => setIsTokenSwapped(!isTokenSwapped)}>
          switch tokens
        </Button>
      </Flex>
      <VaultActionInput
        action="Swap"
        currencyCode={resolvedPrimaryTokenData.token}
        onChange={onAmountChange}
        hasError={false}
        amount={amount}
        maxAmount={maxAmount}
        showMax
        onSetMax={onSetMax}
      />
      <Button
        disabled={buttonDisabled}
        variant="primary"
        onClick={() => {
          if (action) action()
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mt: 3,
        }}
      >
        {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
        {actionLabel}
      </Button>
      <pre>
        {JSON.stringify(
          {
            resolvedPrimaryTokenData: {
              ...resolvedPrimaryTokenData,
              balance: resolvedPrimaryTokenData.balance?.toString(),
              allowance: resolvedPrimaryTokenData.allowance?.toString(),
            },
            resolvedSecondaryTokenData: {
              ...resolvedSecondaryTokenData,
              balance: resolvedSecondaryTokenData.balance?.toString(),
              allowance: resolvedSecondaryTokenData.allowance?.toString(),
            },
            actionLabel,
            amount: amount?.toString(),
            isLoading,
          },
          null,
          2,
        )}
      </pre>
    </Card>
  )
}
