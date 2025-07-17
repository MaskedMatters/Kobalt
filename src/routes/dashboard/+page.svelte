<script lang="ts">
    import type { PageData } from './$types';

    import { signOut, onAuthStateChanged } from 'firebase/auth';
    import { auth, user } from '$lib/firebase';

    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    async function signOutUser() {
        signOut(auth)
            .then(() => {
                console.log("User signed out successfully.");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    }

    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                goto('/');
            }
        });
    });
</script>

<h1>Hello, {$user?.uid}</h1>
<button class="btn btn-soft btn-error" onclick={signOutUser}>Sign Out</button>
