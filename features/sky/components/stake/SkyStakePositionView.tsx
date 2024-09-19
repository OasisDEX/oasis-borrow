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
import { useSky } from 'features/sky/hooks/useSky'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { sky } from 'theme/icons'
import { Box, Card, Grid, Heading, Text } from 'theme-ui'

type SkyStakeViewType = {
  usdsBalance: BigNumber
  skyBalance: BigNumber
  usdsAllowance: BigNumber
  skyAllowance: BigNumber
  skyStakeData: {
    balance: BigNumber
    earned: BigNumber
    rewardRate: BigNumber
    totalUSDSLocked: BigNumber
  }
  isOwner: boolean
  reloadingTokenInfo: boolean
  setReloadingTokenInfo: (value: boolean) => void
}

export const SkyStakePositionView = ({
  usdsBalance,
  skyBalance,
  usdsAllowance,
  skyAllowance,
  skyStakeData,
  isOwner,
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
    primaryTokenBalance: stakingAction === 'stake' ? usdsBalance : skyStakeData.balance,
    secondaryTokenBalance: skyBalance,
    primaryTokenAllowance: usdsAllowance,
    secondaryTokenAllowance: skyAllowance,
    stake: true,
    walletAddress: wallet?.accounts[0].address,
    setReloadingTokenInfo,
    reloadingTokenInfo,
  })

  const claimAction = async () => {
    if (!wallet?.accounts[0].address || skyStakeData.earned.isZero()) {
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
            { id: 'stake', label: 'Stake', action: () => setStakingAction('stake') },
            { id: 'unstake', label: 'Unstake', action: () => setStakingAction('unstake') },
            {
              id: 'claim',
              label: 'Claim',
              action: () => setStakingAction('claim'),
              disabled: skyStakeData.earned.isZero(),
            },
          ]}
          active={stakingAction}
        />
        {stakingAction === 'claim' && (
          <>
            <Text variant="boldParagraph1" sx={{ textAlign: 'center', mt: 3 }}>
              You will receive{' '}
              <Icon icon={sky} size={30} sx={{ display: 'inline-block', mb: '-8px' }} />
              {formatCryptoBalance(skyStakeData.earned)} SKY.
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
            maxAmount={stakingAction === 'stake' ? maxAmount : skyStakeData.balance}
            showMax
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
      </Grid>
    ),
    primaryButton: {
      label: stakingAction !== 'claim' ? actionLabel : 'Claim',
      action: stakingAction !== 'claim' ? action : claimAction,
      isLoading: isLoading || reloadingTokenInfo,
      disabled: isLoading || !isOwner || reloadingTokenInfo,
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
                        value={`${formatCryptoBalance(skyStakeData.balance)}`}
                        unit="USDS"
                      />
                      <DetailsSectionContentCard
                        title="SKY Reward Rate"
                        value={`${formatCryptoBalance(skyStakeData.rewardRate)}`}
                        unit="%"
                      />
                      <DetailsSectionContentCard
                        title="SKY Earned"
                        value={`${formatCryptoBalance(skyStakeData.earned)}`}
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
