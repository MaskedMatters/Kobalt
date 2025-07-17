<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    import { onAuthStateChanged } from 'firebase/auth';
    import { auth } from '$lib/firebase';

    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();

    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                goto('/');
            }
        });
    });
</script>

<div class="bg-blue-100">
    <nav class="sticky top-0 z-50">
        <div class="navbar bg-base-100 shadow-sm m-4 w-auto rounded-2xl">
            <div class="flex-1">
                <a class="btn btn-ghost text-xl" href="/">Kobalt</a>
            </div>
            <div class="flex-none">
                <ul class="menu menu-horizontal px-1">
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/dashboard/settings">Settings</a></li>
                </ul>
            </div>
        </div>
    </nav>

    {@render children()}
</div>
