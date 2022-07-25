import BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { useObservable } from '../../helpers/observableHook'
import { ClaimTxnState } from './bonusPipe'

type BonusContainerProps = {
  cdpId: BigNumber
}

export function BonusContainer(props: BonusContainerProps) {
  const { bonus$ } = useAppContext()
  const [bonusViewModel] = useObservable(bonus$(props.cdpId))
  const { t } = useTranslation()

  if (bonusViewModel) {
    const { bonus, claimAll, claimTxnState } = bonusViewModel

    let bonusInstructionSnippet: string
    if (bonus.amountToClaim.eq(0)) {
      bonusInstructionSnippet = 'claim-rewards.instructions.nothing-to-claim'
    } else if (claimTxnState === ClaimTxnState.SUCCEEDED) {
      bonusInstructionSnippet = 'claim-rewards.instructions.claim-succeeded'
    } else {
      bonusInstructionSnippet = 'claim-rewards.instructions.tokens-to-claim'
    }

    return (
      <Banner
        title={t('claim-rewards.title', { bonusTokenName: bonus.name })}
        description={
          <>
            <Text mt={3}>
              {t('claim-rewards.for-this-position', {
                bonusTokenName: bonus.name,
              })}{' '}
              {t('claim-rewards.more-info.text1')}{' '}
              <AppLink sx={{ ml: '1px' }} href={bonus.moreInfoLink} target="_blank">
                {t('claim-rewards.more-info.link-text')}
              </AppLink>
              {t('claim-rewards.more-info.text2')}
            </Text>
            <Text mt={3}>{t(bonusInstructionSnippet, bonus)}</Text>
          </>
        }
        button={{
          disabled:
            !claimAll ||
            claimTxnState === ClaimTxnState.PENDING ||
            claimTxnState === ClaimTxnState.SUCCEEDED,
          action: claimAll,
          isLoading: claimTxnState === ClaimTxnState.PENDING,
          text:
            claimTxnState === ClaimTxnState.SUCCEEDED
              ? 'Success'
              : t('claim-rewards.claim-button.claim-rewards'),
        }}
      />
    )
  }
  return null
}
