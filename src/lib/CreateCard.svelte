<script lang="ts">

    import {currentUser, pb} from "./pocketbase";
    import {topic, topic_color, topic_name} from "./stores";
    import {getTextColor} from "./colors";

    async function createPost()
    {
        const titleElement = document.getElementById('createPostTitle')!;
        const descriptionElement = document.getElementById('createPostDescription')!;
        const linkElement = document.getElementById('createPostURL')!;
        const imageLinkElement = document.getElementById('createPostImageURL')!;
        //const eimage = document.getElementById('createPostImage')!;
        const titleValue = titleElement.value;
        const descriptionValue = descriptionElement.value;
        const linkValue = linkElement!.value;
        const imageLinkValue = imageLinkElement!.value;
        const data:any = {
            "title": titleValue.trim(),
            "author": $currentUser!.id,
            "topic": $topic
        };
        if (descriptionValue) {
            data['description'] = descriptionValue.trim();
        }
        if (linkValue) {
            data['url'] = linkValue.trim();
        }
        if (imageLinkValue) {
            data['image_url'] = imageLinkValue.trim();
            //}else if (eimage.files.length>0) {
            //    data['image'] = eimage.files[0];
        }
        try{
            await pb.collection('posts').create(data);
            titleElement.value = '';
            descriptionElement.value = '';
            linkElement.value = '';
            imageLinkElement.value = '';
            updateImagePreview();
            //eimage.value = '';
        }catch(e){
            console.error(e);
            alert('Konnte die Recommendation nicht erstellen. Überprüfe ob du einen Titel hast und keine ungültige URL eingegeben hast.')
        }
    }


    async function resolveLinkPreview() {
        const eurl = document.getElementById('createPostURL')!;
        const durl = eurl!.value;
        if (durl) {
            pb.send('/api/urlPreview?url=' + durl,{}).then((data) => {
                const etitle = document.getElementById('createPostTitle')!;
                const edescription = document.getElementById('createPostDescription')!;
                const eimageurl = document.getElementById('createPostImageURL')!;
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
        const eimageurl = document.getElementById('createPostImageURL')!;
        const dimage = eimageurl!.value;
        const eimagePrev = document.getElementById('createPostImagePreview')!;
        if (dimage) {
            eimagePrev.src = dimage;
            eimagePrev.hidden = false;
        } else {
            eimagePrev.hidden = true;
        }
    }
</script>

<!-- The CreateCard component is a collapsible card where the user can author a new post. -->

<div hidden="{$topic==='mine'}" class="border dark:border-slate-700 rounded-xl flex justify-between overflow-clip mt-3 {$topic==='mine'?'collapse':'visible'}">
    <div class="grow">
        <details hidden="{$topic==='all'||$topic==='feed'}">
            <summary class="px-2 py-2 {getTextColor($topic_color)}" style:background-color="#{$topic_color}">Neue {$topic_name} Empfehlung erstellen</summary>
            <div class="px-2 py-2 flex flex-col">
                <input id="createPostTitle" type="text" placeholder="Titel" class="w-full border rounded-xl p-2 mb-2 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100">
                <textarea id="createPostDescription" placeholder="Beschreibung" class="w-full border rounded-xl p-2 mb-2 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100"></textarea>
                <div class="flex flex-row gap-2">
                    <input id="createPostURL" type="url" placeholder="Link" class="w-full border rounded-xl p-2 mb-2 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100">
                    <button on:click={resolveLinkPreview} class="w-1/3 rounded-xl bg-gray-500 text-white mb-2">Link abfragen</button>
                </div>
                <div class="flex flex-row gap-2">
                    <input on:change={updateImagePreview} id="createPostImageURL" type="url" placeholder="Bild URL" class="w-full border rounded-xl p-2 mb-2 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-200 dark:placeholder-slate-100">
                    <!--<div class="flex flex-col justify-center mb-2"><p>oder</p></div>
                    <input id="createPostImage" accept="image/png, image/jpeg, image/webp, image/gif" type="file" class="w-full border rounded-xl p-2 mb-2">-->
                </div>
                <img src="" id="createPostImagePreview" alt="Ungültige Bild URL" class="px-2 py-1 h-max object-contain max-h-96 dark:text-slate-200" hidden />
                <button on:click={createPost} class="w-full border rounded-xl p-2 dark:border-slate-500 bg-blue-500 {getTextColor($topic_color)}" style:background-color="#{$topic_color}">Empfehlung erstellen</button>
            </div>
        </details>
        <div class="px-2 py-2 bg-gray-100 dark:bg-slate-500 dark:text-slate-100" hidden="{$topic!=='all'}">Wähle ein Topic aus um zu posten</div>
        <div class="px-2 py-2 bg-gray-100 dark:bg-slate-500 dark:text-slate-100" hidden="{$topic!=='feed'}">Dein Feed: TODO</div>
    </div>
</div>