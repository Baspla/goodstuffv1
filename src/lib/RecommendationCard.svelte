<script lang="ts">
    import {currentUser, pb} from "./pocketbase";
    import {topic, fullscreenImage} from "./stores";
    import Time from "svelte-time";
    import {getTextColor} from "./colors";
    import { limitStr, trimProtocol} from "./utils";

    export let post: any;

    const is_own_post = post.author.id === $currentUser?.id;

    const changed = new Date(post.updated) > new Date(post.created);

    let editMode = false;

    async function changeLike() {
        if (post.liked) {
            await pb.collection("likes").delete(post.liked);
            post.liked = null;
            post.like_count--;
        } else {
            let ans = await pb.collection("likes").create({user: $currentUser?.id, post: post.id})
            post.liked = ans.id;
            post.like_count++;
        }
    }

    async function deletePost() {
        let ans = confirm("Möchtest du diesen Beitrag wirklich löschen?");
        if (ans) {
            await pb.collection("posts").delete(post.id);
        }
    }

    async function finishEditPost() {
        let ans = confirm("Möchtest du diesen Beitrag wirklich bearbeiten?");
        if (ans) {
            const etitle = document.getElementById('editPostTitle' + post.id)!;
            const edescription = document.getElementById('editPostDescription' + post.id)!;
            const eurl = document.getElementById('editPostURL' + post.id)!;
            const eimageurl = document.getElementById('editPostImageURL' + post.id)!;
            await pb.collection("posts").update(post.id, {
                title: etitle.value,
                description: edescription.value,
                url: eurl.value,
                image_url: eimageurl.value
            });
            editMode = false;
        }
    }

    async function editPost() {
        editMode = !editMode;
    }

    async function fullscreen() {
        fullscreenImage.set(post.image_url);
    }

    async function resolveLinkPreview() {
        const eurl = document.getElementById('editPostURL' + post.id)!;
        const durl = eurl!.value;
        if (durl) {
            pb.send('/api/v1/urlPreview?url=' + durl,{}).then(async (data) => {
                const etitle = document.getElementById('editPostTitle' + post.id)!;
                const edescription = document.getElementById('editPostDescription' + post.id)!;
                const eimageurl = document.getElementById('editPostImageURL' + post.id)!;
                if (data.title && !etitle.value) {
                    etitle.value = data.title;
                }
                if (data.description && !edescription.value) {
                    edescription.value = data.description;
                }
                if (data.image && !eimageurl.value) {
                    eimageurl.value = data.image;
                    updateImagePreview()
                }
            });
        }
    }

    function updateImagePreview() {
        const eimageurl = document.getElementById('editPostImageURL' + post.id);
        const dimage = eimageurl?.value;
        const eimagePrev = document.getElementById('editPostImagePreview' + post.id);
        if (eimagePrev) {
            if (dimage) {
                eimagePrev.src = dimage;
                eimagePrev.hidden = false;
            } else {
                eimagePrev.hidden = true;
            }
        }
    }

</script>

