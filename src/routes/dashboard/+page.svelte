<script lang="ts">
    import type { PageData } from './$types';

    import { signOut } from 'firebase/auth';
    import { auth, user } from '$lib/firebase';

    let { data }: { data: PageData } = $props();

    async function signOutUser() {
        try {
            // Sign out the user
            await signOut(auth);
            console.log("User signed out successfully.");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }
</script>

<main class="m-4">
    <div class="flex gap-4">
        <div class="w-[30%] p-7 shadow-md bg-base-100 rounded-2xl">
            <h1 class="text-4xl font-bold">Projects</h1>
        </div>
        <div class="w-[70%] p-7 shadow-md bg-base-100 rounded-2xl">
            <h1 class="text-4xl font-bold">Tasks</h1>
        </div>
    </div>
</main>