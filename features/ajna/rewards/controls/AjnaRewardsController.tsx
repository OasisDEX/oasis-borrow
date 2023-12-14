import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { AjnaHaveSomeQuestions, AjnaHeader } from 'features/ajna/common/components'
import { getAjnaWithArrowColorScheme } from 'features/ajna/common/helpers'
import { AjnaRewardCard } from 'features/ajna/rewards/components'
import { useConnection } from 'features/web3OnBoard/useConnection'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useAccount } from 'helpers/useAccount'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Button, Flex } from 'theme-ui'

export function AjnaRewardsController() {
  const { t } = useTranslation()

  const { isConnected } = useAccount()
  const { connect } = useConnection()

  return (
    <AnimatedWrapper>
      <AjnaHeader
        title={t('ajna.rewards.title')}
        intro={
          <>
            {t('ajna.rewards.intro')}
            <br />
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.TOKEN_REWARDS}>
              <WithArrow
                sx={{
                  ...getAjnaWithArrowColorScheme(),
                  fontSize: 3,
                  fontWeight: 'regular',
                }}
              >
                {t('ajna.rewards.intro-link')}
              </WithArrow>
            </AppLink>
          </>
        }
      />
      {isConnected ? (
        <AjnaRewardCard />
      ) : (
        <Flex sx={{ justifyContent: 'center', mb: [3, null, '48px'] }}>
          <Button variant="primary" sx={{ p: 0 }} onClick={() => connect()}>
            <WithArrow
              gap={1}
              sx={{ color: 'inherit', fontSize: 'inherit', py: 3, pl: '40px', pr: '56px' }}
            >
              {t('connect-wallet')}
            </WithArrow>
          </Button>
        </Flex>
      )}
      <AjnaHaveSomeQuestions />
    </AnimatedWrapper>
  )
}
