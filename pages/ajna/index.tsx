import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { useExampleState } from 'helpers/useStateReducer'
import React from 'react'
import { Box, Button } from 'theme-ui'

function AjnaPage() {
  const { exampleState, dispatchExampleState, updateExampleState } = useExampleState()

  return (
    <WithFeatureToggleRedirect feature="Ajna">
      <Box sx={{ width: '100%' }}>
        <Button
          onClick={() => {
            dispatchExampleState({ type: 'increment' })
          }}
        >
          +1 in state
        </Button>
        <Button
          onClick={() => {
            updateExampleState('foo', (Math.random() + 1).toString(36).substring(7))
          }}
        >
          Update string to something random
        </Button>
        <pre>{JSON.stringify(exampleState)}</pre>
      </Box>
    </WithFeatureToggleRedirect>
  )
}

export default AjnaPage
