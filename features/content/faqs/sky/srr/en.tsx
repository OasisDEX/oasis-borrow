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
        title: 'What are Sky Token Rewards?',
        body: (
          <>
            <Text>
              When you supply USDS to the Sky Token Rewards module through Summer.fi, you receive
              Sky Token Rewards over time as $SKY governance tokens.
            </Text>
          </>
        ),
      },
      {
        title: 'Is there a minimum amount to supply?',
        body: (
          <>
            <Text>No, there’s no minimum amount to supply and start earning $SKY rewards.</Text>
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
        title: 'How can I claim my $SKY rewards?',
        body: (
          <Text>
            On Summer.fi, you can claim your $SKY rewards, which will be sent directly to your
            wallet. To learn how to claim $SKY token rewards, follow the tutorial in our
            documentation.
          </Text>
        ),
      },
    ]}
  />
)
