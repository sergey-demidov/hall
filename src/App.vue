<template>
  <div class="hallContainer">
    <Hall :seats="seats"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Hall from './components/Hall.vue'
import { hallData } from './hallData'

export default defineComponent({
  name: 'App',
  data: () => {
    return {
      interval: 0,
      seats: hallData
      // seats: [
      //   {id: 1, pos_x: 1, pos_y: 1, color: '#ff0000'},
      //   {id: 2, pos_x: 1, pos_y: 2, color: '#002300'},
      //   {id: 3, pos_x: 1, pos_y: 3, color: '#0000ff'},
      //
      //   {id: 4, pos_x: 2, pos_y: 1, color: '#ffff00'},
      //   {id: 5, pos_x: 2, pos_y: 2, color: '#ffff00'},
      //   {id: 6, pos_x: 2, pos_y: 3, color: '#ffff00'}
      // ]
    }
  },
  mounted () {
    this.interval = window.setInterval(() => {
      this.seats[Math.floor(Math.random() * this.seats.length)].color = '#8899aa'
    }, 3000)
  },
  beforeUnmount () {
    clearInterval(this.interval)
  },
  components: {
    Hall
  }
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.hallContainer {
  display: inline-block;
  resize:both;
  overflow:auto;
  width: 800px;
  height: 600px;
  padding: 20px;
  border: 1px solid black;
}
</style>
