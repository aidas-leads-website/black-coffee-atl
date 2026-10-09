// The 3D piece: a ceramic cup of black coffee whose surface becomes a record (Design: "The 3D piece").
// Loaded with a dynamic import after first paint, and only on devices that qualify (P6).
// No text is drawn in the canvas except the decorative label ring; all meaning is in the HTML (X2).
import {
  AmbientLight,
  CanvasTexture,
  CircleGeometry,
  ColorManagement,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  LatheGeometry,
  LinearSRGBColorSpace,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  BoxGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from 'three'
import { STAIRS } from '../StairStripe'

export type RecordState = {
  cur: Record<string, number> | null
  spin: number
  tint: [number, number, number]
  sip: number
  tiltX: number
  tiltZ: number
  activeTrack: number
  needleP: number
}
export type StageDims = { stageW: number; stageH: number; stageCX: number; stageCY: number; isWide: boolean }
export type RecordGL = {
  render: (dt: number) => void
  resize: () => void
  lowerQuality: () => boolean
  dispose: () => void
}

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

function ringText(c: CanvasRenderingContext2D, text: string, radius: number, size: number, bottom: boolean) {
  c.font = `800 ${size}px Archivo, Arial, sans-serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  const gap = size * 0.08
  const widths = Array.from(text).map((ch) => c.measureText(ch).width + gap)
  const total = widths.reduce((a, b) => a + b, 0)
  let ang = -(total / radius) / 2
  for (let i = 0; i < text.length; i++) {
    const a = ang + widths[i] / radius / 2
    c.save()
    if (bottom) {
      c.rotate(-a)
      c.translate(0, radius)
    } else {
      c.rotate(a)
      c.translate(0, -radius)
    }
    c.fillText(text[i], 0, 0)
    c.restore()
    ang += widths[i] / radius
  }
}
function drawLabelA(cv: HTMLCanvasElement) {
  const c = cv.getContext('2d')!
  const S = cv.width
  c.clearRect(0, 0, S, S)
  c.save()
  c.translate(S / 2, S / 2)
  c.fillStyle = 'rgba(26,15,10,.95)'
  c.strokeStyle = 'rgba(26,15,10,.55)'
  c.lineWidth = S * 0.006
  c.beginPath()
  c.arc(0, 0, S * 0.465, 0, 6.2832)
  c.stroke()
  c.beginPath()
  c.arc(0, 0, S * 0.2, 0, 6.2832)
  c.stroke()
  ringText(c, 'BLACK COFFEE ATL', S * 0.335, S * 0.105, false)
  ringText(c, 'SIDE A', S * 0.335, S * 0.08, true)
  c.restore()
}
function drawLabelB(cv: HTMLCanvasElement) {
  const c = cv.getContext('2d')!
  const S = cv.width
  c.clearRect(0, 0, S, S)
  c.save()
  c.translate(S / 2, S / 2)
  c.fillStyle = '#F2F3F0'
  c.beginPath()
  c.arc(0, 0, S * 0.5, 0, 6.2832)
  c.fill()
  const w = S * 0.085
  const h = S * 0.042
  const x0 = -3 * w
  const y0 = S * 0.13
  for (let i = 0; i < 6; i++) {
    c.fillStyle = STAIRS[i]
    c.fillRect(x0 + i * w, y0 - (i + 1) * h, w + 1, (i + 1) * h)
  }
  c.fillStyle = 'rgba(26,15,10,.95)'
  ringText(c, 'BLACK COFFEE ATL', S * 0.36, S * 0.085, false)
  ringText(c, 'SIDE B', S * 0.36, S * 0.075, true)
  c.restore()
}
function softDot(size: number, inner: string, outer: string) {
  const cv = document.createElement('canvas')
  cv.width = cv.height = size
  const c = cv.getContext('2d')!
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(1, outer)
  c.fillStyle = g
  c.fillRect(0, 0, size, size)
  return cv
}

const VERT = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
const FRAG = /* glsl */ `
precision highp float;
uniform float uGroove,uMatcha,uTime,uSpin,uDir,uActive,uLightAng;
uniform vec3 uTint; uniform sampler2D uLabel; varying vec2 vUv;
void main(){
  vec2 p=(vUv-0.5)*2.0; float r=length(p); float a=atan(p.y,p.x);
  float wa=a+uDir*uSpin; vec2 wp=r*vec2(cos(wa),sin(wa));
  // liquid
  vec3 coffee=vec3(0.085,0.042,0.024);
  float rip=sin(r*30.0-uTime*1.4)*0.5+0.5;
  vec3 liquid=coffee+vec3(0.045,0.026,0.012)*rip*r;
  liquid=mix(liquid,vec3(0.62,0.44,0.24),smoothstep(0.86,1.0,r)*0.6);
  float blob=smoothstep(0.42,0.0,length(wp-vec2(-0.28,-0.38)));
  liquid+=vec3(0.55,0.47,0.38)*blob*0.2;
  // matcha, whisked in a spiral
  float sw=sin(wa*2.0+r*11.0-uTime*0.5+uMatcha*4.0)*0.5+0.5;
  vec3 mat=mix(vec3(0.36,0.47,0.16),vec3(0.66,0.78,0.42),sw*smoothstep(0.05,0.9,r)*0.8+0.1);
  mat=mix(mat,vec3(0.80,0.88,0.66),smoothstep(0.9,1.0,r)*0.5);
  mat+=vec3(0.3)*blob*0.25;
  liquid=mix(liquid,mat,uMatcha);
  // vinyl
  float g=sin(r*240.0)*0.5+0.5;
  vec3 vinyl=vec3(0.03)+vec3(0.028)*g;
  float sheen=pow(abs(cos(wa-uLightAng)),18.0);
  float sheen2=pow(abs(cos(wa-uLightAng-1.1)),40.0);
  float bodyM=smoothstep(0.36,0.42,r);
  vinyl+=vec3(0.62,0.58,0.52)*sheen*(0.18+0.34*g)*bodyM;
  vinyl+=vec3(0.30,0.32,0.38)*sheen2*0.25*bodyM;
  float tw=(0.95-0.40)/6.0; float tr=(0.95-r)/tw;
  float inBand=step(0.40,r)*step(r,0.95);
  float gap=smoothstep(0.06,0.0,abs(fract(tr+0.5)-0.5))*inBand;
  vinyl=mix(vinyl,vec3(0.018),gap*0.85);
  float act=inBand*(1.0-step(0.5,abs(floor(tr)-uActive)));
  vinyl+=uTint*act*(0.11+0.24*sheen+0.06*g);
  vinyl=mix(vinyl,vec3(0.02),smoothstep(0.955,0.97,r)*0.6);
  vinyl+=vec3(0.30,0.24,0.16)*smoothstep(0.978,0.995,r)*(0.35+0.65*sheen);
  // label
  vec2 luv=clamp(p/0.34*0.5+0.5,0.0,1.0); vec4 lt=texture2D(uLabel,luv);
  vec3 label=mix(uTint,lt.rgb,lt.a)*(0.93+0.07*sheen);
  vec3 rec=mix(vinyl,label,smoothstep(0.345,0.335,r));
  rec=mix(vec3(0.01),rec,smoothstep(0.018,0.026,r));
  gl_FragColor=vec4(mix(liquid,rec,uGroove),1.0);
}`

const PI = Math.PI

export function createRecord(
  canvas: HTMLCanvasElement,
  S: RecordState,
  dims: StageDims,
  hooks: { onFirstFrame: () => void; onLost: () => void },
): RecordGL | null {
  // Match the art direction's unmanaged colour, as authored.
  ColorManagement.enabled = false
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }
  renderer.outputColorSpace = LinearSRGBColorSpace
  // P9: pixel ratio capped at 2 on desktop and 1.5 on phones.
  let dpr = Math.min(window.devicePixelRatio || 1, dims.isWide ? 2 : 1.5)
  renderer.setPixelRatio(dpr)
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  const FOV = 32
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 60)
  scene.add(new AmbientLight(0xffffff, 0.42 * PI))
  const key = new DirectionalLight(0xfff4e6, 0.62 * PI)
  key.position.set(2.5, 5, 3.5)
  scene.add(key)
  const rim = new DirectionalLight(0xb98a4e, 0.35 * PI)
  rim.position.set(-4, 2, -3)
  scene.add(rim)

  // Cup, handle and saucer
  const cup = new Group()
  scene.add(cup)
  const ceramic = new MeshStandardMaterial({ color: 0xe9e8e3, roughness: 0.36, metalness: 0, side: DoubleSide })
  const lathe = (pts: number[][], seg: number) => new LatheGeometry(pts.map((p) => new Vector2(p[0], p[1])), seg)
  cup.add(new Mesh(lathe([[0, 0], [0.7, 0], [0.74, 0.04], [0.98, 1.22], [1.0, 1.3], [0.95, 1.3], [0.9, 1.2], [0.68, 0.12], [0, 0.1]], 72), ceramic))
  const handle = new Mesh(new TorusGeometry(0.36, 0.075, 14, 40, PI), ceramic)
  handle.rotation.z = -PI / 2
  handle.position.set(0.82, 0.68, 0)
  cup.add(handle)
  cup.add(new Mesh(lathe([[0, -0.06], [1.2, -0.06], [1.52, 0.04], [1.55, 0.09], [1.5, 0.1], [1.15, 0.0], [0, 0.0]], 72), ceramic))

  // Coffee surface that becomes the record. Top cap is Side A, bottom cap is Side B.
  const cvA = document.createElement('canvas')
  const cvB = document.createElement('canvas')
  cvA.width = cvA.height = cvB.width = cvB.height = 512
  drawLabelA(cvA)
  drawLabelB(cvB)
  const texA = new CanvasTexture(cvA)
  const texB = new CanvasTexture(cvB)
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  texA.anisotropy = texB.anisotropy = aniso
  const capMat = (tex: Texture, dir: number) =>
    new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uGroove: { value: 0 },
        uMatcha: { value: 0 },
        uTime: { value: 0 },
        uSpin: { value: 0 },
        uDir: { value: dir },
        uActive: { value: -1 },
        uLightAng: { value: 0.6 },
        uTint: { value: new Vector3(0.725, 0.541, 0.306) },
        uLabel: { value: tex },
      },
    })
  const matA = capMat(texA, 1)
  const matB = capMat(texB, -1)
  const flipG = new Group()
  scene.add(flipG)
  const disc = new Mesh(new CylinderGeometry(1, 1, 0.04, 128, 1), [new MeshBasicMaterial({ color: 0x0a0a0a }), matA, matB])
  flipG.add(disc)
  document.fonts?.ready.then(() => {
    drawLabelA(cvA)
    drawLabelB(cvB)
    texA.needsUpdate = true
    texB.needsUpdate = true
  })

  // Painted contact shadow under the record on the light ground
  const shadowTex = new CanvasTexture(softDot(128, 'rgba(26,15,10,.55)', 'rgba(26,15,10,0)'))
  const shadow = new Mesh(new CircleGeometry(1, 48), new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0 }))
  shadow.rotation.x = -PI / 2
  scene.add(shadow)

  // Tonearm
  const PX = 1.5
  const PZ = -1.3
  const D = Math.sqrt(PX * PX + PZ * PZ)
  const L = 1.82
  const phiC = Math.atan2(PZ / D, -PX / D)
  const arm = new Group()
  const armTilt = new Group()
  arm.add(armTilt)
  scene.add(arm)
  const metal = new MeshStandardMaterial({ color: 0xc9ccc6, roughness: 0.4, metalness: 0.1 })
  const brass = new MeshStandardMaterial({ color: 0xb98a4e, roughness: 0.45, metalness: 0.1 })
  const tube = new Mesh(new CylinderGeometry(0.022, 0.022, L + 0.3, 12), metal)
  tube.rotation.z = PI / 2
  tube.position.x = (L - 0.3) / 2
  armTilt.add(tube)
  const head = new Mesh(new BoxGeometry(0.2, 0.05, 0.11), brass)
  head.position.set(L, -0.035, 0)
  armTilt.add(head)
  const weight = new Mesh(new CylinderGeometry(0.07, 0.07, 0.2, 20), brass)
  weight.rotation.z = PI / 2
  weight.position.x = -0.26
  armTilt.add(weight)
  const base = new Mesh(new CylinderGeometry(0.13, 0.15, 0.1, 28), metal)
  base.position.y = -0.06
  arm.add(base)

  // Steam
  const steamTex = new CanvasTexture(softDot(128, 'rgba(255,255,255,.9)', 'rgba(255,255,255,0)'))
  const puffs: Sprite[] = []
  const puffX = [-0.28, 0.18, -0.02, 0.36]
  for (let s = 0; s < 4; s++) {
    const sp = new Sprite(new SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 }))
    sp.userData = { off: s / 4, x: puffX[s] }
    scene.add(sp)
    puffs.push(sp)
  }

  const target = new Vector3()
  let time = 0
  let okFrame = false

  function resize() {
    const w = Math.max(1, Math.round(dims.stageW))
    const h = Math.max(1, Math.round(dims.stageH))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function render(dt: number) {
    const cur = S.cur
    if (!cur) return
    time += dt
    let dist = 1.35 / 0.8 / (Math.tan((FOV * PI) / 360) * Math.min(1, camera.aspect))
    const e = (cur.elev * PI) / 180
    target.set(0, cur.ty, 0)
    dist *= cur.zoom
    camera.position.set(0, cur.ty + dist * Math.sin(e), dist * Math.cos(e))
    camera.lookAt(target)

    cup.position.y = cur.cupY
    cup.visible = cur.cupY > -4.9

    const lift = Math.sin(cur.flip * PI) * 0.9
    const dip = Math.sin(S.sip * PI) * 0.07
    flipG.position.y = cur.discY + lift - dip
    const topDown = cur.elev > 80 ? 1 : 0
    flipG.rotation.set(cur.flip * PI + S.tiltX * topDown * (1 - cur.badge), 0, S.tiltZ * topDown * (1 - cur.badge))
    disc.scale.set(cur.discR, 1, cur.discR)
    disc.rotation.y = S.spin
    for (const m of [matA, matB]) {
      const u = m.uniforms
      u.uGroove.value = cur.groove
      u.uMatcha.value = cur.matcha
      u.uTime.value = time
      u.uSpin.value = S.spin
      u.uActive.value = m === matA ? S.activeTrack : -1
      ;(u.uTint.value as Vector3).set(S.tint[0], S.tint[1], S.tint[2])
    }

    shadow.visible = cur.bg > 0.02
    ;(shadow.material as MeshBasicMaterial).opacity = cur.bg * 0.6
    shadow.scale.setScalar(cur.discR * 1.3)
    shadow.position.set(0.07, cur.discY - 0.55, 0.09)

    arm.visible = cur.arm > 0.01
    if (arm.visible) {
      const rho = (0.95 - S.needleP * 0.55) * cur.discR
      const beta = Math.acos(clamp((D * D + L * L - rho * rho) / (2 * D * L), -1, 1))
      const rest = (62 * PI) / 180
      arm.position.set(PX, cur.discY + 0.12, PZ)
      arm.rotation.y = phiC + rest + (beta - rest) * cur.arm
      armTilt.rotation.z = (1 - cur.arm) * 0.14
    }

    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i]
      const ph = (time * 0.16 + p.userData.off) % 1
      p.visible = cur.steam > 0.01 && cur.cupY > -0.5
      p.position.set(p.userData.x + Math.sin(ph * 5 + i) * 0.12, 1.35 + ph * 1.25, 0.05 * i)
      const sc = 0.55 + ph * 0.75
      p.scale.set(sc, sc * 1.25, 1)
      ;(p.material as SpriteMaterial).opacity = Math.sin(ph * PI) * 0.2 * cur.steam
    }
    renderer.render(scene, camera)
    if (!okFrame) {
      okFrame = true
      hooks.onFirstFrame()
    }
  }

  function lowerQuality() {
    if (dpr <= 1) return false
    dpr = Math.max(1, dpr - 0.5)
    renderer.setPixelRatio(dpr)
    resize()
    return true
  }

  const onLost = (ev: Event) => {
    ev.preventDefault()
    hooks.onLost()
  }
  canvas.addEventListener('webglcontextlost', onLost, false)

  function dispose() {
    canvas.removeEventListener('webglcontextlost', onLost)
    const mats = new Set<Material>()
    scene.traverse((o) => {
      const mesh = o as Mesh
      mesh.geometry?.dispose()
      const m = mesh.material
      if (Array.isArray(m)) m.forEach((x) => mats.add(x))
      else if (m) mats.add(m)
    })
    mats.forEach((m) => m.dispose())
    for (const t of [texA, texB, shadowTex, steamTex]) t.dispose()
    renderer.dispose()
  }

  return { render, resize, lowerQuality, dispose }
}
