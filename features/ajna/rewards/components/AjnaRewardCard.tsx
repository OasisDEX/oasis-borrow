import { TxStatus } from '@oasisdex/transactions'
import { AjnaRewardsSource } from '@prisma/client'
import { sendGenericTransaction$ } from 'blockchain/better-calls/send-generic-transaction'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context/MainContextProvider'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Skeleton } from 'components/Skeleton'
import type { ethers } from 'ethers'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { settings as ajnaSettings } from 'features/omni-kit/protocols/ajna/settings'
import type { AjnaSupportedNetworkIds } from 'features/omni-kit/protocols/ajna/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { ajnaBrandGradient, getGradientColor } from 'helpers/getGradientColor'
import type { TxDetails } from 'helpers/handleTransaction'
import { handleTransaction } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useToggle } from 'helpers/useToggle'
import { zero } from 'helpers/zero'
import { Trans, useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { Box, Button, Flex, Grid, Image, Spinner, Text } from 'theme-ui'
import { AjnaBonusRedeemer__factory, AjnaReedemer__factory } from 'types/ethers-contracts'

interface AjnaRewardCardBreakdownItemProps {
  label: string
  value: string
}

export function AjnaRewardCardBreakdownItem({ label, value }: AjnaRewardCardBreakdownItemProps) {
  return (
    <>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold', color: 'neutral80', textAlign: 'left' }}>
        {label}
      </Text>
      <Text variant="paragraph4" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
        {value}
      </Text>
    </>
  )
}

const rewardsTransactionResolver = ({
  signer,
  rewards,
  networkId,
  claimedBonus,
}: {
  signer: ethers.Signer
  rewards: AjnaRewards
  networkId: AjnaSupportedNetworkIds
  claimedBonus: boolean
}) => {
  const hasBonusRewardsToClaim = !rewards.claimableBonus.isZero() && !claimedBonus

  const networkContracts = getNetworkContracts(networkId)

  const ajnaRedeemerAddress = networkContracts.ajnaRedeemer.address
  const ajnaReedemerFactoryContract = AjnaReedemer__factory.connect(ajnaRedeemerAddress, signer)

  const ajnaBonusRedeemerAddress = networkContracts.ajnaBonusRedeemer.address
  const ajnaBonusReedemerFactoryContract = AjnaBonusRedeemer__factory.connect(
    ajnaBonusRedeemerAddress,
    signer,
  )

  const resolvedContract = hasBonusRewardsToClaim
    ? ajnaBonusReedemerFactoryContract
    : ajnaReedemerFactoryContract

  const resolvedPayload = hasBonusRewardsToClaim ? AjnaRewardsSource.bonus : AjnaRewardsSource.core
  const resolvedParams = [
    rewards.payload[resolvedPayload].weeks,
    rewards.payload[resolvedPayload].amounts,
    rewards.payload[resolvedPayload].proofs,
  ]

  return {
    resolvedContract,
    resolvedParams,
  }
}

const disclaimerKeys = ['ajna.rewards.two-tx']

export function AjnaRewardCard() {
  const { t } = useTranslation()
  const { connectedContext$ } = useMainContext()
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [context] = useObservable(connectedContext$)
  const { isLoading, rewards, refetch } = useAjnaRewards()
  const [claimedBonus, setClaimedBonus] = useState(false)

  const networkId = context?.chainId
  const signer = context?.transactionProvider
  const [isBreakdownOpen, toggleIsBreakdownOpen] = useToggle(false)

  const { total, totalUsd, claimable, bonus, regular } = rewards

  const onSubmit = () => {
    const castedNetworkId = networkId as AjnaSupportedNetworkIds

    if (signer && networkId && ajnaSettings.supportedNetworkIds.includes(castedNetworkId)) {
      const { resolvedContract, resolvedParams } = rewardsTransactionResolver({
        signer,
        rewards,
        networkId: castedNetworkId,
        claimedBonus,
      })

      sendGenericTransaction$({
        contract: resolvedContract,
        method: 'claimMultiple',
        params: resolvedParams,
        signer,
      }).subscribe((txState) => {
        void handleTransaction({ txState, ethPrice: zero, setTxDetails })

        if (rewards.claimableBonus.gt(zero) && txState.status === TxStatus.Success) {
          setClaimedBonus(true)
        }

        // This condition should ensure that on tx success, the rewards are re-fetched and if there will
        // be a second tx (regular rewards) the whole process will start from the beginning
        // ensuring proper UX
        if (txState.status === TxStatus.Success) {
          refetch()
          setTxDetails(undefined)
        }
      })
    }

    console.warn(
      `Lack of signer, networkId, or Ajna network not supported for claiming rewards. Network id: ${networkId}`,
    )

    return () => null
  }

  const isTxLoading = txDetails?.txStatus === TxStatus.WaitingForConfirmation
  const isTxError = txDetails?.txStatus === TxStatus.Error

  return (
    <Box
      sx={{
        position: 'relative',
        maxWidth: '420px',
        mx: 'auto',
        p: '24px',
        textAlign: 'center',
        background: 'linear-gradient(90deg, #ffeffd 0%, #f5edff 100%), #fff',
        borderRadius: 'large',
      }}
    >
      <Image
        sx={{ display: 'block', mx: 'auto', mb: '12px' }}
        src={staticFilesRuntimeUrl('/static/img/ajna-logo-color.svg')}
      />
      <Text as="p" variant="boldParagraph3">
        {t('ajna.rewards.balance')}
      </Text>
      {isLoading ? (
        <>
          <Skeleton width="75%" height="38px" color="ajna" sx={{ mx: 'auto', my: 2 }} />
          <Skeleton width="50%" height="24px" color="ajna" sx={{ mx: 'auto' }} />
        </>
      ) : (
        <>
          <Text as="p" variant="header2" sx={getGradientColor(ajnaBrandGradient)}>
            {formatCryptoBalance(total)}{' '}
            <Text as="small" variant="header3">
              $AJNA
            </Text>
          </Text>
          <Text as="p" variant="paragraph2" sx={{ color: 'neutral80' }}>
            ${formatCryptoBalance(totalUsd)}
          </Text>
        </>
      )}
      <Flex
        sx={{
          flexDirection: 'column',
          rowGap: '24px',
          mt: '24px',
          px: 3,
          pt: 4,
          pb: '24px',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          borderRadius: 'mediumLarge',
        }}
      >
        <Text as="p" variant="paragraph2">
          {isLoading ? (
            <Skeleton height="24px" color="ajna" />
          ) : (
            <Trans
              i18nKey="ajna.rewards.claim"
              values={{ amount: formatCryptoBalance(claimable) }}
              components={{ strong: <Text sx={{ fontWeight: 'semiBold' }} /> }}
            />
          )}
        </Text>
        <Button
          disabled={isTxLoading || claimable.isZero() || networkId !== NetworkIds.MAINNET}
          variant="primary"
          onClick={onSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {isTxError ? t('retry') : t('ajna.rewards.cta')}
          {isTxLoading && <Spinner size={24} color="neutral10" sx={{ ml: 2, mb: '2px' }} />}
        </Button>
        {!isLoading && total.gt(zero) && (
          <Box>
            <Button variant="unStyled" onClick={toggleIsBreakdownOpen}>
              <Text variant="paragraph3">{t('ajna.rewards.see-breakdown')}</Text>
              <ExpandableArrow
                direction={isBreakdownOpen ? 'up' : 'down'}
                sx={{ ml: 2, mb: '1px' }}
              />
            </Button>
            {isBreakdownOpen && (
              <Grid
                sx={{
                  gridTemplateColumns: 'auto auto',
                  justifyContent: 'space-between',
                  gap: 3,
                  mt: 3,
                }}
              >
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.bonus-rewards')}
                  value={`${formatCryptoBalance(bonus)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.regular-rewards')}
                  value={`${formatCryptoBalance(regular)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.total-rewards')}
                  value={`${formatCryptoBalance(total)} $AJNA`}
                />
                <AjnaRewardCardBreakdownItem
                  label={t('ajna.rewards.claimable-today')}
                  value={`${formatCryptoBalance(claimable)} $AJNA`}
                />
              </Grid>
            )}
          </Box>
        )}
      </Flex>
      {disclaimerKeys.map((item) => (
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mt: '24px' }} key={item}>
          {t(item)}
        </Text>
      ))}
    </Box>
  )
}
