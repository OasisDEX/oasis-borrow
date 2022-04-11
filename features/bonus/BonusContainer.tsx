import { useObservable } from '../../helpers/observableHook'
import { useAppContext } from '../../components/AppContextProvider'
import BigNumber from 'bignumber.js'
import { Button, Card, Heading, Box } from 'theme-ui'
import React from 'react'
import { Text } from 'theme-ui'

type BonusContainerProps = {
  cdpId: BigNumber
}

export function BonusContainer(props: BonusContainerProps) {
  const { bonus$ } = useAppContext()
  const [bonusViewModel] = useObservable(bonus$(props.cdpId))
  if (bonusViewModel && bonusViewModel.bonus) {
    return (
      <Card sx={{ borderRadius: 'large', border: 'lightMuted', mt: 3, padding: 3 }}>
        <Box sx={{ margin: 2 }}>
          <Heading
            variant="header4"
            sx={{ fontSize: '18px', lineHeight: '28px', fontWeight: '600', color: '#25273D' }}
          >
            {bonusViewModel.bonus.name} position rewards
          </Heading>
          <Text
            mt={3}
            sx={{ fontWeight: '400', fontSize: '14px', color: 'lavender', lineHeight: '22px' }}
          >
            For this position you are currently earning {bonusViewModel.bonus.name} rewards. Press
            the button to claim {bonusViewModel.bonus.amountToClaim.toString()}{' '}
            {bonusViewModel.bonus.symbol}. More information about these rewards here.
          </Text>
          <Button
            disabled={!bonusViewModel.claimAll}
            variant="secondary"
            mt={3}
            onClick={bonusViewModel.claimAll}
          >
            Claim Rewards
          </Button>
        </Box>
      </Card>
    )
  }
  return <>hello</>
}
