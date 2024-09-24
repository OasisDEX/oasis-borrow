import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { skyUsdsStake, skyUsdsStakeGetRewards } from 'blockchain/better-calls/sky'
import { mainnetContracts } from 'blockchain/contracts/mainnet'
import { ActionPills } from 'components/ActionPills'
import { DetailsSection, DetailsSectionTitle } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { TabBar } from 'components/TabBar'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import type { ethers } from 'ethers'
import { showAllowanceInfo } from 'features/sky/helpers'
import { useSky } from 'features/sky/hooks/useSky'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sky } from 'theme/icons'
import { Box, Card, Grid, Heading, Text } from 'theme-ui'

type SkyStakeViewType = {
  usdsBalance: BigNumber
  skyBalance: BigNumber
  usdsAllowance?: BigNumber
  skyAllowance?: BigNumber
  skyStakeWalletData?: {
    balance: BigNumber
    earned: BigNumber
  }
  skyStakeData: {
    apy: BigNumber
    totalUSDSLocked: BigNumber
  }
  isOwner: boolean
  reloadingTokenInfo: boolean
  viewWalletAddress?: string
  setReloadingTokenInfo: (value: boolean) => void
}

export const SkyStakePositionView = ({
  usdsBalance,
  skyBalance,
  usdsAllowance,
  skyAllowance,
  skyStakeData,
  skyStakeWalletData,
  isOwner,
  viewWalletAddress,
  reloadingTokenInfo,
  setReloadingTokenInfo,
}: SkyStakeViewType) => {
  const { t } = useTranslation()
  const [{ wallet }] = useConnectWallet()
  const [stakingAction, setStakingAction] = useState<'stake' | 'unstake' | 'claim'>('stake')

  const {
    resolvedPrimaryTokenData,
    onAmountChange,
    amount,
    actionLabel,
    action,
    maxAmount,
    onSetMax,
    allowanceStatus,
    setAllowanceStatus,
    setTransactionStatus,
    transactionStatus,
    allowanceTx,
    transactionTx,
    setTransactionTx,
    isLoading,
    signer,
  } = useSky({
    contractAddress: mainnetContracts.sky.staking.address,
    depositAction: (params) => {
      if (!wallet?.accounts[0].address) {
        return new Promise(() => {})
      }
      return skyUsdsStake({
        action: stakingAction,
        amount: params.amount,
        signer: params.signer,
      })
    },
    primaryToken: 'USDS',
    secondaryToken: 'SKY',
    primaryTokenBalance: stakingAction === 'stake' ? usdsBalance : skyStakeWalletData?.balance,
    secondaryTokenBalance: skyBalance,
    primaryTokenAllowance: usdsAllowance,
    secondaryTokenAllowance: skyAllowance,
    stake: true,
    walletAddress: wallet?.accounts[0].address,
    viewWalletAddress,
    setReloadingTokenInfo,
    reloadingTokenInfo,
  })

  const claimAction = async () => {
    if (!wallet?.accounts[0].address || skyStakeWalletData?.earned.isZero()) {
      return
    }

    if (signer) {
      skyUsdsStakeGetRewards({ signer })
        .then((tx: ethers.ContractTransaction) => {
          setTransactionStatus('success')
          setReloadingTokenInfo(true)
          console.info('Claim transaction', tx)
          tx.wait()
            .then((receipt) => {
              setTransactionTx(receipt.transactionHash)
              setTransactionStatus('success')
              console.info('Claim transaction receipt', receipt)
            })
            .catch((e) => {
              setTransactionStatus('error')
              console.error('Claim transaction failed 1', e)
            })
            .finally(() => {
              setStakingAction('stake')
              setReloadingTokenInfo(false)
            })
        })
        .catch(() => {
          setReloadingTokenInfo(false)
          setTransactionStatus('error')
        })
    }
  }

  const sidebarSectionProps: SidebarSectionProps = {
    title: 'Manage',
    content: (
      <Grid gap={3}>
        <ActionPills
          items={[
            {
              id: 'stake',
              label: 'Stake',
              action: () => setStakingAction('stake'),
              disabled: isLoading || !isOwner,
            },
            {
              id: 'unstake',
              label: 'Unstake',
              action: () => setStakingAction('unstake'),
              disabled: isLoading || !isOwner,
            },
            {
              id: 'claim',
              label: 'Claim',
              action: () => setStakingAction('claim'),
              disabled:
                !skyStakeWalletData || skyStakeWalletData?.earned.isZero() || isLoading || !isOwner,
            },
          ]}
          active={stakingAction}
        />
        {stakingAction === 'claim' && (
          <>
            <Text variant="boldParagraph1" sx={{ textAlign: 'center', mt: 3 }}>
              You will receive{' '}
              <Icon icon={sky} size={30} sx={{ display: 'inline-block', mb: '-8px' }} />
              {formatCryptoBalance(skyStakeWalletData?.earned || zero)} SKY.
            </Text>
            <Text variant="paragraph3" sx={{ textAlign: 'center', mb: 1, mx: 4 }}>
              The position will still be active and getting rewarded with SKY. Claiming SKY will not
              affect your position.
            </Text>
          </>
        )}
        {stakingAction !== 'claim' ? (
          <VaultActionInput
            currencyCode={resolvedPrimaryTokenData.token}
            onChange={onAmountChange}
            amount={amount}
            maxAmount={stakingAction === 'stake' ? maxAmount : skyStakeWalletData?.balance}
            showMax
            disabled={isLoading || !isOwner}
            onSetMax={onSetMax}
            action={
              {
                stake: 'Stake',
                unstake: 'Unstake',
                claim: 'Claim',
              }[stakingAction]
            }
            hasError={false}
          />
        ) : null}
        {transactionStatus && (
          <MessageCard
            sx={{
              mt: 3,
            }}
            messages={
              transactionStatus === 'success'
                ? ([
                    'Transaction successful.',
                    transactionTx ? (
                      <AppLink
                        href={`https://etherscan.io/tx/${transactionTx}`}
                        sx={{ color: 'success100', textDecoration: 'underline' }}
                      >
                        View on etherscan.
                      </AppLink>
                    ) : (
                      false
                    ),
                  ].filter(Boolean) as string[])
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
                ? ([
                    'Allowance set successfully.',
                    allowanceTx ? (
                      <AppLink
                        href={`https://etherscan.io/tx/${allowanceTx}`}
                        sx={{ color: 'success100', textDecoration: 'underline' }}
                      >
                        View on etherscan.
                      </AppLink>
                    ) : (
                      false
                    ),
                  ].filter(Boolean) as string[])
                : ['Failed to set allowance.']
            }
            closeIcon
            type={allowanceStatus === 'success' ? 'ok' : 'error'}
            handleClick={() => setAllowanceStatus(undefined)}
            withBullet={false}
          />
        )}
        {!isLoading && showAllowanceInfo(amount, resolvedPrimaryTokenData.allowance) ? (
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
      </Grid>
    ),
    primaryButton: {
      label: stakingAction !== 'claim' ? actionLabel : 'Claim',
      action: stakingAction !== 'claim' ? action : claimAction,
      isLoading: isLoading || reloadingTokenInfo,
      disabled: isLoading || reloadingTokenInfo,
    },
  }
  return (
    <TabBar
      variant="underline"
      sections={[
        {
          value: 'overview',
          label: 'Overview',
          content: (
            <Grid variant="vaultContainer">
              <Box>
                <DetailsSection
                  title={
                    <DetailsSectionTitle>
                      <Heading as="p" variant="boldParagraph2">
                        Stake $USDS and get $SKY rewards
                      </Heading>
                    </DetailsSectionTitle>
                  }
                  content={
                    <DetailsSectionContentCardWrapper>
                      <DetailsSectionContentCard
                        title="USDS Deposited"
                        value={`${formatCryptoBalance(skyStakeWalletData?.balance || zero)}`}
                        unit="USDS"
                      />
                      <DetailsSectionContentCard
                        title="SKY Reward Rate"
                        value={`${formatDecimalAsPercent(skyStakeData.apy, { noPercentSign: true })}`}
                        unit="%"
                      />
                      <DetailsSectionContentCard
                        title="SKY Earned"
                        value={`${formatCryptoBalance(skyStakeWalletData?.earned || zero)}`}
                        unit="SKY"
                      />
                    </DetailsSectionContentCardWrapper>
                  }
                  footer={
                    <DetailsSectionFooterItemWrapper>
                      <DetailsSectionFooterItem
                        title="Total USDS Locked"
                        value={`${formatCryptoBalance(skyStakeData.totalUSDSLocked)}`}
                      />
                      <DetailsSectionFooterItem
                        title="Total SKY Earned"
                        value={`${formatCryptoBalance(skyBalance)}`}
                      />
                    </DetailsSectionFooterItemWrapper>
                  }
                />
              </Box>
              <Box>
                <SidebarSection {...sidebarSectionProps} />
              </Box>
            </Grid>
          ),
        },
        {
          value: 'position-info',
          label: t('system.faq'),
          content: <Card variant="faq">FAQ</Card>,
        },
      ]}
    />
  )
}
