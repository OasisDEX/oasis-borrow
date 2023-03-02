import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { random } from 'lodash'
import { useEffect, useRef } from 'react'

interface Particle {
  direction: number
  element: HTMLElement
  left: number
  size: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
  top: number
}

export const useCoolMode = () => {
  const ref = useRef<HTMLElement>(null)
  const lolFeatureToggle = useFeatureToggle('🌞')

  useEffect(() => {
    if (ref.current && lolFeatureToggle) {
      return makeElementCool(ref.current)
    } else {
      return () => {}
    }
  }, [lolFeatureToggle])

  return ref
}

const getContainer = () => {
  const id = '_rk_site_coolMode'
  const existingContainer = document.getElementById(id)

  if (existingContainer) {
    return existingContainer
  }

  const container = document.createElement('div')
  container.setAttribute('id', id)
  container.setAttribute(
    'style',
    [
      'overflow:hidden',
      'position:fixed',
      'height:100%',
      'top:0',
      'left:0',
      'right:0',
      'bottom:0',
      'pointer-events:none',
      'z-index:2147483647',
    ].join(';'),
  )

  document.body.appendChild(container)

  return container
}

let instanceCounter = 0

const assetRoot = '/static/img/cool_team/'
const images = [
  '010 Chris _ CEO.png',
  '010 Soren _ Director.png',
  '015 Andrei _ CTO.png',
  '015 Joe _ CFO.png',
  '015 Lukasz _ COO.png',
  '040 Henry _ Design Lead.png',
  '050 Maria _ Marketing Lead.png',
  '055 Javier _ Community Manager.png',
  '060 Frank _ Product Manager.png',
  '060 Sam _ Product Manager.png',
  '065 Jordan _ UX Researcher.png',
  '065 Luciano _ Yield Strategist.png',
  '070 Adam _ Software Engineer.png',
  '070 Anthony _ Software Engineer.png',
  '070 Damian _ Software Engineer.png',
  '070 Jakub _ Software Engineer.png',
  '070 James _ Software Engineer.png',
  '070 Karolina _ Scrum Master.png',
  '070 Kasper _ Data Scientist.png',
  '070 Konrad _ Software Engineer.png',
  '070 Kuba _ Software Engineer.png',
  '070 Lukasz _ Software Engineer.png',
  '070 Marcin _ Software Engineer.png',
  '070 Piotr _ Software Engineer.png',
  '070 Sebastian _ Software Engineer.png',
  '080 Anna _ Product Designer.png',
  '080 Hazel _ Product Designer.png',
  '090 Gabriel _ Customer Care.png',
  '095 Hannah _ Finance Manager.png',
  '100 Alicia _ Marketing.png',
].map((fileName) => assetRoot + fileName)

