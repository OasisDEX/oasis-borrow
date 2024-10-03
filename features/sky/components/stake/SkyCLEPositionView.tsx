import { useConnectWallet } from '@web3-onboard/react'
import type BigNumber from 'bignumber.js'
import { skyUsdsStake } from 'blockchain/better-calls/sky'
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
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { SkeletonLine } from 'components/Skeleton'
import { TabBar } from 'components/TabBar'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import FaqCle from 'features/content/faqs/sky/cle/en'
import { showAllowanceInfo } from 'features/sky/helpers'
import { useSky } from 'features/sky/hooks/useSky'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Heading } from 'theme-ui'

type SkyCLEViewType = {
  usdsBalance: BigNumber
  usdsAllowance?: BigNumber
  skyCleStakeWalletData?: {
    balance: BigNumber
    earned: BigNumber
    totalUSDSLocked: BigNumber
  }
  isOwner: boolean
  reloadingTokenInfo: boolean
  viewWalletAddress?: string
  setReloadingTokenInfo: (value: boolean) => void
}

export const SkyCLEPositionView = ({
  usdsBalance,
  usdsAllowance,
  skyCleStakeWalletData,
  isOwner,
  viewWalletAddress,
  reloadingTokenInfo,
  setReloadingTokenInfo,
}: SkyCLEViewType) => {
  const { t } = useTranslation()
  const [{ wallet }] = useConnectWallet()
  const [stakingAction, setStakingAction] = useState<'stake' | 'unstake'>('stake')

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
    isLoading,
  } = useSky({
    contractAddress: mainnetContracts.sky.stakingCle.address,
    depositAction: (params) => {
      if (!wallet?.accounts[0].address) {
        return new Promise(() => {})
      }
      return skyUsdsStake({
        action: stakingAction,
        amount: params.amount,
        signer: params.signer,
        stakeForCle: true,
      })
    },
    stakingAction,
    primaryToken: 'USDS',
    secondaryToken: 'CLE',
    primaryTokenBalance: stakingAction === 'stake' ? usdsBalance : skyCleStakeWalletData?.balance,
    secondaryTokenBalance: zero,
    primaryTokenAllowance: usdsAllowance,
    secondaryTokenAllowance: zero,
    stake: true,
    walletAddress: wallet?.accounts[0].address,
    viewWalletAddress,
    setReloadingTokenInfo,
    reloadingTokenInfo,
  })

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
          ]}
          active={stakingAction}
        />
        <VaultActionInput
          currencyCode={resolvedPrimaryTokenData.token}
          onChange={onAmountChange}
          amount={amount}
          maxAmount={stakingAction === 'stake' ? maxAmount : skyCleStakeWalletData?.balance}
          showMax
          disabled={isLoading || !isOwner}
          onSetMax={onSetMax}
          action={
            {
              stake: 'Stake',
              unstake: 'Unstake',
            }[stakingAction]
          }
          hasError={false}
        />
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
        stakingAction === 'stake' &&
        showAllowanceInfo(amount, resolvedPrimaryTokenData.allowance) ? (
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
      label: actionLabel,
      action,
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
                        Stake $USDS and get Chronicle Points
                      </Heading>
                    </DetailsSectionTitle>
                  }
                  content={
                    <DetailsSectionContentCardWrapper>
                      <DetailsSectionContentCard
                        title="USDS Deposited"
                        value={
                          isLoading ? (
                            <SkeletonLine height={30} width={200} sx={{ mt: 2 }} />
                          ) : (
                            `${formatCryptoBalance(skyCleStakeWalletData?.balance || zero)}`
                          )
                        }
                        unit={isLoading ? undefined : 'USDS'}
                      />
                      <DetailsSectionContentCard
                        title="Chronicle Points Earned"
                        value={
                          isLoading ? (
                            <SkeletonLine height={30} width={200} sx={{ mt: 2 }} />
                          ) : (
                            `${formatCryptoBalance(skyCleStakeWalletData?.earned || zero)}`
                          )
                        }
                        unit={isLoading ? undefined : 'CLE'}
                      />
                    </DetailsSectionContentCardWrapper>
                  }
                  footer={
                    <DetailsSectionFooterItemWrapper>
                      <DetailsSectionFooterItem
                        title="Total USDS Locked"
                        value={
                          isLoading ? (
                            <SkeletonLine height={20} width={130} sx={{ mt: 2 }} />
                          ) : (
                            `${formatCryptoBalance(skyCleStakeWalletData?.totalUSDSLocked || zero)}`
                          )
                        }
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
          content: <FaqCle />,
        },
      ]}
    />
  )
}
