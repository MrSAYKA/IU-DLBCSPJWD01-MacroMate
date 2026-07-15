<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '../services/api'

const calories = ref<number | null>(null)
const protein = ref<number | null>(null)
const carbs = ref<number | null>(null)
const fat = ref<number | null>(null)

const saving = ref(false)
const saved = ref(false)

onMounted(async () => {
  const goals = await api.goals.get()
  calories.value = goals.calories
  protein.value = goals.protein
  carbs.value = goals.carbs
  fat.value = goals.fat
})

async function save() {
  saving.value = true
  try {
    await api.goals.set({
      calories: calories.value || null,
      protein: protein.value || null,
      carbs: carbs.value || null,
      fat: fat.value || null,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } finally {
    saving.value = false
  }
}

const fields = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', model: calories },
  { key: 'protein'  as const, label: 'Protein',  unit: 'g',    model: protein  },
  { key: 'carbs'    as const, label: 'Carbs',    unit: 'g',    model: carbs    },
  { key: 'fat'      as const, label: 'Fat',      unit: 'g',    model: fat      },
]
</script>

<template>
  <div class="max-w-lg mx-auto p-4 pb-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-5 mt-1">Daily Goals</h2>

    <div class="bg-white rounded-xl border border-gray-100 p-6">
      <p class="text-sm text-gray-400 mb-5">Set your daily macro targets. Leave blank to track without a goal.</p>

      <div class="space-y-4">
        <div v-for="f in fields" :key="f.key">
          <label class="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {{ f.label }} <span class="normal-case font-normal">({{ f.unit }})</span>
          </label>
          <input
            v-model.number="f.model.value"
            type="number"
            min="0"
            placeholder="No goal set"
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
      </div>

      <button
        :disabled="saving"
        class="mt-6 w-full py-2.5 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
        :class="saved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 hover:bg-emerald-600 text-white'"
        @click="save"
      >
        {{ saved ? 'Saved!' : saving ? 'Saving...' : 'Save Goals' }}
      </button>
    </div>
  </div>
</template>
