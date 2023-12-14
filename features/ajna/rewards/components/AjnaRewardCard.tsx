import { TxStatus } from '@oasisdex/transactions'
import { sendGenericTransaction$ } from 'blockchain/better-calls/send-generic-transaction'
import { getNetworkContracts } from 'blockchain/contracts'
import { useMainContext } from 'components/context/MainContextProvider'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Skeleton } from 'components/Skeleton'
import type { ethers } from 'ethers'
import { useAjnaRewards } from 'features/ajna/rewards/hooks'
import type { AjnaRewards } from 'features/ajna/rewards/types'
import { isAjnaSupportedNetwork } from 'features/omni-kit/protocols/ajna/helpers'
import type { AjnaSupportedNetworksIds } from 'features/omni-kit/protocols/ajna/types'
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
}: {
  signer: ethers.Signer
  rewards: AjnaRewards
  networkId: AjnaSupportedNetworksIds
}) => {
  const hasBonusRewardsToClaim = !rewards.bonus.isZero()

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

  return async () => {
    return await resolvedContract.claimMultiple(
      rewards.payload.core.weeks,
      rewards.payload.core.amounts,
      [rewards.payload.core.proofs],
    )
  }
}

export function AjnaRewardCard() {
  const { t } = useTranslation()
  const { connectedContext$ } = useMainContext()
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [context] = useObservable(connectedContext$)
  const { isLoading, rewards, refetch } = useAjnaRewards()

  const networkId = context?.chainId
  const signer = context?.transactionProvider
  const [isBreakdownOpen, toggleIsBreakdownOpen] = useToggle(false)

  const { total, totalUsd, claimable, bonus, regular } = rewards

  const onSubmit = () => {
    if (signer && networkId && isAjnaSupportedNetwork(networkId)) {
      sendGenericTransaction$({
        signer,
        contractTransaction: rewardsTransactionResolver({
          signer,
          rewards,
          networkId,
        }),
      }).subscribe((txState) => {
        handleTransaction({ txState, ethPrice: zero, setTxDetails })

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

  return (
    <Box
      sx={{
        position: 'relative',
        width: '420px',
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
          disabled={isTxLoading || claimable.isZero()}
          variant="primary"
          onClick={onSubmit}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          {t('ajna.rewards.cta')}
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
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80', mt: '24px' }}>
        {t('ajna.rewards.two-tx')}
      </Text>
    </Box>
  )
}
