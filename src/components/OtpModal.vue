<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../services/api'
import { ShieldCheck, Loader2, ArrowRight, RefreshCw } from '@lucide/vue'

// Emit events to parent (equivalent to passing onAuthSuccess callback in React props)
const emit = defineEmits(['authenticated'])

// Reactive states
const otpDigits = reactive(['', '', '', '', '', ''])
const inputRefs = ref([]) // Template refs array
const isLoading = ref(false)
const isSending = ref(false)
const errorMessage = ref('')
const serverMessage = ref('')
const countdown = ref(0)
let timer = null

// Request OTP from Spring Boot
const requestOtp = async () => {
  isSending.value = true
  errorMessage.value = ''
  try {
    const res = await api.sendOtp()
    serverMessage.value = res.data.message
    startTimer(300) // 5 minutes timer
  } catch (err) {
    errorMessage.value = 'Failed to dispatch security code. Check server.'
  } finally {
    isSending.value = false
  }
}

// Auto-advance cursor between 6 OTP inputs
const handleInput = (index, event) => {
  const val = event.target.value.toUpperCase()
  otpDigits[index] = val

  // Auto-focus next box if character entered
  if (val && index < 5) {
    inputRefs.value[index + 1]?.focus()
  }

  // Auto-submit if all 6 boxes filled
  if (otpDigits.every(d => d.length === 1)) {
    submitOtp()
  }
}

// Handle Backspace navigation
const handleKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
    inputRefs.value[index - 1]?.focus()
  }
}

// Handle Paste (e.g. user copies DTSD9K)
const handlePaste = (event) => {
  event.preventDefault()
  const pasteData = event.clipboardData.getData('text').trim().toUpperCase()
  if (pasteData.length === 6) {
    for (let i = 0; i < 6; i++) {
      otpDigits[i] = pasteData[i]
    }
    submitOtp()
  }
}

// Verify OTP
const submitOtp = async () => {
  const fullOtp = otpDigits.join('')
  if (fullOtp.length !== 6) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await api.verifyOtp(fullOtp)
    if (res.data.authenticated) {
      sessionStorage.setItem('is_authenticated', 'true')
      emit('authenticated')
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Invalid or expired OTP'
    // Clear inputs on error
    otpDigits.fill('')
    inputRefs.value[0]?.focus()
  } finally {
    isLoading.value = false
  }
}

const startTimer = (seconds) => {
  countdown.value = seconds
  clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  requestOtp()
})
</script>

<template>
  <div class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
    <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-5">
      
      <div class="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-400">
        <ShieldCheck class="w-6 h-6" />
      </div>

      <div>
        <h2 class="text-base font-bold text-slate-100">Security Verification</h2>
        <p class="text-xs text-slate-400 mt-1">
          Enter the one-time code sent to your registered email.
        </p>
        <p v-if="serverMessage" class="text-[11px] text-emerald-400 mt-1.5 font-medium">
          {{ serverMessage }}
        </p>
      </div>

      <!-- 6-Digit OTP Box Grid -->
      <div class="flex justify-between gap-2" @paste="handlePaste">
        <input
          v-for="(_, index) in otpDigits"
          :key="index"
          :ref="el => inputRefs[index] = el"
          type="text"
          maxlength="1"
          :value="otpDigits[index]"
          @input="handleInput(index, $event)"
          @keydown="handleKeyDown(index, $event)"
          class="w-11 h-13 text-center text-lg font-mono font-bold uppercase bg-slate-950 border border-slate-700/80 rounded-xl text-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      <div v-if="errorMessage" class="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 rounded-xl">
        {{ errorMessage }}
      </div>

      <button
        @click="submitOtp"
        :disabled="isLoading"
        class="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold text-white transition active:scale-[0.98] shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
        <span v-else class="flex items-center gap-1.5">Verify & Continue <ArrowRight class="w-4 h-4" /></span>
      </button>

      <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Expires in: {{ Math.floor(countdown / 60) }}:{{ (countdown % 60).toString().padStart(2, '0') }}</span>
        <button
          @click="requestOtp"
          :disabled="countdown > 240 || isSending"
          class="text-indigo-400 font-semibold disabled:text-slate-600 hover:underline flex items-center gap-1"
        >
          <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isSending }" /> Resend Code
        </button>
      </div>

    </div>
  </div>
</template>