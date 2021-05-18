<template>
  <div class="box" ref="box">
    <canvas
      class="hall"
      ref="hallCanvas"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @wheel.prevent="onMouseWheel"
      @mouseover="mouseDown = false; dragging = false"
      @mouseout="mouseDown = false; dragging = false"

      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    />
    <div class="control">
      <input type="button" class="button" @click="zoomIn" value="+">
      <input type="button" class="button" @click="zoomOut" value="-">
      <input type="button" class="button" @click="fitImage" value="⟳">
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import { defineComponent, PropType, ref } from 'vue'
import { cloneDeep } from 'lodash-es'

interface Seat {
  id: number;
  pos_x: number;
  pos_y: number;
  color: string;
}

interface Point {
  x: number;
  y: number;
}

declare global {
  interface CanvasRenderingContext2D {
    roundRect(x: number, y: number, w: number, h: number, r: number): CanvasRenderingContext2D;
  }
}

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  this.beginPath()
  this.moveTo(x + r, y)
  this.arcTo(x + w, y, x + w, y + h, r)
  this.arcTo(x + w, y + h, x, y + h, r)
  this.arcTo(x, y + h, x, y, r)
  this.arcTo(x, y, x + w, y, r)
  this.closePath()
  return this
}

export default defineComponent({
  name: 'Hall',
  props: {
    seats: {
      type: Array as PropType<Seat[]>,
      required: true
    },
    seatFactor: {
      type: Number,
      default: 32
    },
    scaleFactor: {
      type: Number,
      default: 1.1
    },
    minScale: {
      type: Number,
      default: 0.11
    },
    maxScale: {
      type: Number,
      default: 0.99
    },
    updateInterval: {
      type: Number,
      default: 3000
    }
  },
  setup: () => {
    const hallCanvas = ref<HTMLCanvasElement | null>(null)
    const image = document.createElement('canvas')
    const box = ref<HTMLDivElement | null>(null)
    const mouseDown = false
    const dragging = false
    const scale = 1
    const resizeObserver: any = null
    const startDragOffset: Point = { x: 0, y: 0 }
    const translatePos: Point = { x: 0, y: 0 }
    const seatsCopy: Seat[] = []
    const interval = 0

    return {
      hallCanvas,
      image,
      box,
      scale,
      resizeObserver,
      mouseDown,
      dragging,
      startDragOffset,
      translatePos,
      seatsCopy,
      interval
    }
  },
  mounted () {
    if (!this.box || !this.hallCanvas) {
      throw new Error('Referenced elements dont exist')
    }
    const box = this.box
    const hall = this.hallCanvas
    this.resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.target === this.box) {
          const { width, height } = box.getBoundingClientRect()
          hall.width = width
          hall.height = height
          this.fitImage()
        }
      }
    })
    this.resizeObserver?.observe(this.box)
    this.renderImage()
    window.requestAnimationFrame(this.draw)
    this.interval = window.setInterval(this.updateImage, this.updateInterval)
  },
  beforeUnmount () {
    clearInterval(this.interval)
    this.resizeObserver?.unobserve(this.box as HTMLDivElement)
  },
  methods: {
    zoomIn () {
      if (this.scale >= this.maxScale) {
        return
      }
      this.scale *= this.scaleFactor
      window.requestAnimationFrame(this.draw)
    },
    zoomOut () {
      if (this.scale <= this.minScale) {
        return
      }
      this.scale /= this.scaleFactor
      window.requestAnimationFrame(this.draw)
    },
    onTouchStart (e: TouchEvent) {
      this.startDragOffset.x = e.touches[0].clientX / this.scale - this.translatePos.x
      this.startDragOffset.y = e.touches[0].clientY / this.scale - this.translatePos.y
      this.dragging = true
    },
    onTouchMove (e: TouchEvent) {
      this.translatePos.x = e.touches[0].clientX / this.scale - this.startDragOffset.x
      this.translatePos.y = e.touches[0].clientY / this.scale - this.startDragOffset.y
      window.requestAnimationFrame(this.draw)
    },
    onTouchEnd () {
      this.dragging = false
    },
    onMouseDown (e: MouseEvent) {
      this.mouseDown = true
      this.startDragOffset.x = e.clientX / this.scale - this.translatePos.x
      this.startDragOffset.y = e.clientY / this.scale - this.translatePos.y
    },
    onMouseMove (e: MouseEvent) {
      if (!this.mouseDown) {
        return
      }
      this.dragging = true
      this.translatePos.x = e.clientX / this.scale - this.startDragOffset.x
      this.translatePos.y = e.clientY / this.scale - this.startDragOffset.y
      window.requestAnimationFrame(this.draw)
    },
    onMouseUp (e: MouseEvent) {
      this.mouseDown = false
      if (this.dragging) {
        this.dragging = false
        return
      }
      const imageX = e.offsetX / this.scale - this.hallWidth / 2 / this.scale +
        this.image.width / 2 - this.translatePos.x
      const imageY = e.offsetY / this.scale - this.hallHeight / 2 / this.scale +
        this.image.height / 2 - this.translatePos.y

      const x = Math.floor(imageX / this.seatFactor)
      const y = Math.floor(imageY / this.seatFactor)
      for (let i = 0; i < this.seats.length; i += 1) {
        if (this.seats[i].pos_x === x && this.seats[i].pos_y === y) {
          console.log(this.seats[i].id)
          break
        }
      }
    },
    onMouseWheel: function (e: WheelEvent) {
      if ((e.deltaY >= 0 && this.scale <= this.minScale) || (e.deltaY < 0 && this.scale >= this.maxScale)) {
        return
      }
      this.scale *= e.deltaY < 0 ? this.scaleFactor : 1 / this.scaleFactor
      window.requestAnimationFrame(this.draw)
    },
    draw () {
      const ctx = this.hall.getContext('2d')
      if (!ctx) {
        throw new Error('Cant get 2d context')
      }
      ctx.clearRect(0, 0, this.hall.width, this.hall.height)
      ctx.save()

      ctx.translate(this.hall.width / 2, this.hall.height / 2)
      ctx.scale(this.scale, this.scale)
      ctx.drawImage(
        this.image,
        this.translatePos.x - this.image.width / 2,
        this.translatePos.y - this.image.height / 2
      )
      ctx.restore()
    },
    renderImage () {
      const ctx = this.imageCtx
      const [imageWidth, imageHeight] = this.imageDimension
      this.image.width = imageWidth
      this.image.height = imageHeight

      ctx.strokeRect(0, 0, imageWidth, imageHeight)
      this.seats.forEach((seat) => {
        this.renderSeat(ctx, seat)
      })
    },
    renderSeat (ctx: CanvasRenderingContext2D, seat: Seat) {
      ctx.fillStyle = seat.color
      ctx.roundRect(
        seat.pos_x * this.seatFactor + this.seatFactor / 8,
        seat.pos_y * this.seatFactor + this.seatFactor / 8,
        this.seatFactor * 3 / 4,
        this.seatFactor * 3 / 4,
        this.seatFactor / 4
      ).fill()
    },
    fitImage () {
      this.scale = 1
      this.translatePos.x = 0
      this.translatePos.y = 0
      const [imageWidth, imageHeight] = this.imageDimension

      let [scaledWidth, scaledHeight] = [imageWidth, imageHeight]
      while (scaledWidth > this.hallWidth || scaledHeight > this.hallHeight) {
        this.scale /= this.scaleFactor
        scaledWidth = imageWidth * this.scale
        scaledHeight = imageHeight * this.scale
      }
      window.requestAnimationFrame(this.draw)
    },
    updateImage () {
      if (this.dragging) {
        return
      }
      let needRedraw = false
      if (!this.seatsCopy.length || this.seats.length !== this.seatsCopy.length) {
        needRedraw = true
      } else {
        for (let i = 0; i < this.seats.length; i += 1) {
          if (this.seatsCopy[i].pos_x !== this.seats[i].pos_x || this.seatsCopy[i].pos_y !== this.seats[i].pos_y) {
            needRedraw = true
            break
          }
          if (this.seatsCopy[i].color !== this.seats[i].color) {
            const ctx = this.imageCtx
            this.renderSeat(ctx, this.seats[i])
            window.requestAnimationFrame(this.draw)
          }
        }
      }
      this.seatsCopy = cloneDeep(this.seats)
      if (needRedraw) {
        this.renderImage()
        window.requestAnimationFrame(this.draw)
      }
    }
  },
  computed: {
    hall (): HTMLCanvasElement {
      if (!this.hallCanvas) {
        throw new Error('Referenced element "hall" does not exist')
      }
      return this.hallCanvas
    },
    hallWidth (): number {
      return this.hall.width
    },
    hallHeight (): number {
      return this.hall.height
    },
    imageDimension (): number[] {
      const maxCoordinates = this.seats.reduce((memo, seat) => [
        Math.max(memo[0], seat.pos_x),
        Math.max(memo[1], seat.pos_y)
      ], [0, 0])
      return maxCoordinates.map(c => (c + 1) * this.seatFactor)
    },
    imageCtx (): CanvasRenderingContext2D {
      const ctx = this.image?.getContext('2d')
      if (!ctx) {
        throw new Error('Referenced object doesnt exist')
      }
      return ctx
    }
  }
})

</script>

<style scoped>
.button {
  background-color: #8899AA;
  border: 2px solid #345;
  color: #345;
  font-family: Arial, sans-serif;
  font-size: 20px;
  font-weight: bolder;
  line-height: 0;
  align-content: normal;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  margin: 4px;
}

.box {
  width: 100%;
  height: 100%;
  position: relative;
}

.hall {
  position: absolute;
  top: 0;
  left: 0;
  background-color: aquamarine;
}

.control {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: 4px;
  padding: 2px;
  display: flex;
  flex-direction: column;
}
</style>
