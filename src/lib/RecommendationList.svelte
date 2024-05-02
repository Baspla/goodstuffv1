<script lang="ts">
    import RecommendationCard from "./RecommendationCard.svelte";
    import {order, topic} from "./stores";
    import CreateCard from "./CreateCard.svelte";
    import {loadMorePosts, posts} from "./posts";

    const SCROLL_TRIGGER_DISTANCE = 300;

    function handleScroll() {
        // Load more posts when the user scrolls to the bottom of the page
        // print all the values needed to debug
        if (document.documentElement.scrollHeight - document.documentElement.scrollTop - document.documentElement.clientHeight <= SCROLL_TRIGGER_DISTANCE) {
            loadMorePosts();
            console.log("Infinite Scroll Triggered");
        }
    }

</script>
<svelte:window on:scroll={handleScroll} />
<div class="gap-5 flex-col flex w-full md:w-3/4 lg:w-5/12 px-4 md:px-0" >
    <CreateCard/>
    <div class=" flex justify-between">
        <div class="flex flex-row w-2/3 border rounded-xl dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100">
            <input disabled placeholder="Suche" class="line-through grow py-1 outline-none px-3 rounded-l-xl dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100"/>
            <button on:click={()=>console.log("Das kommt noch")} class="bg-gray-100 py-1 px-3 rounded-r-xl dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 hover:dark:bg-slate-800 hover:bg-gray-200">🔍</button>
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
    <!-- Load more button -->
    <div class="flex justify-center">
        <button id="loadMore" class="border-2 bg-gray-50 py-2 mb-4 px-4 rounded min-w-30 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" on:click={loadMorePosts}>Mehr Laden</button>
    </div>
</div>