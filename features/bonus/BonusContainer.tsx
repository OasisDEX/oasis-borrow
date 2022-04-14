import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Heading, Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { useObservable } from '../../helpers/observableHook'
import { Bonus, ClaimTxnState } from './bonusPipe'

type BonusContainerProps = {
  cdpId: BigNumber
}

function mapToBtnText(claimTxnState?: ClaimTxnState): string {
  switch (claimTxnState) {
    case undefined:
      return 'claim-rewards.claim-button.claim-rewards'
    case ClaimTxnState.PENDING:
      return 'Pending'
    case ClaimTxnState.SUCCEEDED:
      return 'Success'
    case ClaimTxnState.FAILED:
      return 'Failed - click to try again'
    default:
      throw new Error(`unrecognised transaction state ${claimTxnState}`)
  }
}

function getUnclaimedBonusText(t: (key: string, args?: any) => string, bonus: Bonus) {
  return (
    <Text
      mt={3}
      sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
    >
      {t('claim-rewards.text1', {
        bonusTokenName: bonus.name,
        bonusAmount: bonus.amountToClaim.toFixed(0) + bonus.symbol,
      })}{' '}
      <a href={bonus.moreInfoLink} target="_blank">
        {t('claim-rewards.link-text')}
      </a>
      {t('claim-rewards.text2')}
    </Text>
  )
}

function claimedBonusText(t: (key: string, args?: any) => string, bonus: Bonus) {
  return (
    <Text
      mt={3}
      sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
    >
      You have claimed {bonus.amountToClaim.toFixed(0) + bonus.symbol}. It may take a few minutes
      for your position to update.
    </Text>
  )
}

export function BonusContainer(props: BonusContainerProps) {
  const { bonus$ } = useAppContext()
  const [bonusViewModel] = useObservable(bonus$(props.cdpId))
  const { t } = useTranslation()
  // console.log(bonusViewModel)
  if (bonusViewModel && bonusViewModel.bonus) {
    const { bonus, claimAll, claimTxnState } = bonusViewModel
    return (
      <Card sx={{ borderRadius: 'large', border: 'lightMuted', mt: 3, padding: 3 }}>
        <Box sx={{ margin: 2 }}>
          <Heading
            variant="header4"
            sx={{ fontSize: '18px', lineHeight: '28px', fontWeight: '600', color: '#25273D' }}
          >
            {t('claim-rewards.title', { bonusTokenName: bonus.name })}
          </Heading>
          {claimTxnState !== ClaimTxnState.SUCCEEDED
            ? getUnclaimedBonusText(t, bonus)
            : claimedBonusText(t, bonus)}
          <Button disabled={!claimAll} variant="secondary" mt={3} onClick={claimAll}>
            {t(mapToBtnText(claimTxnState))}
          </Button>
        </Box>
      </Card>
    )
  }
  return <>Bonus not supported</>
}
