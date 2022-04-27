import { Global } from '@emotion/core'
import { Popover, Sidetab } from '@typeform/embed-react'
import { useLocalStorage } from 'helpers/useLocalStorage'
import React from 'react'
import { useBreakpointIndex } from 'theme/useBreakpointIndex'

const typeformPopoverButton = '.tf-v1-popover .tf-v1-popover-button'

type SurveyConfig = { id: string; title: string; color: string }

export function SurveyButtons({ id, title, color }: SurveyConfig) {
  const breakpoint = useBreakpointIndex()

  const [closedSurveys, setClosedSurveys] = useLocalStorage('closed-surveys', [])
  const wasClosed = closedSurveys.includes(id)

  return (
    <>
      {breakpoint <= 1 && !wasClosed && (
        <>
          {breakpoint === 0 && (
            <Global
              styles={() => ({
                [typeformPopoverButton]: {
                  bottom: '77px',
                  right: '14px',
                },
              })}
            />
          )}

          <Popover
            id={id}
            buttonColor={color}
            shareGaInstance={true}
            onClose={() => setClosedSurveys([...closedSurveys, id])}
          />
        </>
      )}
      {breakpoint > 1 && !wasClosed && (
        <Sidetab
          id={id}
          buttonText={title}
          buttonColor={color}
          shareGaInstance={true}
          onClose={() => setClosedSurveys([...closedSurveys, id])}
        >
          {title}
        </Sidetab>
      )}
    </>
  )
}
