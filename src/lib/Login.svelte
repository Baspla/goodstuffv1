<script lang="ts">
    import {currentUser, pb} from "./pocketbase";

    async function login() {
        let w = window.open()

        await pb.collection("users").authWithOAuth2({provider:"discord",
            scopes: ["identify","guilds"],
            urlCallback: (url) => {
                if(w) w.location.href = url
            },
        });
        if(!pb.authStore.isAuthRecord){
            pb.authStore.clear();
            alert('Du bist nicht Teil der Gnag! Du musst auf dem richtigen Discord Server sein um die App nutzen zu können.')
        }
    }
    async function logout() {
        pb.authStore.clear();
    }
</script>

{#if $currentUser}
    <button class="rounded-2xl bg-red-500 px-4 py-2 text-white " on:click={logout}>{$currentUser.username} abmelden</button>
{:else}
    <button class="rounded-2xl bg-blue-500 px-4 py-2 text-white" on:click={login}>Mit Discord anmelden</button>
{/if}