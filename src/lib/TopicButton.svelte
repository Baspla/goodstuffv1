<script lang="ts">
    import {topic,topic_name,topic_color} from "./stores";
    import {getTextColor} from "./colors";

    export let name:string;
    export let color_code:string;
    export let topic_id:string;

    async function handleClick() {
        topic.set(topic_id);
        topic_name.set(name);
        topic_color.set(color_code);
    }


    color_code = color_code.replace('#','')
    let text_color = getTextColor(color_code);

    //style:filter="grayscale(30%)"
</script>

{#if topic_id === $topic}
    <button on:click={handleClick} style:background-color="#{color_code}" class="flex-none snap-center rounded-lg px-2 pt-0.5 pb-1 mx-2 {text_color} shadow-md shadow-slate-500 dark:shadow-gray-400">
        {name}
    </button>
{:else}
    <button on:click={handleClick} style:background-color="#{color_code}"  class="items-center brightness-90 flex-none snap-center rounded-lg px-2 pt-0.5 pb-1 mx-2 {text_color} shadow-sm shadow-slate-300 dark:shadow-slate-800">
        {name}
    </button>
{/if}