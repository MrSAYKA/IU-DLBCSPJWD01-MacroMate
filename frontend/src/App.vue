
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

function logout() {
  auth.logout()
  router.push('/auth')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav v-if="auth.isLoggedIn" class="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div class="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <span class="font-bold text-emerald-600 text-lg">MacroMate</span>
        <div class="flex items-center gap-1">
          <RouterLink
            to="/"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === '/' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
          >Dashboard</RouterLink>
          <RouterLink
            to="/goals"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === '/goals' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:text-gray-700'"
          >Goals</RouterLink>
          <button
            class="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
            @click="logout"
          >Logout</button>
        </div>
      </div>
    </nav>
    <RouterView />
  </div>
</template>
