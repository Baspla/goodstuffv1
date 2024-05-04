import {onDestroy, onMount} from "svelte";
import {currentUser, pb} from "./pocketbase";
import {order, search, topic} from "./stores";
import {get, writable} from "svelte/store";
import {fixPost, postFilterMatches} from "./utils";

export const posts = writable([]);

let reachedEnd = false;

let postSubscription: () => void;
let topicSubscription: () => void;
let orderSubscription: () => void;
let authSubscription: () => void;
let searchSubscription: () => void;

const BUFFER_TIME = 1000;

export async function subscribe() {
    console.log('subscribing');
    postSubscription = await pb
        .collection('posts')
        .subscribe('*', async ({ action, record }) => {
            switch (action) {
                case 'create':
                    if(get(order)==='newest') {
                        const fixedPost = fixPost(record);
                        if(postFilterMatches(fixedPost)) {
                            // @ts-ignore
                            posts.update((current) => [fixedPost, ...current]);
                        }
                    }else if (get(order)==='oldest' && reachedEnd) {
                        const fixedPost = fixPost(record);
                        if(postFilterMatches(fixedPost)) {
                            // @ts-ignore
                            posts.update((current) => [...current, fixedPost]);
                        }
                    }
                    break;
                case 'update':
                    posts.update((current) => {
                        const fixedPost = fixPost(record);


                        // @ts-ignore
                        const index = current.findIndex((p) => p.id === fixedPost.id);
                        if (index !== -1) {
                            // @ts-ignore
                            current[index] = fixedPost;
                        }
                        return current;
                    });
                    break;
                case 'delete':
                    // @ts-ignore
                    posts.update((current) => current.filter((p) => p.id !== record.id));
                    break;
            }
        }, {expand: 'author,topic,likes_via_post'});
    topicSubscription = topic.subscribe(async (value) => {
        console.log('topic changed');
        await loadPosts();
    });
    orderSubscription = order.subscribe(async ()=>{
        console.log('order changed');
        await loadPosts();
    })
    authSubscription = currentUser.subscribe(async (value) => {
        console.log('user changed');
        await loadPosts();
    });
    searchSubscription = search.subscribe(async (value) => {
        console.log('search changed');
        await loadPosts();
    });
}



async function loadPosts(offset: number = 0) {
    lastUpdate = Date.now();
    let query:any = {
        amount: 10,
        offset: offset,
        user: get(currentUser)?.id
    }
    if(topic) {
        query['topic'] = get(topic);
    }
    if(search) {
        query['search'] = get(search);
    }
    switch(get(order)) {
        case 'newest':
            query['sort'] = 'created';
            query['order'] = 'desc';
            break;
        case 'oldest':
            query['sort'] = 'created';
            query['order'] = 'asc';
            break;
        case 'liked':
            query['sort'] = 'likes';
            query['order'] = 'desc';
            break;
    }
    pb.send('/api/posts',{
        method: 'GET',
        query:query})
        .then((data)=>
        {
            if(offset>0) {
                // @ts-ignore
                posts.update((current) => [...current, ...data]);
            }else {
                posts.set(data);
            }
            if(data.length==0) {
                console.log('End of posts reached');
                reachedEnd = true;
            }else {
                console.log('Loaded '+data.length+' posts');
                reachedEnd = false;
            }
        }
    ).catch((e)=>{});
}

let lastUpdate = Date.now();

export async function loadMorePosts() {
    if(reachedEnd||Date.now()-lastUpdate<BUFFER_TIME) {
        return;
    }
    const currentPosts = get(posts);
    await loadPosts(currentPosts.length);
}

export function unsubscribe() {
    console.log('unsubscribing');
    postSubscription?.();
    topicSubscription?.();
    orderSubscription?.();
    authSubscription?.();
    searchSubscription?.();
}