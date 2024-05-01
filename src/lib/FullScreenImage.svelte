<script lang="ts">
    import {fullscreenImage} from "./stores";
    function toggleFullScreen() {
        fullscreenImage.set("");
    }
    function stop(e: Event) {
        e.stopPropagation();
    }
</script>
{#if $fullscreenImage}
    <div class="fixed inset-0 z-50 overflow-hidden">
        <div class="fixed inset-0 bg-black opacity-75"></div>
        <div class="absolute inset-0 flex justify-center items-center" on:click={toggleFullScreen}>
            <img src={$fullscreenImage} alt="Full Screen" class="max-h-full max-w-full p-4" on:click={stop}/>
            <button class="absolute top-0 right-0 m-4 text-white" on:click={toggleFullScreen}>
                Schließen
            </button>
        </div>
    </div>
{/if}