<div class="border rounded-xl flex justify-between overflow-clip dark:border-slate-700">
    <div class="flex flex-col grow">
        <!-- Top Bar -->
        <div class="flex gap-2 px-2 py-2 bg-gray-100 dark:bg-slate-700">
            <!-- Top Left -->
            <div class="flex max-h-10">
                {#if post.author.avatar}
                    <img src="{pb.baseUrl}/api/files/_pb_users_auth_/{post.author.id}/{post.author.avatar}{(post.author.nitro)?'':'?thumb=100x100'}" alt="" class="max-h-10 max-w-10 rounded"/>
                {:else}
                    <!--<img src="/images/default-avatar.png" alt="" class="max-h-10 max-w-10 rounded" />-->
                {/if}
                <div class="flex flex-col justify-center pl-2">
                    {#if $topic === "all" || $topic === "mine"}
                        <h1 class="text-l font-semibold"><span title="{post.author.nitro?'Goodstuff Nitro User':''}" class="{post.author.nitro?'text-emerald-900 dark:text-emerald-100':'dark:text-slate-200'}">{post.author.username} </span><span class="dark:text-slate-200">• </span><span
                                class="px-1.5 py-0.5 rounded-lg font-normal {getTextColor(post.topic.color_code)}"
                                style="background-color:{post.topic.color_code}">{post.topic.name}</span></h1>
                    {:else}
                        <h1 title="{post.author.nitro?'Goodstuff Nitro User':''}" class="text-l font-light {post.author.nitro?'text-emerald-900 dark:text-emerald-100':'dark:text-slate-200'}">{post.author.username} </h1>
                    {/if}
                    <p class="text-xs text-gray-500  dark:text-slate-300">
                        <Time relative timestamp={post.created}/>
                    </p>
                </div>
            </div>

            <div class="grow">
            </div>

            <!-- Top Right -->
            <button class="flex items-center justify-center w-10 h-10 dark:text-slate-50" on:click={changeLike}>
                <div class="flex flex-row">
                    <p class="pr-1">{post.like_count}</p>
                    {#if post.liked}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"/>
                        </svg>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                             stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
                        </svg>
                    {/if}
                </div>
            </button>
        </div>
        <!-- Content -->
        <div class="flex flex-col grow justify-between dark:bg-slate-800">
            {#if !editMode}
                <h1 class="px-4 py-2 text-2xl dark:text-slate-100">{post.title}</h1>
                {#if post.description}
                    <p class="px-4 text-gray-600 dark:text-slate-200 pb-2 whitespace-pre-line">{post.description}</p>
                {/if}
                {#if post.image_url}
                    <div class="flex flex-row justify-center dark:text-slate-200">
                        <img src={post.image_url} alt="Das Bild konnte nicht geladen werden"
                             class="px-2 py-1 h-max object-contain max-h-96" on:click={fullscreen}/>
                    </div>
                {/if}
            {:else }
                <div class="px-2 py-2 flex flex-col">
                    <input id="editPostTitle{post.id}" type="text" value={post.title} placeholder="Titel"
                           class="w-full border rounded-xl p-2 mb-2">
                    <textarea id="editPostDescription{post.id}" placeholder="Beschreibung"
                              class="w-full border rounded-xl p-2 mb-2">{post.description}</textarea>
                    <div class="flex flex-row gap-2">
                        <input id="editPostURL{post.id}" value={post.url} type="url" placeholder="Link"
                               class="w-full border rounded-xl p-2 mb-2">
                        <button on:click={resolveLinkPreview} class="w-1/3 rounded-xl bg-gray-500 text-white mb-2">Link
                            abfragen
                        </button>
                    </div>
                    <div class="flex flex-row gap-2">
                        <input on:change={updateImagePreview} id="editPostImageURL{post.id}" value="{post.image_url}" type="url"
                               placeholder="Bild URL" class="w-full border rounded-xl p-2 mb-2">
                        <!--<div class="flex flex-col justify-center mb-2"><p>oder</p></div>
                        <input id="createPostImage" accept="image/png, image/jpeg, image/webp, image/gif" type="file" class="w-full border rounded-xl p-2 mb-2">-->
                    </div>
                    <img id="editPostImagePreview{post.id}" src={post.image_url} alt="Ungültige Bild URL"
                         class="{post.image_url?'visible':'invisible'} px-2 py-1 h-max object-contain max-h-96"/>
                    <button on:click={finishEditPost}
                            class="w-full border rounded-xl p-2 bg-blue-500 {getTextColor(post.topic.color_code)}"
                            style="background-color:{post.topic.color_code}">Änderung übernehmen
                    </button>
                </div>
            {/if}
        </div>
        <!-- Bottom Bar -->
        <div class="bg-gray-200 dark:bg-slate-700 flex flex-row">
            {#if is_own_post}
                <div class="flex flex-col">
                    <div class="grow flex flex-row">
                        <!-- Delete Button -->
                        <button title="Löschen"
                                class=" flex items-center justify-center py-2 w-10 h-full bg-gray-400 dark:bg-slate-700 hover:bg-red-500 "
                                on:click={deletePost}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-6 h-6 ">
                                <path fill-rule="evenodd"
                                      d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                                      clip-rule="evenodd"/>
                            </svg>
                        </button>
                        <!-- Edit Button -->
                        <button title="Bearbeiten"
                                class="flex items-center justify-center py-2 w-10 h-full bg-gray-400 dark:bg-slate-700 hover:bg-blue-500 "
                                on:click={editPost}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-6 h-6">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"/>
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            {/if}
            {#if changed}
                <div class="flex flex-col justify-center">
                    <p class="text-xs text-gray-500 dark:text-slate-300 p-2">Geändert
                        <Time relative timestamp={post.updated}/>
                    </p>
                </div>
            {/if}
            <div class="grow"></div>
            {#if post.url && !editMode}
                <div class="text-center bg-blue-200 dark:bg-blue-700 p-2 px-3">
                    <a target="_blank" class="text-blue-800 dark:text-slate-200"
                       href={post.url}>{limitStr(trimProtocol(post.url), 30)}</a>
                </div>
            {/if}
        </div>
    </div>
    <!--<div>
        <img src={image} alt={url} class="h-max"/>
    </div>-->
</div>