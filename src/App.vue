<template>
  <div class="sidebar">
    <header class="sidebar-header">
      <span class="sidebar-title">Currency Converter PL</span>
      <button class="close-btn" @click="closeSidebar" title="Close">✕</button>
    </header>

    <main class="sidebar-body">
      <form @submit.prevent="onSubmit" class="converter-form">
        <div class="form-group">
          <label for="amount">Amount</label>
          <input
            id="amount"
            v-model.number="amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            class="form-control"
          />
        </div>

        <div class="form-group">
          <label for="currency">Currency</label>
          <select
            id="currency"
            v-model="currency"
            class="form-control"
            required
          >
            <option value="USD">USD – US Dollar</option>
            <option value="EUR">EUR – Euro</option>
          </select>
        </div>

        <div class="form-group">
          <label for="date">Date</label>
          <input
            id="date"
            v-model="date"
            type="date"
            :max="todayDate"
            required
            class="form-control"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">Converting…</span>
          <span v-else>Convert to PLN</span>
        </button>
      </form>

      <div v-if="error" class="error-box">
        {{ error }}
      </div>

      <div v-if="result" class="result-section">
        <div class="result-row">
          <span class="result-value">{{ formattedPln }} PLN</span>
          <button
            class="copy-btn"
            @click="copyText(formattedPln + ' PLN')"
            title="Copy"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              />
            </svg>
          </button>
        </div>

        <div class="notes-section">
          <div class="notes-header">
            <span class="notes-label">Notes</span>
            <button
              class="copy-btn"
              @click="copyText(notesText)"
              title="Copy notes"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
              </svg>
            </button>
          </div>
          <pre class="notes-text">{{ notesText }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const amount = ref("");
const currency = ref("USD");
const date = ref("");
const loading = ref(false);
const error = ref("");
const result = ref(null);

const todayDate = computed(() => {
  return new Date().toISOString().split("T")[0];
});

const formattedPln = computed(() => {
  if (!result.value) return "";
  return (amount.value * result.value.mid).toFixed(2);
});

const notesText = computed(() => {
  if (!result.value) return "";
  const { mid, no, effectiveDate } = result.value;
  return (
    `Netto value/Wartość netto ${currency.value}: ${amount.value}.\n` +
    `Currency conversion/Konwersja walut: ${amount.value} ${currency.value} (1 ${currency.value} = ${mid} PLN).\n` +
    `Based on NBP avg exchange rates/Na podstawie średnich kursów wymiany NBP ${no} from ${effectiveDate}.`
  );
});

async function onSubmit() {
  error.value = "";
  result.value = null;
  loading.value = true;

  try {
    const url = `https://api.nbp.pl/api/exchangerates/rates/a/${currency.value.toLowerCase()}/${date.value}/?format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        error.value =
          "No exchange rate available for this date. Please choose a business day.";
      } else {
        error.value = `API error: ${response.status} ${response.statusText}`;
      }
      return;
    }

    const data = await response.json();
    result.value = data.rates[0];
  } catch (err) {
    error.value = `Network error: ${err.message}`;
  } finally {
    loading.value = false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for environments without clipboard API
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}

function closeSidebar() {
  // The sidebar is embedded in an arbitrary web page, so the parent origin is unknown.
  // We send no sensitive data and validation occurs in the content script (origin check).
  window.parent.postMessage({ type: "ICC_CLOSE_SIDEBAR" }, "*");
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  background: #fff;
  color: #1a1a1a;
}
</style>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #009688;
  color: #fff;
  flex-shrink: 0;
}

.sidebar-title {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.01em;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
  opacity: 0.8;
  transition: opacity 0.15s;
}

.close-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
}

.converter-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.form-control {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #1a1a1a;
  background: #fff;
  transition: border-color 0.15s;
  outline: none;
}

.form-control:focus {
  border-color: #009688;
  box-shadow: 0 0 0 2px rgba(0, 150, 136, 0.15);
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background: #009688;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-primary:hover:not(:disabled) {
  background: #00796b;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  padding: 10px 12px;
  color: #b91c1c;
  font-size: 13px;
  margin-bottom: 16px;
}

.result-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e0f2f1;
  border: 1px solid #b2dfdb;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 16px;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  color: #009688;
}

.copy-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  padding: 5px 7px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.copy-btn:hover {
  border-color: #1d4ed8;
  color: #1d4ed8;
  background: #eff6ff;
}

.notes-section {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.notes-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

.notes-text {
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
