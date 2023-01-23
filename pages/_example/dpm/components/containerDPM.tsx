import React, { useEffect, useState } from 'react'
import { map } from 'rxjs/operators'
import { Box, Container, Grid } from 'theme-ui'

import { DetailsSection } from '../../../../components/DetailsSection'
import { TabBar } from '../../../../components/TabBar'
import { CreateDPMAccountView } from '../../../../features/stateMachines/dpmAccount'
import { useObservable } from '../../../../helpers/observableHook'
import { useDpmContext } from './dpmProvider'
export function DPMLog() {
  const { states$, dpmAccounts$ } = useDpmContext()
  const onlyEvents = states$.pipe(map((state) => state.event))
  const [state] = useObservable(onlyEvents)
  const [dpms] = useObservable(dpmAccounts$)
  const [content, setContent] = useState<string[]>([])
  useEffect(() => {
    setContent([...content, state?.type || ''])
  }, [state])
  return (
    <DetailsSection
      title={'LOG'}
      content={
        <Box>
          {content.map((c, index) => (
            <Box key={index}>{c}</Box>
          ))}
          <Box>{`Created DPM: ${dpms?.vaultId}, Proxy Address: ${dpms?.proxy}`}</Box>
        </Box>
      }
    ></DetailsSection>
  )
}

export function ContainerDPM() {
  const { stateMachine } = useDpmContext()

  return (
    <Container>
      <TabBar
        sections={[
          {
            value: 'simulate',
            label: 'Test',
            content: (
              <Grid variant="vaultContainer">
                <Box>
                  <DPMLog></DPMLog>
                </Box>
                <Box>
                  <CreateDPMAccountView machine={stateMachine} />
                </Box>
              </Grid>
            ),
          },
        ]}
        variant={'underline'}
      />
    </Container>
  )
}
