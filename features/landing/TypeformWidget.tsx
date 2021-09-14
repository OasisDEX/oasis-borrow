import React, { useEffect } from 'react'

export function TypeformWidget() {
  const scriptId = 'typeform-widget'

  useEffect(() => {
    if (document.querySelector(`script#${scriptId}`) !== null) {
      return
    }
    const script = document.createElement('script')
    script.id = scriptId
    script.src = '//embed.typeform.com/next/embed.js'
    document.body.append(script)
  })

  return (
    <div
      dangerouslySetInnerHTML={{
        __html:
          '<div data-tf-sidetab="y51linBb" data-tf-width="320" data-tf-height="400" data-tf-custom-icon="https://images.typeform.com/images/VAuKfRAjPyBb" data-tf-button-color="#575CFE" data-tf-button-text="Feedback" style="all:unset;"></div>',
      }}
    />
  )
}
