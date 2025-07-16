<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import {
		collection,
		doc,
		getDoc,
		getDocs,
		addDoc,
		updateDoc,
		deleteDoc,
		serverTimestamp,
		query,
		orderBy
	} from 'firebase/firestore';
	import { writable, get } from 'svelte/store';
	import '@material/web/button/filled-button.js';
	import '@material/web/labs/card/outlined-card.js';
	import '@material/web/textfield/outlined-text-field.js';
	import '@material/web/select/outlined-select.js';
	import '@material/web/select/select-option.js';
	import '@material/web/icon/icon.js';

	const project = writable<any>(null);
	const tasks = writable<any[]>([]);
	const loading = writable(true);
	const showTaskModal = writable(false);
	const editingTask = writable<any | null>(null);
	let editingProject = false;
	let projectTitle = '';
	let projectDescription = '';
	let projectStatus = '';
	let projectOwner = '';
	let projectError = '';
	let showDeleteConfirm = false;

	let title = '';
	let description = '';
	let status = 'To Do';
	let dueDate = '';
	let assignedUser = '';
	let error = '';
	let creating = false;

	let users: any[] = [];

	onMount(async () => {
		loading.set(true);
		const projectId = get(page).params.id;
		const projectRef = doc(db, 'projects', projectId);
		const projectSnap = await getDoc(projectRef);
		if (projectSnap.exists()) {
			project.set({ id: projectSnap.id, ...projectSnap.data() });
			await fetchTasks(projectId);
			await fetchUsers();
		}
		loading.set(false);
	});

	async function fetchTasks(projectId: string) {
		const q = query(collection(db, 'projects', projectId, 'tasks'), orderBy('createdAt', 'desc'));
		const querySnapshot = await getDocs(q);
		const result: any[] = [];
		querySnapshot.forEach((doc) => {
			result.push({ id: doc.id, ...doc.data() });
		});
		tasks.set(result);
	}

	async function fetchUsers() {
		const q = query(collection(db, 'users'));
		const querySnapshot = await getDocs(q);
		users = [];
		querySnapshot.forEach((doc) => {
			users.push({ id: doc.id, ...doc.data() });
		});
	}

	function openTaskModal(task: any = null) {
		if (task) {
			editingTask.set(task);
			title = task.title;
			description = task.description;
			status = task.status;
			dueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
			assignedUser = task.assignedUser || '';
		} else {
			editingTask.set(null);
			title = '';
			description = '';
			status = 'To Do';
			dueDate = '';
			assignedUser = '';
		}
		error = '';
		showTaskModal.set(true);
	}

	function closeTaskModal() {
		showTaskModal.set(false);
	}

	async function saveTask() {
		if (!title.trim()) {
			error = 'Task title is required.';
			return;
		}
		creating = true;
		error = '';
		const projectId = get(page).params.id;
		try {
			if (get(editingTask)) {
				// Edit
				const taskRef = doc(db, 'projects', projectId, 'tasks', get(editingTask).id);
				await updateDoc(taskRef, {
					title,
					description,
					status,
					dueDate,
					assignedUser,
					updatedAt: serverTimestamp()
				});
			} else {
				// Create
				await addDoc(collection(db, 'projects', projectId, 'tasks'), {
					title,
					description,
					status,
					dueDate,
					assignedUser,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp()
				});
			}
			await fetchTasks(projectId);
			closeTaskModal();
		} catch (e: any) {
			error = e.message || 'Failed to save task.';
		} finally {
			creating = false;
		}
	}

	async function deleteTask(taskId: string) {
		const projectId = get(page).params.id;
		await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
		await fetchTasks(projectId);
	}

	// Inline editing: always show editable fields for project
	$: currentProject = $project;
	$: projectTitle = currentProject?.title ?? '';
	$: projectDescription = currentProject?.description ?? '';
	$: projectStatus = currentProject?.status ?? '';
	$: projectOwner = currentProject?.owner ?? '';
	$: assignedUsers = currentProject?.assignedUsers ?? [];

	async function saveProjectInline() {
		const projectId = get(page).params.id;
		if (!projectTitle.trim()) {
			projectError = 'Project title is required.';
			return;
		}
		editingProject = true;
		projectError = '';
		try {
			const update: any = {
				title: projectTitle,
				description: projectDescription,
				status: projectStatus,
				owner: projectOwner,
				assignedUsers,
				updatedAt: serverTimestamp()
			};
			await updateDoc(doc(db, 'projects', projectId), update);
			const projectSnap = await getDoc(doc(db, 'projects', projectId));
			if (projectSnap.exists()) project.set({ id: projectSnap.id, ...projectSnap.data() });
		} catch (e: any) {
			projectError = e.message || 'Failed to update project.';
		} finally {
			editingProject = false;
		}
	}

	async function becomeOwner() {
		const projectId = get(page).params.id;
		const me = users.find(u => u.id === currentUserId());
		if (!me) return;
		try {
			await updateDoc(doc(db, 'projects', projectId), {
				owner: me.id,
				assignedUsers: assignedUsers.includes(me.id) ? assignedUsers : [...assignedUsers, me.id],
				updatedAt: serverTimestamp()
			});
			const projectSnap = await getDoc(doc(db, 'projects', projectId));
			if (projectSnap.exists()) project.set({ id: projectSnap.id, ...projectSnap.data() });
		} catch (e: any) {
			projectError = e.message || 'Failed to become owner.';
		}
	}

	function currentUserId() {
		// Try to get the current user from assignedUsers or owner
		return users.find(u => u.email === $page.data?.user?.email)?.id || $page.data?.user?.uid;
	}

	function toggleUserAssignment(uid: string) {
		if (assignedUsers.includes(uid)) {
			assignedUsers = assignedUsers.filter(id => id !== uid);
		} else {
			assignedUsers = [...assignedUsers, uid];
		}
	}

	async function deleteProject() {
		const projectId = get(page).params.id;
		try {
			await deleteDoc(doc(db, 'projects', projectId));
			window.location.href = '/dashboard';
		} catch (e: any) {
			projectError = e.message || 'Failed to delete project.';
		}
	}
