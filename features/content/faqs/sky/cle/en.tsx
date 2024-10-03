import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.DOCS.SKY.STAKING}
    noTitle={true}
    contents={[
      {
        title: 'What are Chronicle Points?',
        body: (
          <>
            <Text>
              Chronicle Points are the new points system created by{' '}
              <AppLink href={EXTERNAL_LINKS.CHRONICLE_LABS} target="_blank">
                Chronicle Labs
              </AppLink>{' '}
              to reward its users for staking $USDS into a farming pool Sky Ecosystem.
            </Text>
          </>
        ),
      },
      {
        title: 'Is there a minimum amount to supply?',
        body: (
          <>
            <Text>No, there’s no minimum amount to supply and start earning Chronicle Points</Text>
          </>
        ),
      },
      {
        title: 'What is the cost? Are there any fees involved?',
        body: (
          <>
            <Text>
              Summer.fi does not charge any fee on this position. You only need to pay regular gas
              fees.
            </Text>
          </>
        ),
      },
      {
        title: 'Can I claim my Chronicle Points?',
        body: (
          <Text>
            Chronicle Points cannot be claimed yet, but will later be claimable at a rate of 10
            points = 1 CLE token.
          </Text>
        ),
      },
    ]}
  />
)
