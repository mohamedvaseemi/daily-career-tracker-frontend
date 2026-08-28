<script setup>
import { ref, computed, onMounted } from 'vue'
import api from './services/api'
import OtpModal from './components/OtpModal.vue'
import BrandLogo from './components/BrandLogo.vue'
import { Plus, Flame, Clock, BookOpen, Trash2, X, Loader2, LogOut, Search, Award } from '@lucide/vue'

const isAuthenticated = ref(false)
const logs = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const showModal = ref(false)
const searchQuery = ref('')

const form = ref({
  logDate: new Date().toISOString().split('T')[0],
  skillTopic: '',
  hoursSpent: 1.5,
  productivityScore: 4,
  learnings: ''
})

// Metrics
const totalHours = computed(() => {
  return logs.value.reduce((sum, item) => sum + Number(item.hoursSpent || 0), 0).toFixed(1)
})

const totalLogs = computed(() => logs.value.length)

const averageFocus = computed(() => {
  if (logs.value.length === 0) return '0.0'
  const sum = logs.value.reduce((acc, curr) => acc + Number(curr.productivityScore || 0), 0)
  return (sum / logs.value.length).toFixed(1)
})

// Search Filtering
const filteredLogs = computed(() => {
  if (!searchQuery.value.trim()) return logs.value
  const query = searchQuery.value.toLowerCase()
  return logs.value.filter(item => 
    item.skillTopic.toLowerCase().includes(query) || 
    item.learnings.toLowerCase().includes(query)
  )
})

// Auth checking
onMounted(() => {
  if (sessionStorage.getItem('is_authenticated') === 'true') {
    isAuthenticated.value = true
    fetchLogs()
  }
})

const handleAuthenticated = () => {
  isAuthenticated.value = true
  fetchLogs()
}

const handleLogout = () => {
  sessionStorage.removeItem('is_authenticated')
  isAuthenticated.value = false
  logs.value = []
}

// API Calls
const fetchLogs = async () => {
  isLoading.value = true
  try {
    const res = await api.getDailyNotes()
    logs.value = res.data
  } catch (err) {
    console.error('Fetch failed:', err)
  } finally {
    isLoading.value = false
  }
}

const handleSave = async () => {
  if (!form.value.skillTopic.trim() || !form.value.learnings.trim()) return

  isSubmitting.value = true
  try {
    const res = await api.createDailyNote(form.value)
    logs.value.unshift(res.data)
    form.value.skillTopic = ''
    form.value.learnings = ''
    form.value.hoursSpent = 1.5
    form.value.productivityScore = 4
    showModal.value = false
  } catch (err) {
    alert('Failed to save log.')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('Delete this career log entry?')) return
  try {
    await api.deleteDailyNote(id)
    logs.value = logs.value.filter(item => item.id !== id)
  } catch (err) {
    alert('Failed to delete entry.')
  }
}
</script>

