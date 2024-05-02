<script lang="ts">
    import {onMount} from "svelte";
    import {pb} from "./pocketbase";
    import TopicButton from "./TopicButton.svelte";

    let topics:any = []
    onMount(async () =>{
        await loadTopics()
    });

    async function loadTopics(){
        topics = await pb.collection("topics").getFullList({sort: 'order'})
    }
</script>
<div class="overflow-x-auto items-center snap-x scroll-smooth flex flex-row py-4 bg-white dark:bg-slate-900">
    <div class="grow"></div>
    <TopicButton name="Alles" topic_id="all" color_code="DDD"/>
    <TopicButton name="Meine Posts" topic_id="mine" color_code="FF3"/>
    <!--<TopicButton name="Mein Feed" topic_id="feed" color_code="EE3"/>-->
    {#each topics as topic}
        <TopicButton name={topic.name} topic_id={topic.id} color_code={topic.color_code}/>
    {/each}
    <div class="grow"></div>
</div>