import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import { Icon } from 'components/Icon'
import { MessageCard } from 'components/MessageCard'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { ethers } from 'ethers'
import type { skySwapTokensConfig } from 'features/sky/config'
import type { ResolvedDepositParamsType } from 'features/sky/hooks/useSkyTokenSwap'
import { useSkyTokenSwap } from 'features/sky/hooks/useSkyTokenSwap'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useMemo, useState } from 'react'
import { combineLatest, of } from 'rxjs'
import { exchange } from 'theme/icons'
import { Button, Card, Flex, Heading, Spinner } from 'theme-ui'

export type SwapCardType = {
  config: (typeof skySwapTokensConfig)[number]
  depositAction: (params: {
    isTokenSwapped: boolean
    resolvedPrimaryTokenData: ResolvedDepositParamsType
    amount: BigNumber
    signer: ethers.Signer
  }) => Promise<ethers.ContractTransaction>
}

type SwapCardWrapperType = SwapCardType & {
  balancesData: BigNumber[]
  allowancesData: BigNumber[]
  reloadingTokenInfo: boolean
  setReloadingTokenInfo: (value: boolean) => void
  walletAddress?: string
}

export const SwapCardWrapper = ({
  config,
  depositAction,
  balancesData,
  allowancesData,
  reloadingTokenInfo,
  setReloadingTokenInfo,
  walletAddress,
}: SwapCardWrapperType) => {
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
    allowanceStatus,
    setAllowanceStatus,
    setTransactionStatus,
    transactionStatus,
  } = useSkyTokenSwap({
    ...config,
    primaryTokenBalance: balancesData?.[0],
    primaryTokenAllowance: allowancesData?.[0],
    secondaryTokenBalance: balancesData?.[1],
    secondaryTokenAllowance: allowancesData?.[1],
    walletAddress,
    setReloadingTokenInfo,
    reloadingTokenInfo,
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
        <Icon
          icon={exchange}
          variant="outlineSmall"
          onClick={() => setIsTokenSwapped(!isTokenSwapped)}
          sx={{ cursor: 'pointer' }}
        />
      </Flex>
      <VaultActionInput
        action={!isTokenSwapped ? 'Upgrade' : 'Downgrade'}
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
      {transactionStatus && (
        <MessageCard
          sx={{
            mt: 3,
          }}
          messages={
            transactionStatus === 'success'
              ? ['Transaction successfull.']
              : ['Failed to execute transaction.']
          }
          closeIcon
          type={transactionStatus === 'success' ? 'ok' : 'error'}
          handleClick={() => setTransactionStatus(undefined)}
          withBullet={false}
        />
      )}
      {allowanceStatus && (
        <MessageCard
          sx={{
            mt: 3,
          }}
          messages={
            allowanceStatus === 'success'
              ? ['Allowance set successfully.']
              : ['Failed to set allowance.']
          }
          closeIcon
          type={allowanceStatus === 'success' ? 'ok' : 'error'}
          handleClick={() => setAllowanceStatus(undefined)}
          withBullet={false}
        />
      )}
      {!isLoading &&
      amount &&
      !resolvedPrimaryTokenData.allowance.isNaN() &&
      (resolvedPrimaryTokenData.allowance.isZero() ||
        resolvedPrimaryTokenData.allowance.isLessThan(amount)) ? (
        <MessageCard
          sx={{
            mt: 3,
          }}
          messages={[
            `Current allowance is ${resolvedPrimaryTokenData.allowance} ${resolvedPrimaryTokenData.token}. You need to update allowance.`,
          ]}
          type="error"
          withBullet={false}
        />
      ) : null}
    </Card>
  )
}

export const SwapCard = ({ config, depositAction }: SwapCardType) => {
  const balancesConfig = useMemo(
    () => [
      {
        address: config.primaryTokenAddress,
        precision: 18,
      },
      {
        address: config.secondaryTokenAddress,
        precision: 18,
      },
    ],
    [config],
  )
  const [{ wallet }] = useConnectWallet()
  const { balancesFromAddressInfoArray$, allowanceForAccountEthers$ } = useProductContext()
  const [reloadingTokenInfo, setReloadingTokenInfo] = useState(false)
  const [balancesData, balancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([zero, zero])
          : balancesFromAddressInfoArray$(balancesConfig, wallet?.accounts[0].address, 1),
      [reloadingTokenInfo, balancesFromAddressInfoArray$, balancesConfig, wallet?.accounts],
    ),
  )
  const [allowancesData, allowancesError] = useObservable(
    useMemo(
      () =>
        reloadingTokenInfo
          ? of([zero, zero])
          : combineLatest([
              allowanceForAccountEthers$(config.primaryToken, config.contractAddress, 1),
              allowanceForAccountEthers$(config.secondaryToken, config.contractAddress, 1),
            ]),
      [
        allowanceForAccountEthers$,
        config.contractAddress,
        config.primaryToken,
        config.secondaryToken,
        reloadingTokenInfo,
      ],
    ),
  )
  return (
    <WithErrorHandler error={[balancesError, allowancesError]}>
      <WithLoadingIndicator value={[balancesData, allowancesData]}>
        {([loadedBalancesData, loadedAllowancesData]) => (
          <SwapCardWrapper
            config={config}
            balancesData={loadedBalancesData}
            allowancesData={loadedAllowancesData}
            reloadingTokenInfo={reloadingTokenInfo}
            setReloadingTokenInfo={setReloadingTokenInfo}
            depositAction={depositAction}
            walletAddress={wallet?.accounts[0].address}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