<template>
  <OtpModal v-if="!isAuthenticated" @authenticated="handleAuthenticated" />

  <div v-else class="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 lg:pb-12">
    
    <!-- Navigation Bar -->
    <header class="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <BrandLogo />

      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-300">
          <Flame class="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{{ totalLogs }} Days Streak</span>
        </div>

        <button 
          @click="handleLogout" 
          class="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 px-3 py-1.5 rounded-xl transition"
          aria-label="Logout"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Exit Session</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      <!-- Responsive 4-Column KPI Stats Grid -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Clock class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 font-medium block">Time Invested</span>
            <span class="text-xl font-bold text-slate-100">{{ totalHours }} <span class="text-xs font-normal text-slate-400">hrs</span></span>
          </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 font-medium block">Total Entries</span>
            <span class="text-xl font-bold text-slate-100">{{ totalLogs }} <span class="text-xs font-normal text-slate-400">logs</span></span>
          </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Award class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 font-medium block">Avg Focus</span>
            <span class="text-xl font-bold text-slate-100">{{ averageFocus }} <span class="text-xs font-normal text-slate-400">/ 5</span></span>
          </div>
        </div>

        <div class="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Flame class="w-5 h-5" />
          </div>
          <div>
            <span class="text-[11px] text-slate-400 font-medium block">Consistency</span>
            <span class="text-xl font-bold text-emerald-400">Active 🔥</span>
          </div>
        </div>
      </section>

      <!-- 2-Column Responsive Body (Desktop: Left Feed, Right Form | Mobile: Feed only + FAB) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Left 2 Cols: Search & Daily Logs Feed -->
        <section class="lg:col-span-2 space-y-4">
          <!-- Search & Filter Bar -->
          <div class="relative">
            <Search class="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by skill, topic, or breakthrough notes..." 
              class="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="text-center py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 class="w-7 h-7 animate-spin text-indigo-400 mb-2" />
            <span class="text-xs">Loading logs from database...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredLogs.length === 0" class="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
            <BookOpen class="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p class="text-sm font-semibold text-slate-300">No logs found</p>
            <p class="text-xs text-slate-500 mt-1">Start documenting your daily skill acquisition.</p>
          </div>

          <!-- Logs Feed List -->
          <div v-else class="space-y-3">
            <article 
              v-for="item in filteredLogs" 
              :key="item.id" 
              class="bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-5 transition space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {{ item.skillTopic }}
                  </span>
                  <span class="text-xs text-amber-400/90 font-medium">⚡ Focus: {{ item.productivityScore }}/5</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <span class="text-[11px] text-slate-400 font-mono">{{ item.logDate }}</span>
                  <button 
                    @click="handleDelete(item.id)" 
                    class="text-slate-500 hover:text-rose-400 p-1 rounded-md transition"
                    aria-label="Delete entry"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-xl border border-slate-800/40 font-mono">
                {{ item.learnings }}
              </p>

              <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>⏱️ Time Logged: <strong class="text-slate-200">{{ item.hoursSpent }} hrs</strong></span>
              </div>
            </article>
          </div>
        </section>

        <!-- Right 1 Col: Persistent Desktop Entry Form (Hidden on mobile) -->
        <aside class="hidden lg:block bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 sticky top-20 space-y-4">
          <div>
            <h2 class="text-sm font-bold text-slate-100">Log Daily Progress</h2>
            <p class="text-[11px] text-slate-400">Directly syncs to Aiven MySQL</p>
          </div>

          <form @submit.prevent="handleSave" class="space-y-3.5">
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Topic / Skill</label>
              <input 
                v-model="form.skillTopic" 
                type="text" 
                placeholder="e.g., Vue 3 Reactivity, System Design" 
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hours</label>
                <input 
                  v-model.number="form.hoursSpent" 
                  type="number" 
                  step="0.25" 
                  min="0.25" 
                  max="24"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Focus</label>
                <select 
                  v-model.number="form.productivityScore" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option :value="1">1 - Distracted</option>
                  <option :value="2">2 - Low Energy</option>
                  <option :value="3">3 - Moderate</option>
                  <option :value="4">4 - High Focus</option>
                  <option :value="5">5 - Deep Flow</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Key Takeaways & Bugs Fixed</label>
              <textarea 
                v-model="form.learnings" 
                rows="4" 
                placeholder="Document your breakthroughs..."
                required
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              ></textarea>
            </div>

            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
              <span>{{ isSubmitting ? 'Saving...' : 'Record Log' }}</span>
            </button>
          </form>
        </aside>

      </div>
    </main>

    <!-- Mobile Floating Action Button (FAB) -->
    <button 
      @click="showModal = true"
      class="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 active:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center justify-center active:scale-95 transition-transform z-30"
      aria-label="Add Daily Log"
    >
      <Plus class="w-6 h-6 stroke-[2.5]" />
    </button>

    <!-- Mobile Slide-up Bottom Sheet Modal -->
    <div 
      v-if="showModal" 
      class="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-end justify-center"
      @click.self="showModal = false"
    >
      <div class="w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <div>
            <h2 class="text-sm font-bold text-slate-100">Log Daily Progress</h2>
            <p class="text-[11px] text-slate-400">Synced to Aiven Cloud MySQL</p>
          </div>
          <button @click="showModal = false" class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 transition">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSave" class="space-y-3.5">
          <div>
            <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Topic / Skill</label>
            <input 
              v-model="form.skillTopic" 
              type="text" 
              placeholder="e.g. Docker, Vue 3, Spring Boot" 
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Hours</label>
              <input 
                v-model.number="form.hoursSpent" 
                type="number" 
                step="0.25" 
                min="0.25" 
                max="24"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Focus Score</label>
              <select 
                v-model.number="form.productivityScore" 
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option :value="1">1 - Distracted</option>
                <option :value="2">2 - Low Energy</option>
                <option :value="3">3 - Moderate</option>
                <option :value="4">4 - High Focus</option>
                <option :value="5">5 - Deep Flow</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Learnings / Notes</label>
            <textarea 
              v-model="form.learnings" 
              rows="3" 
              placeholder="What did you build today?"
              required
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting"
            class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
            <span>{{ isSubmitting ? 'Saving...' : 'Save Entry' }}</span>
          </button>
        </form>
      </div>
    </div>

  </div>
</template>