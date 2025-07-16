<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase';
	import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
	import { writable } from 'svelte/store';
	import { doc, getDoc, setDoc } from 'firebase/firestore';
	import { goto } from '$app/navigation';
	import '@material/web/button/filled-button.js';
	import '@material/web/labs/card/outlined-card.js';

	const user = writable<any | null>(null);

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
			user.set(firebaseUser);
			if (firebaseUser) {
				goto('/dashboard');
			}
		});
		return unsubscribe;
	});

	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			const firebaseUser = result.user;
			// Store user info in Firestore if not already present
			const userRef = doc(db, 'users', firebaseUser.uid);
			const userSnap = await getDoc(userRef);
			if (!userSnap.exists()) {
				await setDoc(userRef, {
					uid: firebaseUser.uid,
					displayName: firebaseUser.displayName,
					email: firebaseUser.email,
					photoURL: firebaseUser.photoURL,
					createdAt: new Date().toISOString()
				});
			}
			goto('/dashboard');
		} catch (error) {
			alert('Sign in failed: ' + error);
		}
	}

	async function signOutUser() {
		await signOut(auth);
	}
</script>

<div class="expressive-bg">
	<div class="expressive-header">
		<span class="material-symbols-outlined">dashboard_customize</span>
		<div class="main-title">Codak</div>
		<div class="subtitle">PQAR Project & Task Management</div>
	</div>
	<div class="centered-card">
		<md-outlined-card>
			{#if $user}
				{#if $user.photoURL}
					<img class="avatar" src={$user.photoURL} alt="User avatar" />
				{/if}
				<div class="title">Welcome, {$user.displayName}!</div>
				<div class="subtitle">{$user.email}</div>
				<md-filled-button on:click={signOutUser} style="width: 100%;">
					<span class="material-symbols-outlined">logout</span>
					Sign Out
				</md-filled-button>
			{:else}
				<div class="title">Welcome to Codak</div>
				<div class="subtitle">Sign in to manage your PQAR projects and tasks</div>
				<md-filled-button on:click={signInWithGoogle} style="width: 100%;">
					<span class="material-symbols-outlined">login</span>
					Sign in with Google
				</md-filled-button>
			{/if}
		</md-outlined-card>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined');

	.expressive-bg {
		min-height: 100vh;
		background: linear-gradient(135deg, #eaddff 0%, #d0bcff 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}
	.expressive-header {
		width: 100vw;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		padding: 3.5rem 0 2.5rem 0;
		text-align: center;
		border-bottom-left-radius: 48px;
		border-bottom-right-radius: 48px;
		box-shadow: 0 8px 32px rgba(103, 80, 164, 0.18);
		margin-bottom: 2.5rem;
	}
	.expressive-header .material-symbols-outlined {
		font-size: 3.5rem;
		vertical-align: middle;
		margin-bottom: 0.5rem;
		display: block;
	}
	.expressive-header .main-title {
		font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
		font-size: 2.8rem;
		font-weight: 800;
		letter-spacing: -1px;
		margin-bottom: 0.5rem;
	}
	.expressive-header .subtitle {
		font-size: 1.25rem;
		font-weight: 500;
		opacity: 0.92;
	}
	.centered-card {
		flex: 1;
		display: flex;
		align-items: flex-start;
		justify-content: center;
	}
	md-outlined-card {
		margin-top: 2.5rem;
		padding: 2.5rem 2rem;
		border-radius: var(--md-sys-shape-corner-extra-large);
		box-shadow: 0 8px 32px rgba(103, 80, 164, 0.18);
		min-width: 340px;
		max-width: 95vw;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		background: var(--md-sys-color-surface);
	}
	.title {
		font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
		font-size: 2rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
		margin-bottom: 0.5rem;
	}
	.subtitle {
		color: var(--md-sys-color-on-surface-variant);
		font-size: 1.1rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}
	.avatar {
		width: 72px;
		height: 72px;
		border-radius: 50%;
		margin-bottom: 1rem;
		box-shadow: 0 2px 8px rgba(103, 80, 164, 0.1);
	}
	md-filled-button {
		font-size: 1.15rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		border-radius: var(--md-sys-shape-corner-large);
		min-height: 48px;
		min-width: 220px;
		box-shadow: 0 2px 8px rgba(103, 80, 164, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}
	md-filled-button .material-symbols-outlined {
		font-size: 1.6rem;
		margin-right: 0.5rem;
	}
</style>
