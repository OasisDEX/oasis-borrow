import { useObservable } from '../../helpers/observableHook'
import { useAppContext } from '../../components/AppContextProvider'
import BigNumber from 'bignumber.js'
import { Button, Card, Heading, Box } from 'theme-ui'
import React from 'react'
import { Text } from 'theme-ui'
import { useTranslation } from 'next-i18next'

type BonusContainerProps = {
  cdpId: BigNumber
}

export function BonusContainer(props: BonusContainerProps) {
  const { bonus$ } = useAppContext()
  const [bonusViewModel] = useObservable(bonus$(props.cdpId))
  const { t } = useTranslation()
  if (bonusViewModel && bonusViewModel.bonus) {
    return (
      <Card sx={{ borderRadius: 'large', border: 'lightMuted', mt: 3, padding: 3 }}>
        <Box sx={{ margin: 2 }}>
          <Heading
            variant="header4"
            sx={{ fontSize: '18px', lineHeight: '28px', fontWeight: '600', color: '#25273D' }}
          >
            {t('claim-rewards.title', { bonusTokenName: bonusViewModel.bonus.name })}
          </Heading>
          <Text
            mt={3}
            sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
          >
            {t('claim-rewards.text1', {
              bonusTokenName: bonusViewModel.bonus.name,
              bonusAmount:
                bonusViewModel.bonus.amountToClaim.toString() + bonusViewModel.bonus.symbol,
            })}{' '}
            <a href={bonusViewModel.bonus.moreInfoLink} target="_blank">
              {t('claim-rewards.link-text')}
            </a>
            {t('claim-rewards.text2')}
          </Text>
          <Button
            disabled={!bonusViewModel.claimAll}
            variant="secondary"
            mt={3}
            onClick={bonusViewModel.claimAll}
          >
            {t('claim-rewards.claim-button.claim-rewards')}
          </Button>
        </Box>
      </Card>
    )
  }
  return <>hello</>
}
