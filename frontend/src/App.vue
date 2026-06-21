<script setup lang="ts">
import { ref, onMounted } from 'vue'

// reactive state
const count = ref(0)
const name = ref('Abdelrahman')
const age = ref(22)
const year = ref(2026)
const emoji = ref('🤩')
// functions that mutate state and trigger updates
function increment() {
  count.value++
}
function decrement() {
  count.value--
}

// lifecycle hooks
onMounted(() => {
  console.log(`The initial count is ${count.value}.`)
})
</script>

<template>
  <header>
    <h1> count is: {{count}}</h1>
  <button @click="increment">add</button>
    <button @click="decrement">minus</button>
    <span> {{emoji}} </span>
    <div>
      <h1>Hello my name is {{ name }}!</h1>
    </div>
  </header>
  <footer>
    <p>&copy; 2026</p>
  </footer>
</template>

<style scoped>
header {
  text-align: center;
}
button{
  font-size: 1rem;
  text-align: center;
}
header span{
  font-size: 5rem;
  text-align: center;
}
header div{
  text-align: center;
  font-size: 2rem;
  color: darkcyan;
  font-style: italic;
}
button {
  font-weight: bold;
}
footer p {
  text-align: center;
  color: lavender;
}
</style>
