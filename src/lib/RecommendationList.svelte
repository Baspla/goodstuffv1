<script lang="ts">
    import RecommendationCard from "./RecommendationCard.svelte";
    import {order, search} from "./stores";
    import CreateCard from "./CreateCard.svelte";
    import {loadMorePosts, posts} from "./posts";
    import {onMount} from "svelte";
    function handleScroll() {
        // Load more posts when the user scrolls to the bottom of the page
        // print all the values needed to debug
        if (document.documentElement.scrollHeight - document.documentElement.scrollTop - document.documentElement.clientHeight <= document.documentElement.clientHeight) {
            loadMorePosts();
            console.log("Infinite Scroll Triggered");
        }
        if (document.documentElement.scrollTop > document.documentElement.clientHeight){
            document.getElementById("backToTopButton")!.style.display = "block";
        } else {
            document.getElementById("backToTopButton")!.style.display = "none";
        }


    }

    function updateSearchterm() {
        const searchterm = document.getElementById("searchField")?.value;
        console.log("Updated searchterm to: " + searchterm);
        if (searchterm)
            search.set(searchterm);
    }

    function clearSearchterm() {
        console.log("Cleared searchterm");
        search.set("");
    }

    function searchKeyHandler(event: KeyboardEvent) {
        if (event.key === "Enter") {
            updateSearchterm();
        }
    }

    function topFunction() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    onMount(() => {
        search.subscribe((value) => {
            document.getElementById("searchField")!.value = value;
        });
    });

</script>
<svelte:window on:scroll={handleScroll} />
<div class="gap-5 flex-col flex w-full md:w-3/4 lg:w-5/12 px-4 md:px-0" >
    <CreateCard/>
    <div class=" flex justify-between">
        <div class="flex flex-row w-2/3 rounded-xl dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100 border-2 {$search!==''?'border-emerald-500':'dark:border-slate-500'}">
            <input id="searchField" on:keypress={searchKeyHandler} placeholder="Suche" class="grow py-1 outline-none px-3 rounded-l-xl dark:text-slate-200 dark:placeholder-slate-100 dark:bg-slate-600 bg-gray-100">
            <!-- Small x button to clear the search term -->
            <button on:click={clearSearchterm} class="py-1 pr-1 bg-gray-100 dark:bg-slate-600 dark:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
            <button on:click={updateSearchterm} class="bg-gray-100 py-1 px-3 rounded-r-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 hover:dark:bg-slate-800 hover:bg-gray-200">🔍</button>
        </div>
        <div class="flex flex-col justify-center grow px-4">
            <hr class="dark:border-slate-500">
        </div>
        <select class="border rounded-xl pl-2 p-1 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" id="listOrderSelect" bind:value={$order}>
            <option value="newest" selected>Neueste</option>
            <option value="liked">Beliebteste</option>
            <option value="oldest">Älteste</option>
        </select>
    </div>
    {#each $posts as post (post.id)}
        <RecommendationCard post={post}/>
    {/each}
    <div class="flex justify-center pb-5">
        <p class="text-gray-500 dark:text-slate-400 text-xl font-light"> Du hast das Ende erreicht! 🎉 </p>
    </div>
    <button id="backToTopButton" on:click={topFunction} style="display:none" class="shadow-slate-200 shadow-lg dark:shadow-slate-800 fixed bottom-10 right-10 bg-gray-100 w-12 h-12 rounded-3xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 hover:dark:bg-slate-800 hover:bg-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 mx-auto">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
        </svg>

    </button>
</div>