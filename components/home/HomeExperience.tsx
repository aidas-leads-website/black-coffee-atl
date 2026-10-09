'use client'

import { useEffect } from 'react'
import type { RecordGL, RecordState } from './record3d'

// Scenes: 0 arrival, 1 drop, 2 side A, 3 matcha, 4 flip, 5 wall, 6 room, 7 story, 8 visit.
// Each channel is a list of [scene time, value] keys, eased between with smoothstep.
const K: Record<string, Array<[number, number]>> = {
  elev: [[0, 20], [0.8, 20], [1.75, 89.4], [8.1, 89.4], [8.5, 20]],
  ty: [[0, 0.62], [0.8, 0.62], [1.75, 1.5], [8.1, 1.5], [8.5, 0.62]],
  discY: [[0, 1.05], [0.85, 1.05], [1.25, 1.5], [8.3, 1.5], [8.45, 1.05]],
  discR: [[0, 0.865], [1.2, 0.865], [1.75, 1.35], [8.05, 1.35], [8.25, 0.865]],
  cupY: [[0, 0], [1.25, 0], [1.9, -5], [8.05, -5], [8.35, 0]],
  groove: [[0, 0], [1.15, 0], [1.8, 1], [3.1, 1], [3.4, 0.22], [3.72, 0.22], [4.02, 1], [8.1, 1], [8.35, 0]],
  matcha: [[0, 0], [3.08, 0], [3.4, 1], [3.72, 1], [4.0, 0]],
  arm: [[0, 0], [1.95, 0], [2.12, 1], [2.88, 1], [3.02, 0]],
  flip: [[0, 0], [4.2, 0], [4.85, 1], [7.85, 1], [8.1, 0]],
  bg: [[0, 0], [4.3, 0], [4.8, 1], [7.8, 1], [8.05, 0]],
  badge: [[0, 0], [4.9, 0], [5.2, 1], [7.75, 1], [8.0, 0]],
  steam: [[0, 1], [0.75, 1], [1.0, 0], [8.4, 0], [8.6, 1]],
  zoom: [[0, 1.4], [0.8, 1.4], [1.75, 1], [8.1, 1], [8.5, 1.4]],
}
const KEYS = Object.keys(K)
const CREMA = '#B98A4E'
const MATCHA = '#7A9B3B'

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
function sample(keys: Array<[number, number]>, t: number) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1]
    const b = keys[i]
    if (t <= b[0]) {
      let u = (t - a[0]) / (b[0] - a[0])
      u = u * u * (3 - 2 * u)
      return a[1] + (b[1] - a[1]) * u
    }
  }
  return keys[keys.length - 1][1]
}
const hexRGB = (h: string): [number, number, number] => [
  parseInt(h.substr(1, 2), 16) / 255,
  parseInt(h.substr(3, 2), 16) / 255,
  parseInt(h.substr(5, 2), 16) / 255,
]

/** Does this device qualify for the Full (3D) level? Otherwise it gets Light: the flat SVG record. */
function canRun3D() {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
    if (nav.connection?.saveData) return false
    if (nav.deviceMemory && nav.deviceMemory < 4) return false
    // A software renderer (no GPU, as in many lab tools and low-end devices) would draw on the CPU
    // and block input, so it gets the Light level instead.
    const c = document.createElement('canvas')
    const ctx = c.getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!ctx) return false
    const info = ctx.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    ctx.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)
  } catch {
    return false
  }
}

/**
 * The home page's scroll choreography (F7). It reads and decorates the server-rendered
 * markup; it never writes copy, so every level of the page carries the same words.
 */
