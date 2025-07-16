<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get } from 'svelte/store';

let drawerOpen = false;

function navigateTo(path: string) {
  drawerOpen = false;
  if (get(page).url.pathname !== path) {
    goto(path);
  }
}

function handleKey(e, path) {
  if (e.key === 'Enter' || e.key === ' ') {
    navigateTo(path);
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

.layout-root {
  min-height: 100vh;
  background: var(--md-sys-color-surface);
  display: flex;
  flex-direction: row;
}
.vertical-nav {
  width: 80px;
  background: var(--md-sys-color-surface-variant);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 32px;
  box-shadow: 2px 0 8px rgba(103,80,164,0.08);
  z-index: 1002;
  justify-content: space-between;
}
.nav-rail-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.nav-rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 24px;
}
.nav-rail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 12px 0;
  border-radius: var(--md-sys-shape-corner-large);
  color: var(--md-sys-color-on-surface-variant);
  font-size: 1.7rem;
  cursor: pointer;
  outline: none;
  background: none;
  border: none;
  transition: background 0.15s, color 0.15s;
}
.nav-rail-item.selected, .nav-rail-item:focus {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}
.nav-rail-item:active {
  background: var(--md-sys-color-secondary-container);
}
.nav-rail-label {
  font-size: 0.8rem;
  margin-top: 0.2rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.nav-rail-divider {
  width: 40px;
  height: 2px;
  background: var(--md-sys-color-outline);
  border-radius: 1px;
  margin: 16px 0 8px 0;
  opacity: 0.18;
}
.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0 0 0;
}
@media (max-width: 700px) {
  .layout-root {
    flex-direction: column;
  }
  .vertical-nav {
    flex-direction: row;
    width: 100vw;
    height: 64px;
    padding-top: 0;
    box-shadow: 0 -2px 8px rgba(103,80,164,0.08);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1002;
    justify-content: center;
  }
  .nav-rail-top, .nav-rail-bottom {
    flex-direction: row;
    margin-bottom: 0;
  }
  .nav-rail-divider {
    display: none;
  }
  .nav-rail-item {
    margin: 0 12px;
    width: 56px;
    height: 56px;
  }
  .main-content {
    padding-bottom: 72px;
    align-items: stretch;
  }
}
</style>

<div class="layout-root">
  <nav class="vertical-nav" aria-label="Main navigation">
    <div class="nav-rail-top">
      <div
        class="nav-rail-item {get(page).url.pathname === '/dashboard' ? 'selected' : ''}"
        role="button"
        tabindex="0"
        aria-label="Projects"
        on:click={() => navigateTo('/dashboard')}
        on:keydown={e => handleKey(e, '/dashboard')}
      >
        <span class="material-symbols-outlined">folder_open</span>
        <span class="nav-rail-label">Projects</span>
      </div>
      <div
        class="nav-rail-item {get(page).url.pathname.startsWith('/dashboard/') && get(page).url.pathname !== '/dashboard' && get(page).url.pathname !== '/dashboard/settings' ? 'selected' : ''}"
        role="button"
        tabindex="0"
        aria-label="Tasks"
        on:click={() => {
          // If on a project page, stay; else, go to dashboard
          if (get(page).params.id) navigateTo(`/dashboard/${get(page).params.id}`);
          else navigateTo('/dashboard');
        }}
        on:keydown={e => handleKey(e, get(page).params.id ? `/dashboard/${get(page).params.id}` : '/dashboard')}
      >
        <span class="material-symbols-outlined">checklist</span>
        <span class="nav-rail-label">Tasks</span>
      </div>
    </div>
    <div class="nav-rail-bottom">
      <div class="nav-rail-divider"></div>
      <div
        class="nav-rail-item {get(page).url.pathname === '/dashboard/settings' ? 'selected' : ''}"
        role="button"
        tabindex="0"
        aria-label="Settings"
        on:click={() => navigateTo('/dashboard/settings')}
        on:keydown={e => handleKey(e, '/dashboard/settings')}
      >
        <span class="material-symbols-outlined">settings</span>
        <span class="nav-rail-label">Settings</span>
      </div>
    </div>
  </nav>
  <div class="main-content">
    <slot />
  </div>
</div> 