</script>

<div class="page-container">
	{#if $loading}
		<p>Loading...</p>
	{:else if $project}
		<md-outlined-card class="project-details-card">
			<h2 class="project-details-title">Project Details</h2>
			<div class="project-fields">
				<md-outlined-text-field
					label="Title"
					value={projectTitle}
					on:input={(e) => (projectTitle = e.target.value)}
					required
					style="width: 100%; margin-bottom: 1rem;"
				></md-outlined-text-field>
				<md-outlined-text-field
					label="Description"
					value={projectDescription}
					on:input={(e) => (projectDescription = e.target.value)}
					style="width: 100%; margin-bottom: 1rem;"
					textarea
					rows="3"
				></md-outlined-text-field>
				<md-outlined-select
					label="Status"
					value={projectStatus}
					on:input={(e) => (projectStatus = e.target.value)}
					style="width: 100%; margin-bottom: 1rem;"
				>
					<md-select-option value="Planning">Planning</md-select-option>
					<md-select-option value="Active">Active</md-select-option>
					<md-select-option value="Paused">Paused</md-select-option>
					<md-select-option value="Complete">Complete</md-select-option>
				</md-outlined-select>
				<md-outlined-select
					label="Owner"
					value={projectOwner}
					on:input={(e) => (projectOwner = e.target.value)}
					style="width: 100%; margin-bottom: 1rem;"
				>
					{#each users as u}
						<md-select-option value={u.id}>{u.displayName || u.email}</md-select-option>
					{/each}
				</md-outlined-select>
				<div class="assigned-users-section">
					<strong>Assigned Users:</strong>
					<div class="user-selection-grid">
						{#each users as u}
							<div class="user-selection-item">
								<md-filled-button
									class="user-chip {assignedUsers.includes(u.id) ? 'selected' : ''}"
									on:click={() => toggleUserAssignment(u.id)}
								>
									<span class="user-avatar">
										{#if u.photoURL}
											<img src={u.photoURL} alt="" />
										{:else}
											<span class="material-symbols-outlined">person</span>
										{/if}
									</span>
									<span class="user-name">{u.displayName || u.email}</span>
									{#if assignedUsers.includes(u.id)}
										<span class="material-symbols-outlined check-icon">check</span>
									{/if}
								</md-filled-button>
							</div>
						{/each}
					</div>
				</div>
				{#if projectError}
					<div class="error">{projectError}</div>
				{/if}
				<div class="project-actions">
					<md-filled-button on:click={saveProjectInline} style="margin-right: 1rem;">Save Changes</md-filled-button>
					<md-filled-button style="background: #b3261e; color: #fff;" on:click={() => showDeleteConfirm = true}>Delete Project</md-filled-button>
				</div>
				
				{#if showDeleteConfirm}
					<div class="delete-confirmation">
						<div class="delete-warning">
							<span class="material-symbols-outlined warning-icon">warning</span>
							<div class="delete-text">
								<h3>Delete Project</h3>
								<p>Are you sure you want to delete "{$project?.title}"? This action cannot be undone and will permanently remove the project and all its tasks.</p>
							</div>
						</div>
						<div class="delete-actions">
							<md-filled-button on:click={() => showDeleteConfirm = false}>Cancel</md-filled-button>
							<md-filled-button style="background: #b3261e; color: #fff;" on:click={deleteProject}>Yes, Delete Project</md-filled-button>
						</div>
					</div>
				{/if}

			</div>
		</md-outlined-card>
		<hr class="project-divider" />
		<h2 class="tasks-title">Tasks</h2>
		{#each $tasks as task}
			<md-outlined-card class="task-card">
				<div style="padding: 1.25rem;">
					<div class="task-title">{task.title}</div>
					<div class="task-meta">{task.description}</div>
					<div class="task-meta">
						<span class="task-status">{task.status}</span>
						{#if task.dueDate}
							<span>Due: {task.dueDate}</span>
						{/if}
						{#if task.assignedUser}
							<span>
								| Assigned: {users.find((u) => u.id === task.assignedUser)?.displayName ||
									task.assignedUser}</span
							>
						{/if}
					</div>
					<div class="task-actions">
						<md-filled-button on:click={() => openTaskModal(task)} style="min-width: 40px;">Edit</md-filled-button>
						<md-filled-button on:click={() => deleteTask(task.id)} style="min-width: 40px; background: #b3261e; color: #fff;">Delete</md-filled-button>
					</div>
				</div>
			</md-outlined-card>
		{/each}
		<md-filled-button
			class="m3-fab"
			aria-label="Add Task"
			on:click={() => openTaskModal()}
			style="border-radius: 50%; width: 56px; height: 56px; font-size: 2rem; min-width: 56px; min-height: 56px; padding: 0; display: flex; align-items: center; justify-content: center; position: fixed; right: 2rem; bottom: 2rem;"
		>
			+
		</md-filled-button>
	{/if}
</div>

{#if $showTaskModal}
	<div class="m3-modal-backdrop" on:click|self={closeTaskModal}>
		<form class="m3-modal" on:submit|preventDefault={saveTask}>
			<h2>{$editingTask ? 'Edit Task' : 'Create Task'}</h2>
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
				<md-select-option value="To Do">To Do</md-select-option>
				<md-select-option value="In Progress">In Progress</md-select-option>
				<md-select-option value="Done">Done</md-select-option>
			</md-outlined-select>
			<md-outlined-text-field
				label="Due Date"
				type="date"
				value={dueDate}
				on:input={(e) => (dueDate = e.target.value)}
				style="width: 100%;"
			></md-outlined-text-field>
			<div class="task-user-assignment">
				<label class="task-user-label">Assigned User</label>
				<div class="task-user-selection">
					<div class="task-user-option {assignedUser === '' ? 'selected' : ''}" on:click={() => assignedUser = ''}>
						<span class="user-avatar">
							<span class="material-symbols-outlined">person_off</span>
						</span>
						<span class="user-name">Unassigned</span>
						{#if assignedUser === ''}
							<span class="material-symbols-outlined check-icon">check</span>
						{/if}
					</div>
					{#each users as u}
						<div class="task-user-option {assignedUser === u.id ? 'selected' : ''}" on:click={() => assignedUser = u.id}>
							<span class="user-avatar">
								{#if u.photoURL}
									<img src={u.photoURL} alt="" />
								{:else}
									<span class="material-symbols-outlined">person</span>
								{/if}
							</span>
							<span class="user-name">{u.displayName || u.email}</span>
							{#if assignedUser === u.id}
								<span class="material-symbols-outlined check-icon">check</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
			{#if error}
				<div class="error">{error}</div>
			{/if}
			<div class="actions">
				<md-filled-button type="button" on:click={closeTaskModal} disabled={creating}
					>Cancel</md-filled-button
				>
				<md-filled-button type="submit" disabled={creating}
					>{creating ? 'Saving...' : $editingTask ? 'Save' : 'Create'}</md-filled-button
				>
			</div>
		</form>
	</div>
{/if}

<style>
	.page-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	.header {
		font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
		font-size: 2.2rem;
		font-weight: 800;
		color: var(--md-sys-color-primary);
		margin-bottom: 1.5rem;
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
	.task-card {
		margin-bottom: 1.5rem;
		border-radius: var(--md-sys-shape-corner-large);
		box-shadow: 0 2px 8px rgba(103, 80, 164, 0.08);
	}
	.task-title {
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--md-sys-color-on-surface);
		margin-bottom: 0.25rem;
	}
	.task-meta {
		font-size: 0.95rem;
		color: var(--md-sys-color-on-surface-variant);
		margin-bottom: 0.5rem;
	}
	.task-status {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 1rem;
		background: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
		font-size: 0.95rem;
		font-weight: 500;
		margin-right: 0.5rem;
	}
	.task-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
	.project-details-card {
		max-width: 700px;
		margin: 0 auto 2rem auto;
		padding: 2.5rem 2rem 2rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: var(--md-sys-color-surface);
		border-radius: var(--md-sys-shape-corner-extra-large);
		box-shadow: 0 8px 32px rgba(103, 80, 164, 0.18);
	}
	.project-details-title {
		font-size: 2rem;
		font-weight: 800;
		color: var(--md-sys-color-primary);
		margin-bottom: 0.5rem;
	}
	.project-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.assigned-users-section {
		margin: 1rem 0;
		width: 100%;
	}
	.assigned-users-section strong {
		display: block;
		margin-bottom: 0.75rem;
		font-size: 1rem;
		color: var(--md-sys-color-on-surface);
	}
	.user-selection-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.user-selection-item {
		flex: 0 0 auto;
	}
	.user-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--md-sys-shape-corner-large);
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s ease;
		min-height: 40px;
		background: var(--md-sys-color-surface-variant);
		color: var(--md-sys-color-on-surface);
		border: 2px solid transparent;
	}
	.user-chip:hover {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(103, 80, 164, 0.15);
	}
	.user-chip.selected {
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		border-color: var(--md-sys-color-primary);
		box-shadow: 0 2px 8px rgba(103, 80, 164, 0.2);
	}
	.user-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--md-sys-color-surface);
		overflow: hidden;
	}
	.user-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.user-avatar .material-symbols-outlined {
		font-size: 16px;
		color: var(--md-sys-color-on-surface-variant);
	}
	.user-chip.selected .user-avatar .material-symbols-outlined {
		color: var(--md-sys-color-primary);
	}
	.user-name {
		font-weight: 500;
		white-space: nowrap;
	}
	.check-icon {
		font-size: 18px;
		margin-left: 0.25rem;
	}
	.task-user-assignment {
		width: 100%;
	}
	.task-user-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--md-sys-color-on-surface-variant);
		margin-bottom: 0.5rem;
	}
	.task-user-selection {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid var(--md-sys-color-outline);
		border-radius: var(--md-sys-shape-corner-medium);
		padding: 0.5rem;
		background: var(--md-sys-color-surface);
	}
	.task-user-option {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: var(--md-sys-shape-corner-medium);
		cursor: pointer;
		transition: all 0.2s ease;
		background: var(--md-sys-color-surface);
		border: 2px solid transparent;
		color: var(--md-sys-color-on-surface);
	}
	.task-user-option:hover {
		background: var(--md-sys-color-surface-variant);
		transform: translateX(2px);
	}
	.task-user-option.selected {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		border-color: var(--md-sys-color-primary);
	}
	.task-user-option .user-avatar {
		width: 32px;
		height: 32px;
	}
	.task-user-option .user-name {
		flex: 1;
		font-weight: 500;
	}
	.project-actions {
		display: flex;
		align-items: center;
		margin-top: 1rem;
	}
	.project-divider {
		margin: 2.5rem 0 2rem 0;
		border: none;
		height: 2px;
		background: var(--md-sys-color-outline);
		opacity: 0.18;
		border-radius: 1px;
	}
	.tasks-title {
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--md-sys-color-primary);
		margin-bottom: 1rem;
	}
	.delete-confirmation {
		margin-top: 1.5rem;
		padding: 1.5rem;
		border: 2px solid #b3261e;
		border-radius: var(--md-sys-shape-corner-large);
		background: rgba(179, 38, 30, 0.05);
	}
	.delete-warning {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.warning-icon {
		font-size: 2rem;
		color: #b3261e;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}
	.delete-text h3 {
		font-size: 1.2rem;
		font-weight: 600;
		color: #b3261e;
		margin: 0 0 0.5rem 0;
	}
	.delete-text p {
		font-size: 1rem;
		color: var(--md-sys-color-on-surface);
		margin: 0;
		line-height: 1.5;
	}
	.delete-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}
	
	/* Dark mode specific overrides for better visibility */
	:global(.dark) .user-chip {
		background: var(--md-sys-color-surface-variant);
		color: var(--md-sys-color-on-surface);
		border: 1px solid var(--md-sys-color-outline);
	}
	
	:global(.dark) .user-chip:hover {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		border-color: var(--md-sys-color-primary);
	}
	
	:global(.dark) .task-user-option {
		color: var(--md-sys-color-on-surface);
		border: 1px solid var(--md-sys-color-outline);
	}
	
	:global(.dark) .task-user-option:hover {
		background: var(--md-sys-color-surface-variant);
		color: var(--md-sys-color-on-surface);
		border-color: var(--md-sys-color-primary);
	}
	
	:global(.dark) .task-user-option.selected {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		border-color: var(--md-sys-color-primary);
	}
	
	/* Ensure dropdown text is visible in dark mode */
	:global(.dark) md-select-option {
		color: var(--md-sys-color-on-surface) !important;
	}
	
	:global(.dark) md-select-option:hover {
		background: var(--md-sys-color-surface-variant) !important;
		color: var(--md-sys-color-on-surface) !important;
	}
</style>

