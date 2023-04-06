import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import React, { useEffect, useRef } from 'react'

export function SillyVideo({
  playVideo,
  onVideoEnd,
}: {
  playVideo: boolean
  onVideoEnd: () => void
}) {
  const vidRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!document.createElement('video').canPlayType('video/webm')) {
      onVideoEnd()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    if (playVideo && vidRef.current) {
      void vidRef.current.play()
    }
  }, [playVideo])
  return (
    <video
      style={{
        width: '80%',
        marginLeft: '10%',
        height: '270px',
        borderRadius: '22px',
        pointerEvents: 'none',
      }}
      ref={vidRef}
      disablePictureInPicture
      disableRemotePlayback
      onEnded={onVideoEnd}
    >
      <source
        src={staticFilesRuntimeUrl('/static/img/gas_pump_animation.webm')}
        type="video/webm"
      />
      Sorry, your browser doesn't support videos.
    </video>
  )
}
