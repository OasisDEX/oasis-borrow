import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { useExampleState } from 'helpers/useStateReducer'
import React, { useEffect } from 'react'
import { Box, Button } from 'theme-ui'

function AjnaPage() {
  const { state, dispatch, updateState } = useExampleState()

  useEffect(() => {
    console.log('state: ')
    console.log(state)
  }, [state])

  return (
    <WithFeatureToggleRedirect feature="Ajna">
      <Box sx={{ width: '100%' }}>
        <Button
          onClick={() => {
            dispatch({ type: 'increment' })
          }}
        >
          +1 in state
        </Button>
        <Button
          onClick={() => {
            updateState('foo', (Math.random() + 1).toString(36).substring(7))
          }}
        >
          Update string to something random
        </Button>
      </Box>
    </WithFeatureToggleRedirect>
  )
}

export default AjnaPage
