<script lang="ts">
    import type { PageData } from './$types';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    onMount(() => {
        setInterval(() => {
            goto('/');
        }, 2000);
    });
</script>

<h1>Hah... you thought! Wait two seconds.</h1>