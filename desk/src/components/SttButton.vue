<template>
  <!-- STT Mic Button — States: idle | recording | transcribing | error -->
  <div
    class="relative flex items-center gap-1.5 rounded-full border p-1 shadow-sm transition-all duration-300"
    :class="containerClass"
  >
    <!-- Language Selector (Idle only) — custom dropdown, scalable to N languages -->
    <div v-if="state === 'idle'" class="relative ml-1" ref="langDropdown">
      <!-- Trigger pill -->
      <button
        ref="triggerEl"
        type="button"
        @click.stop="toggleDropdown"
        class="flex items-center gap-1 rounded-full bg-gray-100 hover:bg-gray-200 px-2.5 py-1 transition-all duration-200"
      >
        <span class="text-[10px] font-bold uppercase tracking-wide text-gray-700 leading-none">
          {{ selectedLanguage }}
        </span>
        <!-- Chevron -->
        <svg
          class="h-2.5 w-2.5 text-gray-400 transition-transform duration-200"
          :class="isLangOpen ? 'rotate-180' : ''"
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <!-- Teleport to body: escapes any overflow/scroll container -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="isLangOpen"
            :style="dropdownStyle"
            class="fixed z-[9999] min-w-[110px] origin-top-left rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
          >
            <button
              v-for="lang in availableLanguages"
              :key="lang.value"
              type="button"
              @click="selectLanguage(lang.value)"
              class="flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors duration-150 hover:bg-gray-50"
            >
              <!-- Active indicator dot -->
              <span
                class="h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors"
                :class="selectedLanguage === lang.value ? 'bg-gray-800' : 'bg-gray-200'"
              />
              <span
                class="text-[11px] font-medium leading-none"
                :class="selectedLanguage === lang.value ? 'text-gray-900' : 'text-gray-500'"
              >
                {{ lang.label }}
              </span>
            </button>
          </div>
        </Transition>
      </Teleport>
    </div>

    <!-- Recording Timer & Visualizer (Recording only) -->
    <div v-if="state === 'recording'" class="flex items-center gap-2 pl-2 pr-1">
      <span class="relative flex h-2.5 w-2.5">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
      </span>
      <span class="text-xs font-semibold text-red-500 tabular-nums">{{ formattedTime }}</span>
      
      <div class="flex items-end gap-[2px] h-3 ml-1 overflow-hidden">
        <span class="w-[2px] bg-red-400 animate-waveform rounded-t-sm" style="animation-delay: 0s"></span>
        <span class="w-[2px] bg-red-400 animate-waveform rounded-t-sm" style="animation-delay: 0.2s"></span>
        <span class="w-[2px] bg-red-400 animate-waveform rounded-t-sm" style="animation-delay: 0.1s"></span>
        <span class="w-[2px] bg-red-400 animate-waveform rounded-t-sm" style="animation-delay: 0.3s"></span>
      </div>
    </div>

    <!-- Transcribing Status -->
    <div v-if="state === 'transcribing'" class="flex items-center gap-1.5 pl-2 pr-1 text-xs font-medium text-blue-600">
      Processing...
    </div>

    <!-- Error Status -->
    <div
      v-if="state === 'error' && errorMessage"
      class="flex items-center gap-1.5 pl-2 pr-1 text-xs font-medium text-red-600 truncate max-w-[140px]"
      :title="errorMessage"
    >
      {{ errorMessage }}
    </div>

    <!-- Main Action Button -->
    <button
      type="button"
      :title="buttonTitle"
      :disabled="state === 'transcribing'"
      class="group relative flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300"
      :class="actionButtonClass"
      @click="handleClick"
    >
      <!-- Spinner when transcribing -->
      <svg
        v-if="state === 'transcribing'"
        class="h-4 w-4 animate-spin text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>

      <!-- Stop Icon (Recording) -->
      <svg
        v-else-if="state === 'recording'"
        class="h-3 w-3 fill-current text-white transition-transform hover:scale-110"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
      </svg>

      <!-- Mic Icon (Idle / Error) -->
      <svg
        v-else
        class="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110"
        :class="state === 'error' ? 'text-white' : 'text-gray-700'"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { call } from "frappe-ui";
import { createToast } from "@/utils";

// ── Props & Emits ────────────────────────────────────────────────────────────
interface Props {
  modelValue?: string;
  language?: string;
  doctype?: string;
  docname?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  language: "",
  doctype: "HD Ticket",
  docname: "__new__",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "error", message: string): void;
}>();

// ── State ────────────────────────────────────────────────────────────────────
type SttState = "idle" | "recording" | "transcribing" | "error";

const state = ref<SttState>("idle");
const errorMessage = ref<string>("");
const selectedLanguage = ref<string>(props.language || "ar");

// ── Language config — add new languages here, no other changes needed ─────────
const availableLanguages: { value: string; label: string }[] = [
  { value: "ar", label: "AR — Arabic" },
  { value: "en", label: "EN — English" },
];

// Language dropdown state
const isLangOpen = ref(false);
const langDropdown = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);
const dropdownStyle = ref<Record<string, string>>({});

