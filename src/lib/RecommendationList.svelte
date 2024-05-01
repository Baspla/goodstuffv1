<script lang="ts">
    import RecommendationCard from "./RecommendationCard.svelte";
    import {onMount, onDestroy} from "svelte";
    import {pb} from "./pocketbase";
    import {order, topic} from "./stores";
    import CreateCard from "./CreateCard.svelte";

    let posts:any = [];
    let unsubscribe: () => void;
    let newPost: string;

    const AMOUNT_PER_LOAD = 50;

    let loadMoreButton: any;

    onMount(async () =>{

        loadMoreButton = document.getElementById('loadMore');
        //await loadPosts();
        unsubscribe = await pb
            .collection('posts')
            .subscribe('*', async ({ action, record }) => {
                if (record.topic !== $topic && 'all' !== $topic) {
                    return;
                }
                if (action === 'create') {
                    if($order === 'oldest')
                        posts = [...posts, record];
                    else
                        posts = [record,...posts];
                }
                if (action === 'delete') {
                    posts = posts.filter((p:any) => p.id !== record.id);
                }
                if (action === 'update') {
                    const index = posts.findIndex((p:any) => p.id === record.id);
                    if (index >= 0) {
                        posts[index] = record;
                    }
                }
            }, {expand: 'author,topic,likes_via_post'});

        topic.subscribe(async (value) => {
            await loadPosts();
            loadMoreButton.style.display = 'block';
        });
    });

    order.subscribe(()=>{
        loadPosts();
        })

    let page = 1;

    function getSort() {
        if ($order === 'newest') {
            return '-created';
        }
        if ($order === 'oldest') {
            return 'created';
        }
        if ($order === 'random') {
            return '@random';
        }
        return '-created';
    }

    async function loadPosts() {
        console.log('loading posts', $topic);
        loadMoreButton.style.display = 'block';
        let sort = getSort();
        page = 0;
        if ($topic == "all"){
            const resultList = await pb.collection("posts").getList(1,AMOUNT_PER_LOAD,
                {sort: sort,expand: 'author,topic,likes_via_post'})
            posts = resultList.items;
        }else{
            const resultList = await pb.collection("posts").getList(1,AMOUNT_PER_LOAD,
                {sort: sort,expand: 'author,topic,likes_via_post', filter: pb.filter('topic = {:topic}', {topic: $topic})})
            posts = resultList.items;
        }
    }

    async function loadMorePosts() {
        let resultList;
        let sort = getSort();
        if ($topic == "all") {
            resultList = await pb.collection("posts").getList(page + 1, AMOUNT_PER_LOAD,
                {sort: sort, expand: 'author,topic,likes_via_post'})
        }else{
            resultList = await pb.collection("posts").getList(page + 1, AMOUNT_PER_LOAD,
                {sort: sort, expand: 'author,topic,likes_via_post', filter: pb.filter('topic = {:topic}', {topic: $topic})})
        }
        page++;
        // remove duplicates from resultList.items
        resultList.items = resultList.items.filter((item:any) => !posts.some((post:any) => post.id === item.id));
        posts = [...posts, ...resultList.items];
        if (resultList.items.length <= 0) {
            loadMoreButton.style.display = 'none';
        }
    }

    // Unsubscribe from realtime messages
    onDestroy(() => {
        unsubscribe?.();
    });

    function getImageFromImageOrImageURL(post:any) {
        if(post.image){
            return pb.files.getUrl(post,post.image,{'thumb': '500x0'});
        }else if(post.image_url){
            return post.image_url;
        }else{
            return null;
        }
    }

    function fixAvatar(author: any) {
        if (author.avatar && !author.avatar.startsWith('https:')) {
            try {
                author.avatar=pb.files.getUrl(author, author.avatar, {'thumb': '100x100'});
            } catch (e) {
                console.error(e);
            }
        }
        return author;
    }

</script>

<div class="gap-5 flex-col flex w-full md:w-3/4 lg:w-5/12 px-4 md:px-0">
    <CreateCard/>
    <div class=" flex justify-between overflow-clip">
        <div class="flex flex-col justify-center grow pr-4">
            <hr class="dark:border-slate-500">
        </div>
        <select class="border rounded-xl pl-2 p-1 dark:bg-slate-600 dark:border-slate-500 dark:text-slate-200" id="listOrderSelect" bind:value={$order}>
            <option value="newest" selected>Neueste</option>
            <option value="oldest">Älteste</option>
            <option value="random">Zufällig</option>
        </select>
    </div>
    {#each posts as post (post.id)}
        <RecommendationCard id={post.id}
                            author={fixAvatar(post.expand.author)}
                            title={post.title}
                            description={post.description}
                            url={post.url}
                            image_url={getImageFromImageOrImageURL(post)}
                            post_topic={post.expand.topic}
                            created_at={post.created}
                            updated_at={post.updated}
                            likes={post.expand.likes_via_post?post.expand.likes_via_post:[]}
        />
    {/each}
    <!-- Load more button -->
    <div class="flex justify-center">
        <button id="loadMore" class="border-2 bg-gray-50 py-2 mb-4 px-4 rounded min-w-30 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" on:click={loadMorePosts}>Mehr Laden</button>
    </div>
</div>