<template>
  <div class="flex items-center gap-2.5 select-none">
    <!-- SVG Icon -->
    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
      <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
        <svg class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="12" y1="2" x2="12" y2="22" stroke-opacity="0.3" />
        </svg>
      </div>
    </div>

    <!-- Brand Typography -->
    <div class="flex flex-col">
      <div class="flex items-center gap-1.5">
        <span class="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
          AscendLog
        </span>
        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-widest">
          PRO
        </span>
      </div>
      <span class="text-[10px] text-slate-400 font-medium tracking-wide">Developer Career Tracker</span>
    </div>
  </div>
</template>