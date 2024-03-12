import { FaqLayout } from 'features/content/faqs/FaqLayout'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl="/"
    noTitle={true}
    contents={[
      {
        title: 'Lorem ipsum dolor sit amet',
        body: <Text as="p">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>,
      },
    ]}
  />
)
