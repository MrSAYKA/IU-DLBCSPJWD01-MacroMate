<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { api, type FoodItem, type FoodLog, type MacroSummary, type MacroGoals } from '../services/api'

const today = new Date().toISOString().slice(0, 10)
const date = ref(today)

const summary = ref<MacroSummary>({ calories: 0, protein: 0, carbs: 0, fat: 0 })
const goals = ref<MacroGoals>({ calories: null, protein: null, carbs: null, fat: null })
const logs = ref<FoodLog[]>([])

const searchQuery = ref('')
const searchResults = ref<FoodItem[]>([])
const selectedFood = ref<FoodItem | null>(null)
const grams = ref(100)
const searching = ref(false)
const adding = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

async function loadData() {
  const [s, g, l] = await Promise.all([
    api.logs.summary(date.value),
    api.goals.get(),
    api.logs.getAll(date.value),
  ])
  summary.value = s
  goals.value = g
  logs.value = l.logs
}

onMounted(loadData)
watch(date, loadData)

watch(searchQuery, (q) => {
  selectedFood.value = null
  if (searchTimer) clearTimeout(searchTimer)
  if (!q.trim()) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const { foods } = await api.food.search(q)
      searchResults.value = foods
    } finally {
      searching.value = false
    }
  }, 400)
})

function selectFood(food: FoodItem) {
  selectedFood.value = selectedFood.value === food ? null : food
  grams.value = 100
}

async function addFood(food: FoodItem) {
  adding.value = true
  try {
    const g = grams.value
    await api.logs.add({
      food_name: food.name,
      calories: food.calories !== null ? +(food.calories / 100 * g).toFixed(1) : null,
      protein: food.protein !== null ? +(food.protein / 100 * g).toFixed(1) : null,
      carbs: food.carbs !== null ? +(food.carbs / 100 * g).toFixed(1) : null,
      fat: food.fat !== null ? +(food.fat / 100 * g).toFixed(1) : null,
      quantity: 1,
      unit: `${g}g`,
    })
    searchQuery.value = ''
    searchResults.value = []
    selectedFood.value = null
    await loadData()
  } finally {
    adding.value = false
  }
}

async function deleteLog(id: number) {
  await api.logs.delete(id)
  await loadData()
}

const macros = computed(() => [
  { key: 'calories', label: 'Calories', unit: 'kcal', value: summary.value.calories, goal: goals.value.calories, color: 'orange' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    value: summary.value.protein,  goal: goals.value.protein,  color: 'blue'   },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    value: summary.value.carbs,    goal: goals.value.carbs,    color: 'yellow' },
  { key: 'fat',      label: 'Fat',      unit: 'g',    value: summary.value.fat,      goal: goals.value.fat,      color: 'red'    },
])

const colorMap: Record<string, { text: string; bar: string; border: string }> = {
  orange: { text: 'text-orange-500', bar: 'bg-orange-400', border: 'border-orange-100' },
  blue:   { text: 'text-blue-500',   bar: 'bg-blue-400',   border: 'border-blue-100'   },
  yellow: { text: 'text-yellow-500', bar: 'bg-yellow-400', border: 'border-yellow-100' },
  red:    { text: 'text-red-500',    bar: 'bg-red-400',    border: 'border-red-100'    },
}

function progress(value: number, goal: number | null) {
  if (!goal) return 0
  return Math.min((value / goal) * 100, 100)
}
</script>

<template>
  <div class="max-w-lg mx-auto p-4 pb-8">
    <!-- Date bar -->
    <div class="flex items-center justify-between mb-5 mt-1">
      <h2 class="text-lg font-semibold text-gray-700">
        {{ date === today ? 'Today' : date }}
      </h2>
      <input
        v-model="date"
        type="date"
        class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />
    </div>

    <!-- Macro cards -->
    <div class="grid grid-cols-2 gap-3 mb-5">
      <div
        v-for="m in macros"
        :key="m.key"
        class="bg-white rounded-xl border p-4"
        :class="colorMap[m.color].border"
      >
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{{ m.label }}</p>
        <p class="text-xl font-bold" :class="colorMap[m.color].text">
          {{ Math.round(m.value) }}<span class="text-sm font-normal text-gray-400 ml-1">{{ m.unit }}</span>
        </p>
        <p class="text-xs text-gray-400 mb-2">of {{ m.goal ?? '—' }} {{ m.unit }}</p>
        <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="colorMap[m.color].bar"
            :style="{ width: progress(m.value, m.goal) + '%' }"
          />
        </div>
      </div>
    </div>

    <!-- Food search -->
    <div class="bg-white rounded-xl border border-gray-100 p-4 mb-4">
      <h3 class="text-sm font-semibold text-gray-600 mb-3">Add Food</h3>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search for a food..."
        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div v-if="searching" class="mt-3 text-xs text-gray-400 text-center py-2">Searching...</div>

      <div v-else-if="searchResults.length" class="mt-2 max-h-72 overflow-y-auto divide-y divide-gray-50">
        <div v-for="food in searchResults" :key="food.name + food.brand" class="py-1">
          <div
            class="flex items-start justify-between rounded-lg px-2 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="selectFood(food)"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-700 truncate">{{ food.name }}</p>
              <p class="text-xs text-gray-400">{{ food.brand || 'Generic' }}</p>
            </div>
            <div class="text-right shrink-0 ml-3">
              <span class="text-sm font-medium text-gray-600" v-if="food.calories !== null">
                {{ Math.round(food.calories) }}
              </span>
              <span v-else class="text-sm text-gray-300">—</span>
              <span class="text-xs text-gray-300 ml-0.5">kcal/100g</span>
            </div>
          </div>

          <!-- Add form (expands on click) -->
          <div
            v-if="selectedFood === food"
            class="mx-2 mb-2 p-3 bg-emerald-50 rounded-lg flex items-center gap-3"
            @click.stop
          >
            <label class="text-xs text-gray-500 shrink-0">Amount</label>
            <input
              v-model.number="grams"
              type="number"
              min="1"
              class="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span class="text-xs text-gray-400">g</span>
            <button
              :disabled="adding"
              class="ml-auto px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              @click="addFood(food)"
            >
              {{ adding ? '...' : 'Add' }}
            </button>
          </div>
        </div>
      </div>

      <div
        v-else-if="searchQuery.trim() && !searching"
        class="mt-3 text-xs text-gray-400 text-center py-2"
      >No results found</div>
    </div>

    <!-- Today's log -->
    <div class="bg-white rounded-xl border border-gray-100 p-4">
      <h3 class="text-sm font-semibold text-gray-600 mb-3">
        {{ date === today ? "Today's Log" : `Log for ${date}` }}
      </h3>
      <div v-if="logs.length === 0" class="text-xs text-gray-400 text-center py-4">
        No entries yet — search for a food above
      </div>
      <div v-else class="divide-y divide-gray-50">
        <div
          v-for="log in logs"
          :key="log.id"
          class="flex items-center justify-between py-2.5"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-700 truncate">{{ log.food_name }}</p>
            <p class="text-xs text-gray-400">
              {{ log.unit }}
              <template v-if="log.calories !== null">
                · {{ Math.round(log.calories * log.quantity) }} kcal
              </template>
              <template v-if="log.protein !== null">
                · P {{ Math.round(log.protein * log.quantity) }}g
              </template>
            </p>
          </div>
          <button
            class="ml-3 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-full transition-colors text-lg leading-none"
            @click="deleteLog(log.id!)"
          >×</button>
        </div>
      </div>
    </div>
  </div>
</template>