function makeElementCool(element: HTMLElement): () => void {
  instanceCounter++

  // const sizes = [15, 20, 25, 35, 45].map((s) => s * 2)
  const sizes = [25, 30, 35, 45].map((s) => s * 2)
  const limit = 35

  let particles: Particle[] = []
  let autoAddParticle = false
  let mouseX = 0
  let mouseY = 0

  const container = getContainer()

  function createParticle() {
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    // const speedHorz = Math.random() * 10
    // const speedUp = Math.random() * 25
    // const spinVal = Math.random() * 360
    // const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1)

    const speedHorz = Math.random() * 5
    const speedUp = Math.random() * 5
    const spinVal = Math.random() * 360
    const spinSpeed = Math.random() * 5 * (Math.random() <= 0.5 ? -1 : 1)

    const top = mouseY - size / 2
    const left = mouseX - size / 2
    const direction = Math.random() <= 0.5 ? -1 : 1

    const particle = document.createElement('div')
    particle.innerHTML = `<img src="${
      images[random(0, images.length - 1)]
    }" width="${size}" height="${size}" style="border-radius: 25%">`
    particle.setAttribute(
      'style',
      [
        'position:absolute',
        'will-change:transform',
        `top:${top}px`,
        `left:${left}px`,
        `transform:rotate(${spinVal}deg)`,
      ].join(';'),
    )

    container.appendChild(particle)

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
    })
  }

  function updateParticles() {
    particles.forEach((p) => {
      p.left = p.left - p.speedHorz * p.direction
      p.top = p.top - p.speedUp
      // p.speedUp = Math.min(p.size, p.speedUp - 1)
      p.speedUp = Math.min(p.size, p.speedUp - 0.1)
      p.spinVal = p.spinVal + p.spinSpeed

      if (p.top >= Math.max(window.innerHeight, document.body.clientHeight) + p.size) {
        particles = particles.filter((o) => o !== p)
        p.element.remove()
      }

      p.element.setAttribute(
        'style',
        [
          'position:absolute',
          'will-change:transform',
          `top:${p.top}px`,
          `left:${p.left}px`,
          `transform:rotate(${p.spinVal}deg)`,
        ].join(';'),
      )
    })
  }

  let animationFrame: number | undefined

  function loop() {
    if (autoAddParticle && particles.length < limit) {
      createParticle()
    }

    updateParticles()
    animationFrame = requestAnimationFrame(loop)
  }

  loop()

  const isTouchInteraction =
    'ontouchstart' in window ||
    // @ts-expect-error
    navigator.msMaxTouchPoints

  const tap = isTouchInteraction ? 'touchstart' : 'mousedown'
  const tapEnd = isTouchInteraction ? 'touchend' : 'mouseup'
  const move = isTouchInteraction ? 'touchmove' : 'mousemove'

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) {
      mouseX = e.touches?.[0].clientX
      mouseY = e.touches?.[0].clientY
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
    }
  }
  let enabled = true
  const tapHandler = (e: MouseEvent | TouchEvent) => {
    if (!enabled) {
      return
    }
    updateMousePosition(e)
    autoAddParticle = true
    void audioPlayer.play().then(() => {
      console.log('🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺')
      console.log('🎺 🎺 🎺 🎺 🎺 🎺 HAARHEEH 🎺 🎺 🎺 🎺 🎺 🎺')
      console.log('🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺 🎺🎺  🎺')
    })
    audioPlayer.setAttribute('loop', '')
    document.body.appendChild(buttonElement)
  }

  const disableAutoAddParticle = () => {
    autoAddParticle = false
    audioPlayer.removeAttribute('loop')
  }

  // audio
  const audioPlayer = document.createElement('audio')
  audioPlayer.setAttribute('src', assetRoot + 'HAARHEEH.m4a')
  audioPlayer.volume = 0.1
  getContainer().appendChild(audioPlayer)

  // button
  const buttonElement = document.createElement('button')
  buttonElement.innerHTML = 'Disable'
  buttonElement.setAttribute(
    'style',
    ['position:absolute;top:0px', 'font-size: 5em', 'z-index: 1000'].join(';'),
  )
  const button = {
    top: 0,
    left: 0,
    element: buttonElement,
  }
  buttonElement.addEventListener('click', () => {
    if (enabled) {
      enabled = false
      let count = 10
      const countdown = setInterval(() => {
        const emojies = `😊 Enabling in ${count} `
        buttonElement.innerHTML = emojies
        count--
        if (count === -1) {
          clearInterval(countdown)
          enabled = true
          buttonElement.innerHTML = 'Disable'
        }
      }, 500)
    }
  })

  let vDirection = 1
  let hDirection = 1
  const buttonSpeed = 7

  function loopButton() {
    if (enabled) {
      if (
        button.top + button.element.offsetHeight + 10 >= // prevent flashing scrollbar in chrome
        document.documentElement.clientHeight
      ) {
        vDirection = -1
      }

      if (button.top <= 0) {
        vDirection = 1
      }

      if (button.left + button.element.offsetWidth >= document.documentElement.clientWidth) {
        hDirection = -1
      }

      if (button.left <= 0) {
        hDirection = 1
      }

      button.top = button.top + buttonSpeed * vDirection
      button.left = button.left + buttonSpeed * hDirection

      buttonElement.style.top = `${button.top}px`
      buttonElement.style.left = `${button.left}px`
    }

    requestAnimationFrame(loopButton)
  }

  loopButton()

  element.addEventListener(move, updateMousePosition, { passive: true })
  element.addEventListener(tap, tapHandler, { passive: true })
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true })
  element.addEventListener('mouseleave', disableAutoAddParticle, {
    passive: true,
  })

  return () => {
    element.removeEventListener(move, updateMousePosition)
    element.removeEventListener(tap, tapHandler)
    element.removeEventListener(tapEnd, disableAutoAddParticle)
    element.removeEventListener('mouseleave', disableAutoAddParticle)

    // Cancel animation loop once animations are done
    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame)
        clearInterval(interval)

        // Clean up container if this is the last instance
        if (--instanceCounter === 0) {
          container.remove()
        }
      }
    }, 500)
  }
}
