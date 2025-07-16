<script lang="ts">
import { onMount } from 'svelte';
import { db } from '$lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { writable } from 'svelte/store';
import '@material/web/labs/card/outlined-card.js';

const user = writable<any | null>(null);
const loading = writable(true);
let users: any[] = [];
let projects: any[] = [];
let projectTasks: Record<string, any[]> = {};

onMount(async () => {
  loading.set(true);
  onAuthStateChanged(auth, async (firebaseUser: any) => {
    user.set(firebaseUser);
    if (firebaseUser) {
      await fetchUsers();
      await fetchProjectsAndTasks(firebaseUser.uid);
    }
    loading.set(false);
  });
});

async function fetchUsers() {
  const q = query(collection(db, 'users'));
  const querySnapshot = await getDocs(q);
  users = [];
  querySnapshot.forEach((doc: any) => {
    users.push({ id: doc.id, ...doc.data() });
  });
}

async function fetchProjectsAndTasks(uid: string) {
  const q = query(collection(db, 'projects'), where('assignedUsers', 'array-contains', uid));
  const querySnapshot = await getDocs(q);
  projects = [];
  projectTasks = {};
  for (const docSnap of querySnapshot.docs) {
    const project = { id: docSnap.id, ...docSnap.data() };
    projects.push(project);
    const tasksSnap = await getDocs(collection(db, 'projects', project.id, 'tasks'));
    const tasks: any[] = [];
    tasksSnap.forEach((taskDoc: any) => {
      tasks.push({
        ...taskDoc.data(),
        id: taskDoc.id,
        projectId: project.id,
        projectTitle: project.title
      });
    });
    if (tasks.length > 0) {
      projectTasks[project.id] = tasks;
    }
  }
}
</script>

<style>
.tasks-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 2rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
}
.tasks-header {
  font-family: 'Google Sans', 'Roboto', Arial, sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--md-sys-color-primary);
  margin-bottom: 2rem;
  text-align: left;
  letter-spacing: -1px;
}
.project-section {
  margin-bottom: 2.5rem;
  width: 100%;
}
.project-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
}
@media (max-width: 900px) {
  .tasks-container {
    padding: 1.5rem 0.5rem 1.5rem 0.5rem;
  }
  .tasks-header {
    font-size: 1.5rem;
  }
  .tasks-grid {
    gap: 1rem;
  }
}
.task-card {
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
</style>

<div class="tasks-container">
  <div class="tasks-header">All Tasks</div>
  {#if $loading}
    <p>Loading...</p>
  {:else if Object.keys(projectTasks).length === 0}
    <p>No tasks found for your projects.</p>
  {:else}
    {#each projects as project (project.id)}
      {#if projectTasks[project.id]}
        <div class="project-section">
          <div class="project-title">{project.title}</div>
          <div class="tasks-grid">
            {#each projectTasks[project.id] as task}
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
                      <span> | Assigned: {users.find((u: any) => u.id === task.assignedUser)?.displayName || task.assignedUser}</span>
                    {/if}
                  </div>
                </div>
              </md-outlined-card>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div> 