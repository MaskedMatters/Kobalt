<script lang="ts">
	import { onMount, afterUpdate } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let drawerOpen = false;
	let pillTop = 0;
	let pillLeft = 0;
	let pillWidth = 56;
	let pillHeight = 56;
	let pillVisible = false;
	let navRef0: HTMLElement;
	let navRef1: HTMLElement;
	let navRef2: HTMLElement;
	let navContainer: HTMLElement;

	function navigateTo(path: string) {
		drawerOpen = false;
		if (get(page).url.pathname !== path) {
			goto(path);
		}
	}

	function handleKey(e: KeyboardEvent, path: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			navigateTo(path);
		}
	}

	function updatePill() {
		const current = get(page).url.pathname;
		let ref: HTMLElement | undefined;
		if (current === '/dashboard') ref = navRef0;
		else if (current.startsWith('/dashboard/') && current !== '/dashboard' && current !== '/dashboard/settings') ref = navRef1;
		else if (current === '/dashboard/settings') ref = navRef2;
		if (ref && navContainer) {
			pillTop = ref.offsetTop;
			pillLeft = ref.offsetLeft;
			pillWidth = ref.offsetWidth;
			pillHeight = ref.offsetHeight;
			pillVisible = true;
		}
	}

	onMount(() => {
		setTimeout(updatePill, 0);
		window.addEventListener('resize', updatePill);
		return () => window.removeEventListener('resize', updatePill);
	});

afterUpdate(() => {
		setTimeout(updatePill, 0);
	});
</script>

<div class="layout-root">
	<nav class="vertical-nav" aria-label="Main navigation" bind:this={navContainer}>
		<!-- Pill indicator -->
		{#if pillVisible}
			<div
				class="nav-rail-pill"
				style="
					transform: translate({pillLeft}px, {pillTop}px);
					width: {pillWidth}px;
					height: {pillHeight}px;
				"
			></div>
		{/if}
		<div class="nav-rail-top">
			<div
				bind:this={navRef0}
				class="nav-rail-item {get(page).url.pathname === '/dashboard' ? 'selected' : ''}"
				role="button"
				tabindex="0"
				aria-label="Projects"
				on:click={() => navigateTo('/dashboard')}
				on:keydown={(e) => handleKey(e, '/dashboard')}
			>
				<span class="material-symbols-outlined">folder_open</span>
				<span class="nav-rail-label">Projects</span>
			</div>
			<div
				bind:this={navRef1}
				class="nav-rail-item {get(page).url.pathname === '/dashboard/tasks' ? 'selected' : ''}"
				role="button"
				tabindex="0"
				aria-label="Tasks"
				on:click={() => navigateTo('/dashboard/tasks')}
				on:keydown={(e) => handleKey(e, '/dashboard/tasks')}
			>
				<span class="material-symbols-outlined">checklist</span>
				<span class="nav-rail-label">Tasks</span>
			</div>
		</div>
		<div class="nav-rail-bottom">
			<div class="nav-rail-divider"></div>
			<div
				bind:this={navRef2}
				class="nav-rail-item {get(page).url.pathname === '/dashboard/settings' ? 'selected' : ''}"
				role="button"
				tabindex="0"
				aria-label="Settings"
				on:click={() => navigateTo('/dashboard/settings')}
				on:keydown={(e) => handleKey(e, '/dashboard/settings')}
			>
				<span class="material-symbols-outlined">settings</span>
				<span class="nav-rail-label">Settings</span>
			</div>
		</div>
	</nav>
	<div class="main-content" data-viewtransition="main">
		<slot />
	</div>
</div>

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
		box-shadow: 2px 0 8px rgba(103, 80, 164, 0.08);
		z-index: 1002;
		justify-content: space-between;
		position: relative;
	}
	.nav-rail-pill {
		position: absolute;
		left: 0;
		top: 0;
		background: var(--md-sys-color-primary-container);
		border-radius: 28px;
		box-shadow: 0 4px 16px rgba(103, 80, 164, 0.10);
		transition:
			transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
			width 0.25s,
			height 0.25s,
			background 0.25s;
		z-index: 0;
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
		position: sticky;
		bottom: 0;
		background: var(--md-sys-color-surface-variant);
		z-index: 1003;
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
		transition:
			background 0.15s,
			color 0.15s,
			transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1;
	}
	.nav-rail-item.selected,
	.nav-rail-item:focus {
		background: transparent;
		color: var(--md-sys-color-on-primary-container);
		transform: scale(1.08);
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
		transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	@media (max-width: 700px) {
		.layout-root {
			flex-direction: column;
		}
		.vertical-nav {
			flex-direction: row;
			width: 100vw;
			height: 56px;
			padding-top: 0;
			box-shadow: 0 -2px 12px rgba(103, 80, 164, 0.12);
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 1002;
			justify-content: center;
			border-radius: 20px 20px 0 0;
			background: var(--md-sys-color-surface-variant);
		}
		.nav-rail-pill {
			border-radius: 20px;
			box-shadow: 0 2px 8px rgba(103, 80, 164, 0.10);
		}
		.nav-rail-top,
		.nav-rail-bottom {
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
		.nav-rail-bottom {
			position: fixed;
			bottom: 0;
			left: auto;
			width: auto;
			margin-bottom: 0;
			background: var(--md-sys-color-surface-variant);
			z-index: 1003;
		}
	}
</style>
