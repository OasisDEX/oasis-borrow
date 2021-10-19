import React, { useEffect } from 'react'

export function TypeformWidget() {
  const scriptId = 'typeform-widget-script'

  useEffect(() => {
    if (document.querySelector(`script#${scriptId}`) !== null) {
      return
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = '//embed.typeform.com/next/embed.js'
    document.body.append(script)
  }, [])

  return (
    <div
      dangerouslySetInnerHTML={{
        __html:
          '<div data-tf-sidetab="MKux7UJB" data-tf-width="400" data-tf-height="600" data-tf-custom-icon="https://images.typeform.com/images/VAuKfRAjPyBb" data-tf-button-color="#FFFFFF" data-tf-button-text="Earn with Oasis" style="all:unset;"></div>',
      }}
    />
  )
}
