<script lang="ts">
	import { onMount } from 'svelte';
	import { auth, db } from '$lib/firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
	import { writable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import '@material/web/button/filled-button.js';
	import '@material/web/labs/card/outlined-card.js';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/select/outlined-select.js';
	import '@material/web/select/select-option.js';

	const user = writable<any | null>(null);
	const projects = writable<any[]>([]);
	const loading = writable(true);
	const showCreateModal = writable(false);

	// Form state
	let title = '';
	let description = '';
	let status = 'Planning';
	let creating = false;
	let error = '';

	onMount(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
			user.set(firebaseUser);
			if (firebaseUser) {
				await fetchProjects(firebaseUser.uid);
			}
			loading.set(false);
		});
		return unsubscribe;
	});

	async function fetchProjects(uid: string) {
		const q = query(collection(db, 'projects'), where('assignedUsers', 'array-contains', uid));
		const querySnapshot = await getDocs(q);
		const result: any[] = [];
		querySnapshot.forEach((doc: any) => {
			result.push({ id: doc.id, ...doc.data() });
		});
		projects.set(result);
	}

	function openCreateProject() {
		title = '';
		description = '';
		status = 'Planning';
		error = '';
		showCreateModal.set(true);
	}

	function closeCreateProject() {
		showCreateModal.set(false);
	}

	async function createProject() {
		if (!title.trim()) {
			error = 'Project title is required.';
			return;
		}
		creating = true;
		error = '';
		try {
			let currentUser: any | null;
			user.subscribe((u) => (currentUser = u))();
			if (!currentUser) throw new Error('Not authenticated');
			await addDoc(collection(db, 'projects'), {
				title,
				description,
				status,
				assignedUsers: [currentUser.uid],
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp()
			});
			closeCreateProject();
			await fetchProjects(currentUser.uid);
		} catch (e: any) {
			error = e.message || 'Failed to create project.';
		} finally {
			creating = false;
		}
	}
</script>

<div class="projects-container">
	<div class="projects-header">Projects</div>
	{#if $loading}
		<p>Loading...</p>
	{:else if $projects.length === 0}
		<p>No projects found. Click the + button to create one.</p>
	{:else}
		<div class="projects-grid">
			{#each $projects as project}
				<md-outlined-card
					style="border-radius: var(--md-sys-shape-corner-large); box-shadow: 0 2px 8px rgba(103,80,164,0.08); position: relative;"
				>
					<div style="padding: 1.5rem;">
						<h2
							style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--md-sys-color-on-surface);"
						>
							{project.title}
						</h2>
						<p style="color: var(--md-sys-color-on-surface-variant); margin-bottom: 0.5rem;">
							{project.description}
						</p>
						<span
							style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 1rem; background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container); font-size: 0.95rem; font-weight: 500;"
							>{project.status}</span
						>
						<md-filled-button
							style="margin-top: 1rem; float: right;"
							aria-label="Edit Project"
							on:click={() => goto(`/dashboard/${project.id}`)}
						>
							<span class="material-symbols-outlined">edit</span>
							Edit
						</md-filled-button>
					</div>
				</md-outlined-card>
			{/each}
		</div>
	{/if}
</div>

<md-filled-button
	class="m3-fab"
	aria-label="Create Project"
	on:click={openCreateProject}
	style="border-radius: 50%; width: 56px; height: 56px; font-size: 2rem; min-width: 56px; min-height: 56px; padding: 0; display: flex; align-items: center; justify-content: center;"
>
	+
</md-filled-button>

{#if $showCreateModal}
	<div class="m3-modal-backdrop" on:click|self={closeCreateProject}>
		<form class="m3-modal" on:submit|preventDefault={createProject}>
			<h2>Create Project</h2>
			<md-outlined-text-field
				label="Title"
				value={title}
				on:input={(e) => (title = e.target.value)}
				required
				style="width: 100%;"
				autofocus
			></md-outlined-text-field>
			<md-outlined-text-field
				label="Description"
				value={description}
				on:input={(e) => (description = e.target.value)}
				style="width: 100%;"
				textarea
				rows="3"
			></md-outlined-text-field>
			<md-outlined-select
				label="Status"
				value={status}
				on:input={(e) => (status = e.target.value)}
				style="width: 100%;"
			>
				<md-select-option value="Planning">Planning</md-select-option>
				<md-select-option value="Active">Active</md-select-option>
				<md-select-option value="Paused">Paused</md-select-option>
				<md-select-option value="Complete">Complete</md-select-option>
			</md-outlined-select>
			{#if error}
				<div class="error">{error}</div>
			{/if}
			<div class="actions">
				<md-filled-button type="button" on:click={closeCreateProject} disabled={creating}
					>Cancel</md-filled-button
				>
				<md-filled-button type="submit" disabled={creating}
					>{creating ? 'Creating...' : 'Create'}</md-filled-button
				>
			</div>
		</form>
	</div>
{/if}

<style>
	.projects-container {
		width: 100%;
		max-width: none;
		margin: 0;
		padding: 2rem 2rem 2rem 2.5rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		box-sizing: border-box;
	}
	.projects-header {
		font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
		font-size: 2.5rem;
		font-weight: 800;
		color: var(--md-sys-color-primary);
		margin-bottom: 2rem;
		text-align: left;
		letter-spacing: -1px;
	}
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 100vw;
		box-sizing: border-box;
	}
	@media (max-width: 900px) {
		.projects-container {
			padding: 1.5rem 0.5rem 1.5rem 0.5rem;
		}
		.projects-header {
			font-size: 2rem;
		}
		.projects-grid {
			gap: 1rem;
		}
	}
	.m3-fab {
		position: fixed;
		right: 2rem;
		bottom: 2rem;
		z-index: 100;
	}
	.m3-modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.32);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.m3-modal {
		background: var(--md-sys-color-surface, #fff);
		border-radius: var(--md-sys-shape-corner-large);
		box-shadow: 0 8px 32px rgba(103, 80, 164, 0.18);
		padding: 2.5rem 2rem 2rem 2rem;
		min-width: 320px;
		max-width: 95vw;
		width: 400px;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.m3-modal h2 {
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}
	.m3-modal .actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}
	.m3-modal .error {
		color: #b3261e;
		font-size: 0.95rem;
		margin-bottom: 0.5rem;
	}
</style>
