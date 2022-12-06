import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import React from 'react'
import { Box, Text, ThemeProvider } from 'theme-ui'

function AjnaPage() {
  return (
    <WithFeatureToggleRedirect feature="Ajna">
      <Box sx={{ width: '100%' }}>
        <Text sx={{ backgroundColor: 'interactive100' }}>
          Text component with background set to interactive100
        </Text>
        <Text sx={{ backgroundColor: 'interactive50' }}>
          Text component with background set to interactive50
        </Text>
        <ThemeProvider
          theme={{
            colors: {
              interactive100: '#b5179e',
            },
          }}
        >
          <Text sx={{ backgroundColor: 'interactive100' }}>
            Text component with background set to interactive100, with overwriting ThemeProvider
          </Text>
          <Text sx={{ backgroundColor: 'interactive50' }}>
            Text component with background set to interactive100, with overwriting ThemeProvider
          </Text>
        </ThemeProvider>
      </Box>
    </WithFeatureToggleRedirect>
  )
}

export default AjnaPage
