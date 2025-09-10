export interface ConfettiOptions {
  particleCount?: number
  spread?: number
  startVelocity?: number
  decay?: number
  gravity?: number
  colors?: string[]
  origin?: { x: number; y: number }
  duration?: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  decay: number
}

export class ConfettiController {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private animationId: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  private resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  confetti(options: ConfettiOptions = {}) {
    const {
      particleCount = 50,
      spread = 50,
      startVelocity = 45,
      decay = 0.9,
      gravity = 0.5,
      colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
      origin = { x: 0.5, y: 0.5 },
      duration = 3000
    } = options

    const startTime = Date.now()

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.random() * spread - spread / 2) * (Math.PI / 180)
      const velocity = startVelocity * (0.75 + Math.random() * 0.25)
      
      this.particles.push({
        x: this.canvas.width * origin.x,
        y: this.canvas.height * origin.y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3 + 2,
        life: 1,
        decay: decay
      })
    }

    const animate = () => {
      const elapsed = Date.now() - startTime
      
      if (elapsed > duration) {
        this.particles = []
        this.animationId = null
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        return
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.particles = this.particles.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += gravity
        particle.vx *= decay
        particle.vy *= decay
        particle.life -= 0.02

        if (particle.life <= 0) return false

        this.ctx.globalAlpha = particle.life
        this.ctx.fillStyle = particle.color
        this.ctx.beginPath()
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        this.ctx.fill()

        return true
      })

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.animationId = null
      }
    }

    if (this.animationId === null) {
      this.animationId = requestAnimationFrame(animate)
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', () => this.resize())
  }
}

// Utility function for easy confetti bursts
export const celebrateWithConfetti = (options?: ConfettiOptions) => {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  
  document.body.appendChild(canvas)
  
  const confetti = new ConfettiController(canvas)
  confetti.confetti(options)
  
  // Clean up after animation
  setTimeout(() => {
    confetti.destroy()
    document.body.removeChild(canvas)
  }, options?.duration || 3000)
}