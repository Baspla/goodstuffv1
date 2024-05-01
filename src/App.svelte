<script lang="ts">
import Login from "./lib/Login.svelte";
import Title from "./lib/Title.svelte";
import TopicBar from "./lib/TopicBar.svelte";
import RecommendationList from "./lib/RecommendationList.svelte";
import {currentUser} from "./lib/pocketbase";
import "dayjs/locale/de"; // German locale
import { dayjs } from "svelte-time";
import FullScreenImage from "./lib/FullScreenImage.svelte";
dayjs.locale("de");


</script>
<FullScreenImage/>
<div class="flex p-2 justify-between border-b flex-col sm:flex-row gap-2 bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700">
    <Title text="Goodstuff"/>
    <Login />
</div>
{#if $currentUser}
<TopicBar />

<div class="flex justify-center bg-white dark:bg-slate-900">
    <RecommendationList/>
</div>
{:else}

<div class="flex justify-center">
    <div class="text-center mt-12 dark:text-slate-200">
        <h1 class="text-2xl mb-2">Willkommen bei <span class="font-semibold">Goodstuff</span></h1>
        <p class="text-lg">Hier findest du die besten Empfehlungen für Software,</p>
        <p class="text-lg">Serien, Games und alles andere was die Crew so gut findet.</p>
        <p class="text-lg mt-4 mb-4">Melde dich an um die Empfehlungen zu sehen.</p>
        <Login />
    </div>
</div>
{/if}