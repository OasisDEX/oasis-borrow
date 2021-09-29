import { storiesOf } from '@storybook/react'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, Container, Heading } from 'theme-ui'

import { SLIPPAGE_DEFAULT, SlippageLimitState } from './slippageLimit'
import { SlippageLimitDropdown } from './SlippageLimitView'

const stories = storiesOf('Slippage Limit Selection', module)

const StoryContainer = ({ children, title }: { title: string } & WithChildren) => {
  return (
    <Container variant="appContainer">
      <Heading variant="smallHeading" sx={{ mt: 5, mb: 3, textAlign: 'left' }}>
        {title}
      </Heading>
      <Box sx={{ position: 'relative' }}>{children}</Box>
    </Container>
  )
}

const BASE_PROPS: SlippageLimitState = {
  stage: 'editing',
  slippage: SLIPPAGE_DEFAULT,
  slippageInput: SLIPPAGE_DEFAULT,
  setSlippageCustom: () => null,
  setSlippageLow: () => null,
  setSlippageMedium: () => null,
  setSlippageHigh: () => null,
  reset: () => null,
  canProgress: true,
  errors: [],
  warnings: [],
}

stories.add('Editing', () => {
  return (
    <StoryContainer title="Editing Slippage">
      <SlippageLimitDropdown {...BASE_PROPS} />
    </StoryContainer>
  )
})

stories.add('In progress', () => {
  return (
    <StoryContainer title="In progress">
      <SlippageLimitDropdown {...BASE_PROPS} stage="inProgress" />
    </StoryContainer>
  )
})

stories.add('Failure', () => {
  return (
    <StoryContainer title="Failure">
      <SlippageLimitDropdown {...BASE_PROPS} stage="failure" />
    </StoryContainer>
  )
})

stories.add('Success', () => {
  return (
    <StoryContainer title="Success">
      <SlippageLimitDropdown {...BASE_PROPS} stage="success" />
    </StoryContainer>
  )
})
