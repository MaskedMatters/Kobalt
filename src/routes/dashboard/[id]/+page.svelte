<script lang="ts">
import { page } from '$app/stores';
import { onMount } from 'svelte';
import { db } from '$lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
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
</script>

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
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.32);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.m3-modal {
  background: var(--md-sys-color-surface, #fff);
  border-radius: var(--md-sys-shape-corner-large);
  box-shadow: 0 8px 32px rgba(103,80,164,0.18);
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
  box-shadow: 0 2px 8px rgba(103,80,164,0.08);
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
</style>

<div class="page-container">
  {#if $loading}
    <p>Loading...</p>
  {:else if $project}
    <div class="header">{ $project.title }</div>
    <div style="margin-bottom: 1.5rem; color: var(--md-sys-color-on-surface-variant);">{ $project.description }</div>
    <div style="margin-bottom: 2rem;">
      <span class="task-status">{ $project.status }</span>
    </div>
    <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 1rem; color: var(--md-sys-color-primary);">Tasks</h2>
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
              <span> | Assigned: {users.find(u => u.id === task.assignedUser)?.displayName || task.assignedUser}</span>
            {/if}
          </div>
          <div class="task-actions">
            <md-filled-button on:click={() => openTaskModal(task)} style="min-width: 40px;">Edit</md-filled-button>
            <md-filled-button on:click={() => deleteTask(task.id)} style="min-width: 40px; background: #b3261e; color: #fff;">Delete</md-filled-button>
          </div>
        </div>
      </md-outlined-card>
    {/each}
    <md-filled-button class="m3-fab" aria-label="Add Task" on:click={() => openTaskModal()} style="border-radius: 50%; width: 56px; height: 56px; font-size: 2rem; min-width: 56px; min-height: 56px; padding: 0; display: flex; align-items: center; justify-content: center; position: fixed; right: 2rem; bottom: 2rem;">
      +
    </md-filled-button>
  {/if}
</div>

{#if $showTaskModal}
  <div class="m3-modal-backdrop" on:click|self={closeTaskModal}>
    <form class="m3-modal" on:submit|preventDefault={saveTask}>
      <h2>{ $editingTask ? 'Edit Task' : 'Create Task' }</h2>
      <md-outlined-text-field label="Title" value={title} on:input={e => title = e.target.value} required style="width: 100%;" autofocus></md-outlined-text-field>
      <md-outlined-text-field label="Description" value={description} on:input={e => description = e.target.value} style="width: 100%;" textarea rows="3"></md-outlined-text-field>
      <md-outlined-select label="Status" value={status} on:input={e => status = e.target.value} style="width: 100%;">
        <md-select-option value="To Do">To Do</md-select-option>
        <md-select-option value="In Progress">In Progress</md-select-option>
        <md-select-option value="Done">Done</md-select-option>
      </md-outlined-select>
      <md-outlined-text-field label="Due Date" type="date" value={dueDate} on:input={e => dueDate = e.target.value} style="width: 100%;"></md-outlined-text-field>
      <md-outlined-select label="Assigned User" value={assignedUser} on:input={e => assignedUser = e.target.value} style="width: 100%;">
        <md-select-option value="">Unassigned</md-select-option>
        {#each users as u}
          <md-select-option value={u.id}>{u.displayName || u.email}</md-select-option>
        {/each}
      </md-outlined-select>
      {#if error}
        <div class="error">{error}</div>
      {/if}
      <div class="actions">
        <md-filled-button type="button" on:click={closeTaskModal} disabled={creating}>Cancel</md-filled-button>
        <md-filled-button type="submit" disabled={creating}>{creating ? 'Saving...' : ($editingTask ? 'Save' : 'Create')}</md-filled-button>
      </div>
    </form>
  </div>
{/if} 