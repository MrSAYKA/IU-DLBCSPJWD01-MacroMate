<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { token } =
      mode.value === 'login'
        ? await api.auth.login(username.value, password.value)
        : await api.auth.register(username.value, password.value)
    auth.login(token)
    router.push('/')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-2xl font-bold text-emerald-600 text-center mb-1">MacroMate</h1>
      <p class="text-gray-400 text-center text-sm mb-6">Track your nutrition</p>

      <div class="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
        <button
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="mode === 'login' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'"
          @click="mode = 'login'"
        >Login</button>
        <button
          class="flex-1 py-2 text-sm font-medium transition-colors"
          :class="mode === 'register' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'"
          @click="mode = 'register'"
        >Register</button>
      </div>

      <form @submit.prevent="submit" class="space-y-4">
        <input
          v-model="username"
          type="text"
          placeholder="Username"
          required
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          required
          class="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <p v-if="error" class="text-red-500 text-xs text-center">{{ error }}</p>
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Loading...' : mode === 'login' ? 'Login' : 'Create Account' }}
        </button>
      </form>
    </div>
  </div>
</template>