function toggleDropdown() {
  if (!isLangOpen.value && triggerEl.value) {
    const rect      = triggerEl.value.getBoundingClientRect();
    const MARGIN    = 8;                                      // min gap from viewport edge
    const menuW     = 120;                                    // approx dropdown width (min-w-[110px])
    const menuH     = availableLanguages.length * 36 + 8;    // approx dropdown height

    // ── Vertical: prefer below, flip above if not enough room ────────────────
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= menuH + MARGIN
      ? rect.bottom + 6
      : Math.max(MARGIN, rect.top - menuH - 6);

    // ── Horizontal: prefer left-aligned, flip if near right edge ─────────────
    const spaceRight = window.innerWidth - rect.left;
    const left = spaceRight >= menuW + MARGIN
      ? rect.left
      : Math.max(MARGIN, rect.right - menuW);

    dropdownStyle.value = {
      top:  `${top}px`,
      left: `${left}px`,
    };
  }
  isLangOpen.value = !isLangOpen.value;
}

function selectLanguage(lang: string) {
  selectedLanguage.value = lang;
  isLangOpen.value = false;
}

function handleOutsideClick(e: MouseEvent) {
  if (langDropdown.value && !langDropdown.value.contains(e.target as Node)) {
    isLangOpen.value = false;
  }
}

// Recording timer state
const recordingTime = ref<number>(0);
let timerInterval: number | null = null;

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let activeStream: MediaStream | null = null;

// ── Computed ─────────────────────────────────────────────────────────────────
const formattedTime = computed(() => {
  const mins = Math.floor(recordingTime.value / 60);
  const secs = recordingTime.value % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
});

const buttonTitle = computed(() => {
  const map: Record<SttState, string> = {
    idle: "Record voice (Speech to Text)",
    recording: "Click to stop recording",
    transcribing: "Transcribing audio...",
    error: "Error — click to retry",
  };
  return map[state.value];
});

// Dynamic wrapper styling
const containerClass = computed(() => ({
  "border-red-200 bg-red-50": state.value === "recording",
  "border-red-200 bg-white": state.value === "error",
  "border-blue-200 bg-blue-50/60": state.value === "transcribing",
  "border-gray-200 bg-white hover:border-gray-300": state.value === "idle",
}));

// Dynamic main button styling
const actionButtonClass = computed(() => ({
  "bg-red-500 hover:bg-red-600 shadow-red-200/50 shadow-md": state.value === "recording" || state.value === "error",
  "bg-blue-500 shadow-sm cursor-not-allowed opacity-80": state.value === "transcribing",
  "bg-gray-100 hover:bg-gray-200 text-gray-700": state.value === "idle",
}));

// ── Timer Logic ──────────────────────────────────────────────────────────────
function startTimer() {
  recordingTime.value = 0;
  timerInterval = window.setInterval(() => {
    recordingTime.value++;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// ── Result handler ───────────────────────────────────────────────────────────
function handleSttResult(outcome: { success: boolean; result: string | null; error: string | null }) {
  if (outcome.success && outcome.result) {
    emit("update:modelValue", outcome.result);
    createToast({ title: "Transcription complete", icon: "check", iconClasses: "text-green-600" });
    state.value = "idle";
  } else {
    errorMessage.value = outcome.error || "Transcription failed";
    emit("error", errorMessage.value);
    createToast({ title: "Transcription failed", icon: "x", iconClasses: "text-red-600" });
    state.value = "error";
  }
}

// ── Core actions ─────────────────────────────────────────────────────────────
function handleClick() {
  if (state.value === "idle" || state.value === "error") {
    startRecording();
  } else if (state.value === "recording") {
    stopRecording();
  }
}

async function startRecording() {
  errorMessage.value = "";

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    setState("error", "Microphone access denied");
    return;
  }

  audioChunks = [];

  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "";

  mediaRecorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : {});

  mediaRecorder.ondataavailable = (e: BlobEvent) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = handleRecordingStop;
  mediaRecorder.start(250);
  
  state.value = "recording";
  startTimer();
}

function stopRecording() {
  stopTimer();
  mediaRecorder?.stop();
  activeStream?.getTracks().forEach((t) => t.stop());
}

async function handleRecordingStop() {
  state.value = "transcribing";

  const blob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || "audio/webm" });
  const audio_b64 = await blobToBase64(blob);

  try {
    const outcome = await call("etms_ai.api.stt.stt.transcribe_audio_bytes", {
      audio_b64,
      language: selectedLanguage.value,
      doctype: props.doctype,
      docname: props.docname,
      fieldname: "description",
    });
    handleSttResult(outcome);
  } catch (err: any) {
    setState("error", err?.message || "Server error — please retry");
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const full = reader.result as string;
      resolve(full.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function setState(s: SttState, msg = "") {
  state.value = s;
  errorMessage.value = msg;
  if (msg) emit("error", msg);
}

// Cleanup on component unmount
onMounted(() => document.addEventListener("click", handleOutsideClick, true));
onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick, true);
  stopTimer();
  activeStream?.getTracks().forEach((t) => t.stop());
});
</script>

<style scoped>
@keyframes waveform {
  0%, 100% { height: 4px; opacity: 0.6; }
  50% { height: 12px; opacity: 1; }
}
.animate-waveform {
  animation: waveform 0.9s ease-in-out infinite;
  height: 4px;
}
</style>
