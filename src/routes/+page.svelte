<script lang="ts">
    // Import necessary Firebase Authentication modules
    import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
    import { doc, getDoc, setDoc } from "firebase/firestore";
    import { auth, db, user } from '$lib/firebase';

    // Import Svelte's lifecycle hooks and navigation functions
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();

        try {
            // Sign in with a popup using the Google provider
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);

            const token = credential?.accessToken;
            const user = result.user;

            // Add user to Firestore if they don't exist (NOT FINISHED YET)
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            goto('/dashboard');
            console.log("User signed in with Google:", user);
        } catch (error: any) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GoogleAuthProvider.credentialFromError(error);

            console.error("Error signing in with Google:", errorCode, errorMessage, email, credential);
        }
    }

    async function signInWithGitHub() {
        const provider = new GithubAuthProvider();
        try {
            // Sign in with a popup using the GitHub provider
            const result = await signInWithPopup(auth, provider);
            const credential = GithubAuthProvider.credentialFromResult(result);

            const token = credential?.accessToken;
            const user = result.user;

            // Add user to Firestore if they don't exist (NOT FINISHED YET)
            const userRef = doc(db, 'users', user.uid);
            const userSnapshot = await getDoc(userRef);

            goto('/dashboard');
            console.log("User signed in with GitHub:", user);
        } catch (error: any) {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData.email;
            const credential = GithubAuthProvider.credentialFromError(error);

            console.error("Error signing in with GitHub:", errorCode, errorMessage, email, credential);
        }
    }

    // Fake function go happy...
    function signInWithEmail() {
        goto('/haha');
    }

    // Lifecycle hook to redirect authenticated users
    onMount(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                goto('/dashboard');
            }
        });
    });
</script>

<main>

    <!--BEFORE YOU LOOK AT THIS CODE, NOTE BY THE DEV... Tailwind bloats...-->

    <!--HEADER-->
    <div class="flex flex-col items-center p-4 bg-white/80 z-10 relative">
        <h3 class="text-2xl">Connecting to <svg class="inline" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#2854C5"><path d="M120-840h320v320H120v-320Zm80 80v160-160Zm320-80h320v320H520v-320Zm80 80v160-160ZM120-440h320v320H120v-320Zm80 80v160-160Zm440-80h80v120h120v80H720v120h-80v-120H520v-80h120v-120Zm-40-320v160h160v-160H600Zm-400 0v160h160v-160H200Zm0 400v160h160v-160H200Z"/></svg></h3>
        <p>Sign in with your account to access to Kobalt Dashboard</p>
    </div>

    <!--BACKGROUND-->
    <img class="object-cover h-[96.5%] w-full absolute top-0" src="https://ok6static.oktacdn.com/fs/bco/7/fs0z2o4lk2InWEMMN2p7" alt="Sign In Background" />

    <!--SIGN IN OPTIONS-->
    <div class="top-[50%] left-[50%] absolute translate-x-[-50%] translate-y-[-50%] bg-base-100 p-6 flex flex-col items-center rounded-2xl gap-4 w-[400px]">

        <!--TITLE-->
        <h1 class="text-4xl font-bold">KOBALT</h1>
        <h2 class="text-1xl">Sign in to your account using your Auth Provider.</h2>

        <!--EMAIL & PASSWORD-->
        <fieldset class="fieldset w-full">
            <legend class="fieldset-legend">Email</legend>
            <input type="text" class="input w-full" placeholder="example@pqar.net" />
        </fieldset>
        <fieldset class="fieldset w-full">
            <legend class="fieldset-legend">Password</legend>
            <input type="password" class="input w-full" placeholder="1234@AbCd" />
        </fieldset>

        <button class="btn btn-xl btn-primary w-full" onclick={signInWithEmail}>Sign In With Email</button>

        <p class="text-sm">------ or ------</p>

        <!--IdP Providers-->
        <button class="btn btn-soft btn-xl btn-accent w-full" onclick={signInWithGoogle}>Sign In With Google</button>
        <button class="btn btn-soft btn-xl btn-secondary w-full" onclick={signInWithGitHub}>Sign In With GitHub</button>
    </div>
</main>