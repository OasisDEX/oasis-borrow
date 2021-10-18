import { storiesOf } from '@storybook/react'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box, Container, Heading } from 'theme-ui'

import { SLIPPAGE_DEFAULT, SLIPPAGE_OPTIONS, UserSettingsState } from './userSettings'
import { UserSettingsDropdown } from './UserSettingsView'

const stories = storiesOf('User settings', module)

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

const BASE_PROPS: UserSettingsState & { opened: boolean; setOpened: () => void } = {
  stage: 'editing',
  slippage: SLIPPAGE_DEFAULT,
  slippageInput: SLIPPAGE_DEFAULT,
  setSlippageInput: () => null,
  reset: () => null,
  canProgress: true,
  errors: [],
  warnings: [],
  opened: false,
  setOpened: () => null,
}

const BASE_PROPS_CHANGED_VALUE: UserSettingsState & { opened: boolean; setOpened: () => void } = {
  ...BASE_PROPS,
  slippageInput: SLIPPAGE_OPTIONS[1],
}

stories.add('Editing start', () => {
  return (
    <StoryContainer title="Editing start Slippage">
      <UserSettingsDropdown {...BASE_PROPS} />
    </StoryContainer>
  )
})

stories.add('Editing', () => {
  return (
    <StoryContainer title="Editing Slippage">
      <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} />
    </StoryContainer>
  )
})

stories.add('In progress', () => {
  return (
    <StoryContainer title="In progress">
      <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="inProgress" />
    </StoryContainer>
  )
})

stories.add('Failure', () => {
  return (
    <StoryContainer title="Failure">
      <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="failure" />
    </StoryContainer>
  )
})

stories.add('Success', () => {
  return (
    <StoryContainer title="Success">
      <UserSettingsDropdown {...BASE_PROPS_CHANGED_VALUE} stage="success" />
    </StoryContainer>
  )
})
