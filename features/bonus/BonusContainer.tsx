import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Button, Card, Heading, Text } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { AppSpinner } from '../../helpers/AppSpinner'
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
      <Card sx={{ borderRadius: 'large', border: 'lightMuted', mt: 3, padding: 3 }}>
        <Box sx={{ margin: 2 }}>
          <Heading
            variant="header4"
            sx={{ fontSize: '18px', lineHeight: '28px', fontWeight: '600', color: '#25273D' }}
          >
            {t('claim-rewards.title', { bonusTokenName: bonus.name })}
          </Heading>
          <Text
            mt={3}
            sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
          >
            {t('claim-rewards.for-this-position', {
              bonusTokenName: bonus.name,
            })}{' '}
            {t('claim-rewards.more-info.text1')}{' '}
            <a href={bonus.moreInfoLink} target="_blank">
              {t('claim-rewards.more-info.link-text')}
            </a>
            {t('claim-rewards.more-info.text2')}
          </Text>
          <Text
            mt={3}
            sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
          >
            {t(bonusInstructionSnippet, bonus)}
          </Text>
          <Button
            disabled={
              !claimAll ||
              claimTxnState === ClaimTxnState.PENDING ||
              claimTxnState === ClaimTxnState.SUCCEEDED
            }
            variant="secondary"
            mt={3}
            onClick={claimAll}
            sx={{
              height: '40px',
              width: '160px',
            }}
          >
            {claimTxnState === ClaimTxnState.PENDING ? (
              <AppSpinner
                variant="styles.spinner.medium"
                size={20}
                sx={{
                  color: 'black',
                  boxSizing: 'content-box',
                }}
              />
            ) : claimTxnState === ClaimTxnState.SUCCEEDED ? (
              'Success'
            ) : (
              t('claim-rewards.claim-button.claim-rewards')
            )}
          </Button>
        </Box>
      </Card>
    )
  }
  return null
}
