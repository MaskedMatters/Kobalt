<script lang="ts">
import { onMount } from 'svelte';
import { auth } from '$lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { writable } from 'svelte/store';
import '@material/web/button/filled-button.js';
import '@material/web/labs/card/outlined-card.js';

const user = writable<any | null>(null);
const darkMode = writable(false);

onMount(() => {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
    user.set(firebaseUser);
  });
  // Check for dark mode preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    darkMode.set(true);
    document.documentElement.classList.add('dark');
  }
  return unsubscribe;
});

function toggleDarkMode() {
  darkMode.update((v: boolean) => {
    if (!v) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return !v;
  });
}

async function signOutUser() {
  await signOut(auth);
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.settings-container {
  max-width: 480px;
  margin: 3rem auto 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
md-outlined-card {
  width: 100%;
  border-radius: var(--md-sys-shape-corner-extra-large);
  box-shadow: 0 8px 32px rgba(103,80,164,0.18);
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  background: var(--md-sys-color-surface);
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(103,80,164,0.10);
}
.user-name {
  font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
  margin-bottom: 0.25rem;
}
.user-email {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
  text-align: center;
}
.settings-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0 0 0;
}
.toggle-switch {
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: var(--md-sys-color-surface-variant);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}
.toggle-switch.dark {
  background: var(--md-sys-color-primary-container);
}
.toggle-knob {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--md-sys-color-primary);
  position: absolute;
  left: 2px;
  transition: left 0.2s, background 0.2s;
}
.toggle-switch.dark .toggle-knob {
  left: 22px;
  background: var(--md-sys-color-on-primary-container);
}
.toggle-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}
md-filled-button {
  margin-top: 2rem;
  min-width: 180px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--md-sys-shape-corner-large);
}
:global(.dark) {
  --md-sys-color-surface: #181825;
  --md-sys-color-on-surface: #f4eff4;
  --md-sys-color-surface-variant: #23233a;
  --md-sys-color-on-surface-variant: #c7c2d0;
  --md-sys-color-primary: #d0bcff;
  --md-sys-color-on-primary: #381e72;
  --md-sys-color-primary-container: #4f378b;
  --md-sys-color-on-primary-container: #eaddff;
  --md-sys-color-secondary-container: #4a4458;
  --md-sys-color-on-secondary-container: #e8def8;
  --md-sys-color-outline: #938f99;
}
</style>

<div class="settings-container">
  <md-outlined-card>
    {#if $user}
      {#if $user.photoURL}
        <img class="avatar" src="{$user.photoURL}" alt="User avatar" />
      {/if}
      <div class="user-name">{$user.displayName}</div>
      <div class="user-email">{$user.email}</div>
    {/if}
    <div class="settings-row">
      <span class="material-symbols-outlined">dark_mode</span>
      <span class="toggle-label">Dark Mode</span>
      <div class="toggle-switch { $darkMode ? 'dark' : '' }" role="switch" tabindex="0" aria-checked={$darkMode} on:click={toggleDarkMode} on:keydown={e => (e.key === 'Enter' || e.key === ' ') && toggleDarkMode()}>
        <div class="toggle-knob"></div>
      </div>
    </div>
    <md-filled-button on:click={signOutUser} style="width: 100%;">
      <span class="material-symbols-outlined">logout</span>
      Sign Out
    </md-filled-button>
  </md-outlined-card>
</div> 