export function HomeExperience() {
  useEffect(() => {
    const d = document
    const root = d.documentElement
    const body = d.body
    const $ = <T extends Element = HTMLElement>(s: string) => d.querySelector<T>(s)
    const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(d.querySelectorAll<T>(s))

    const homeEl = $('main.home')!
    const stage = $('.home .stage')!
    const inner = $('.home .stage-inner')!
    const sleeve = $('.home .sleeve')!
    const ground = $('.home .ground')!
    const poster = $<SVGSVGElement>('.home .poster')!
    const canvas = $<HTMLCanvasElement>('#gl')!
    const scenes = $$('[data-scene]')
    const trackLis = $$('#tracks li')
    const trackBtns = $$<HTMLButtonElement>('#tracks .track')
    const dots = $$('.dots span')
    const wallTrack = $('.track-x')
    const steps = $$('.step')
    const routeLine = $('.route-line')
    const stops = $$('.stops li')
    const pauseBtn = $<HTMLButtonElement>('#pauseBtn')!
    if (!stage || !scenes.length) return

    const TRACK_RGB = trackLis.map((li) => hexRGB(getComputedStyle(li).getPropertyValue('--c').trim() || CREMA))
    const CREMA_RGB = hexRGB(CREMA)
    const MATCHA_RGB = hexRGB(MATCHA)

    let vw = 0
    let vh = 0
    let isWide = true
    let tops: number[] = []
    let heights: number[] = []
    let badgeX = 0
    let badgeY = 0
    let badgeScale = 0.25
    let wipeR = 0
    let wallMax = 0
    const dims = { stageW: 0, stageH: 0, stageCX: 0, stageCY: 0, isWide: true }

    let still = root.classList.contains('still')
    let paused = false
    let gl: RecordGL | null = null
    let glLoading = false
    let glDisabled = false // once stepped down to Light, never back up in this visit
    let disposed = false

    const S: RecordState = {
      cur: null,
      spin: 0,
      tint: [0.725, 0.541, 0.306],
      sip: 0,
      tiltX: 0,
      tiltZ: 0,
      activeTrack: -1,
      needleP: 0.08,
    }
    let tS = 0
    let spinVel = 0
    let lastScroll = 0
    let lastNow = 0
    let raf = 0
    let ptrX = 0
    let ptrY = 0
    let lastSide: boolean | null = null
    let lastBadge: boolean | null = null
    let lastActive = -2
    let lastStageNow = -1

    function measure() {
      vw = innerWidth
      vh = innerHeight
      isWide = vw >= 900
      const sy = scrollY || 0
      tops = scenes.map((s) => s.getBoundingClientRect().top + sy)
      heights = scenes.map((s) => Math.max(1, s.offsetHeight))
      dims.isWide = isWide
      dims.stageW = isWide ? vw * 0.56 : vw
      dims.stageH = isWide ? vh : stage.offsetHeight
      dims.stageCX = isWide ? vw - dims.stageW / 2 : vw / 2
      dims.stageCY = dims.stageH / 2
      const recPx = 0.8 * Math.min(dims.stageW, dims.stageH)
      badgeScale = clamp(150 / recPx, 0.12, 1)
      badgeX = vw - 104 - dims.stageCX
      badgeY = vh - 104 - dims.stageCY
      wipeR = Math.sqrt(vw * vw + vh * vh) * 1.05
      wallMax = wallTrack ? Math.max(0, wallTrack.scrollWidth - vw) : 0
      gl?.resize()
    }
    function sceneT(frac = 0.5) {
      const y = (scrollY || 0) + vh * frac
      let i = 0
      for (let k = 0; k < tops.length; k++) if (y >= tops[k]) i = k
      const l = (y - tops[i]) / heights[i]
      return clamp(i + (i === tops.length - 1 ? l : Math.min(l, 0.9999)), 0, 9)
    }
    const local = (t: number, i: number) => clamp(t - i, 0, 1)

    function setClasses(bg: number, badge: number) {
      const side = bg > 0.5
      const bd = badge > 0.5
      if (side !== lastSide) {
        body.classList.toggle('side-b', side)
        lastSide = side
      }
      if (bd !== lastBadge) {
        body.classList.toggle('badge-on', bd)
        lastBadge = bd
      }
    }
    function setActive(idx: number) {
      if (idx === lastActive) return
      lastActive = idx
      for (let i = 0; i < trackLis.length; i++) {
        trackLis[i].classList.toggle('on', i === idx)
        dots[i]?.classList.toggle('on', i === idx)
        trackBtns[i].setAttribute('aria-current', i === idx ? 'true' : 'false')
      }
    }

    /* Still level: classes only, on scroll. Sides switch and the record hides on section boundaries. */
    function stillUpdate() {
      const t = sceneT()
      const tHigh = sceneT(0.22)
      setClasses(t >= 4.5 && tHigh < 8 ? 1 : 0, t >= 5 && tHigh < 8 ? 1 : 0)
    }
    function clearInline() {
      for (const el of [stage, inner, sleeve, ground, wallTrack, poster, routeLine] as Array<HTMLElement | SVGElement | null>) {
        if (el) {
          el.style.transform = ''
          el.style.clipPath = ''
        }
      }
      steps.forEach((s) => (s.style.transform = ''))
      stops.forEach((s) => s.classList.remove('on'))
      homeEl.style.removeProperty('--stage-now')
      lastStageNow = -1
      lastActive = -2
      trackLis.forEach((li) => li.classList.remove('on'))
      trackBtns.forEach((b) => b.removeAttribute('aria-current'))
    }

    /* Full and Light levels: every frame */
    function update(dt: number) {
      const t = sceneT()
      const k = 1 - Math.exp(-dt / 0.16)
      if (!S.cur) {
        S.cur = {}
        for (const key of KEYS) S.cur[key] = sample(K[key], t)
        tS = t
      } else {
        for (const key of KEYS) S.cur[key] += (sample(K[key], t) - S.cur[key]) * k
        tS += (t - tS) * k
      }
      const cur = S.cur

      // Tracklist: the needle steps inward one drink at a time.
      const l2 = local(t, 2)
      let idx = -1
      if (t >= 2.06 && t <= 2.94) idx = clamp(Math.floor(clamp((l2 - 0.13) / 0.74, 0, 0.9999) * 6), 0, 5)
      S.activeTrack = idx
      setActive(idx)
      const np = idx >= 0 ? (idx + 0.5) / 6 : 0.08
      S.needleP += (np - S.needleP) * (1 - Math.exp(-dt / 0.22))

      // Label colour
      const target = cur.matcha > 0.5 ? MATCHA_RGB : idx >= 0 ? TRACK_RGB[idx] : CREMA_RGB
      const kc = 1 - Math.exp(-dt / 0.25)
      for (let i = 0; i < 3; i++) S.tint[i] += (target[i] - S.tint[i]) * kc

      // Spin: idle at 33 1/3 rpm once it is a record, plus a push from scroll speed.
      const sy = scrollY || 0
      const ds = sy - lastScroll
      lastScroll = sy
      spinVel += ds * 0.0009
      spinVel *= Math.exp(-dt / 0.35)
      S.spin += ((paused ? 0 : 3.49) * cur.groove + spinVel * 60 * cur.groove) * dt

      if (S.sip > 0) S.sip = Math.max(0, S.sip - dt / 0.6)
      S.tiltX += (ptrY * 0.07 - S.tiltX) * kc
      S.tiltZ += (-ptrX * 0.07 - S.tiltZ) * kc

      setClasses(cur.bg, cur.badge)
      if (isWide) {
        ground.style.clipPath = `circle(${(cur.bg * wipeR).toFixed(1)}px at ${dims.stageCX.toFixed(1)}px ${dims.stageCY.toFixed(1)}px)`
        sleeve.style.transform = `translate3d(${(-101 * cur.badge).toFixed(2)}%,0,0)`
        inner.style.transform = `translate3d(${(badgeX * cur.badge).toFixed(1)}px,${(badgeY * cur.badge).toFixed(1)}px,0) scale(${(1 - (1 - badgeScale) * cur.badge).toFixed(4)})`
        stage.style.transform = ''
        if (lastStageNow !== -1) {
          homeEl.style.removeProperty('--stage-now')
          lastStageNow = -1
        }
        let qw = clamp((local(tS, 5) - 0.19) / 0.62, 0, 1)
        if (tS < 5) qw = 0
        if (tS >= 6) qw = 1
        if (wallTrack) wallTrack.style.transform = `translate3d(${(-qw * wallMax).toFixed(1)}px,0,0)`
      } else {
        inner.style.transform = ''
        stage.style.transform = `translate3d(0,${(-100 * cur.badge).toFixed(2)}%,0)`
        const sn = Math.round(dims.stageH * (1 - cur.badge))
        if (sn !== lastStageNow) {
          homeEl.style.setProperty('--stage-now', `${sn}px`)
          lastStageNow = sn
        }
      }
      // The stair stripe rises one step at a time.
      const qs = tS < 6 ? 0 : tS >= 7 ? 1 : clamp((local(tS, 6) - 0.02) / 0.42, 0, 1)
      for (let i = 0; i < steps.length; i++) steps[i].style.transform = `scaleY(${clamp(qs * 6 - i, 0, 1).toFixed(3)})`
      // The route line draws itself between the three stops.
      const qr = tS < 7 ? 0 : tS >= 8 ? 1 : clamp((local(tS, 7) - 0.05) / (isWide ? 0.45 : 0.8), 0, 1)
      if (routeLine) routeLine.style.transform = isWide ? `scaleX(${qr.toFixed(3)})` : `scaleY(${qr.toFixed(3)})`
      for (let i = 0; i < stops.length; i++) stops[i].classList.toggle('on', qr > 0.01 && qr >= i / 2 - 0.02)

      // Light level: turn and flip the flat record.
      if (!gl) {
        poster.style.transform = `rotate(${((S.spin * 57.2958) % 360).toFixed(1)}deg) scaleY(${Math.max(0.04, Math.abs(Math.cos(cur.flip * Math.PI))).toFixed(3)})`
      }
    }

    // Frame-rate watchdog: lower the pixel ratio first, then step down to Light.
    let slow = 0
    let frames = 0
    let strikes = 0
    function frame(now: number) {
      raf = requestAnimationFrame(frame)
      let dt = Math.min(0.05, (now - (lastNow || now)) / 1000)
      lastNow = now
      if (!dt) dt = 0.016
      update(dt)
      if (gl) {
        gl.render(dt)
        frames++
        slow += dt
        if (frames === 60) {
          if (slow / frames > 0.034) {
            strikes++
            if (!gl.lowerQuality() || strikes > 2) dropToLight()
          }
          frames = 0
          slow = 0
        }
      }
    }
    function start() {
      if (!raf && !still && !d.hidden && !disposed) {
        lastNow = 0
        lastScroll = scrollY || 0
        raf = requestAnimationFrame(frame)
      }
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }
    function dropToLight() {
      glDisabled = true
      gl?.dispose()
      gl = null
      body.classList.remove('gl-on')
    }

    function loadGL() {
      if (gl || glLoading || glDisabled || still || !canRun3D()) return
      glLoading = true
      import('./record3d')
        .then(({ createRecord }) => {
          glLoading = false
          if (disposed || still || glDisabled) return
          gl = createRecord(canvas, S, dims, {
            onFirstFrame: () => {
              body.classList.add('gl-on')
              poster.style.transform = ''
            },
            onLost: () => dropToLight(),
          })
          if (gl) gl.resize()
          else glDisabled = true
        })
        .catch(() => {
          glLoading = false
          glDisabled = true
        })
    }

    function applyMode() {
      still = root.classList.contains('still')
      pauseBtn.hidden = still
      if (still) {
        stop()
        clearInline()
        S.cur = null
        measure()
        stillUpdate()
      } else {
        lastSide = null
        lastBadge = null
        measure()
        start()
        // 3D loads last: after first paint and when the browser is idle (P6).
        const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
        if (ric) ric(loadGL, { timeout: 2500 })
        else setTimeout(loadGL, 1200)
      }
    }

    /* Events */
    const onScroll = () => {
      if (still) stillUpdate()
    }
    let rz = 0
    const onResize = () => {
      clearTimeout(rz)
      rz = window.setTimeout(() => {
        measure()
        if (still) stillUpdate()
      }, 80)
    }
    const onLoad = () => {
      measure()
      if (still) stillUpdate()
    }
    const onVis = () => (d.hidden ? stop() : start())
    const onPointer = (ev: PointerEvent) => {
      if (!isWide || ev.pointerType === 'touch') return
      ptrX = clamp((ev.clientX - dims.stageCX) / (dims.stageW / 2), -1, 1)
      ptrY = clamp((ev.clientY - dims.stageCY) / (dims.stageH / 2), -1, 1)
    }
    const trackHandlers = trackBtns.map((b, i) => {
      const h = () => {
        if (still) return
        const l = 0.13 + (0.74 * (i + 0.5)) / 6
        scrollTo({ top: tops[2] + l * heights[2] - vh * 0.5, behavior: 'smooth' })
      }
      b.addEventListener('click', h)
      return h
    })
    const orderLinks = $$('main.home [data-order]')
    const onSip = () => {
      S.sip = 1
    }
    orderLinks.forEach((a) => a.addEventListener('pointerdown', onSip))
    const onPause = () => {
      paused = !paused
      pauseBtn.textContent = paused ? 'Play the record' : 'Pause the record'
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false')
    }
    pauseBtn.addEventListener('click', onPause)
    const onMotion = () => applyMode()
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const onMq = () => {
      let pref: string | null = null
      try {
        pref = localStorage.getItem('bca-motion')
      } catch {}
      if (!pref) {
        root.classList.toggle('still', mq.matches)
        applyMode()
      }
    }

    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    addEventListener('load', onLoad)
    addEventListener('pointermove', onPointer, { passive: true })
    addEventListener('bca:motion', onMotion)
    d.addEventListener('visibilitychange', onVis)
    mq.addEventListener?.('change', onMq)
    d.fonts?.ready.then(() => !disposed && measure())

    // Re-measure scene positions whenever the page's layout changes size (fonts, images, zoom).
    const io = new ResizeObserver(() => measure())
    io.observe(homeEl)

    measure()
    applyMode()

    return () => {
      disposed = true
      stop()
      io.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      removeEventListener('load', onLoad)
      removeEventListener('pointermove', onPointer)
      removeEventListener('bca:motion', onMotion)
      d.removeEventListener('visibilitychange', onVis)
      mq.removeEventListener?.('change', onMq)
      trackBtns.forEach((b, i) => b.removeEventListener('click', trackHandlers[i]))
      orderLinks.forEach((a) => a.removeEventListener('pointerdown', onSip))
      pauseBtn.removeEventListener('click', onPause)
      gl?.dispose()
      gl = null
      clearInline()
      body.classList.remove('side-b', 'badge-on', 'gl-on')
    }
  }, [])

  return null
}
