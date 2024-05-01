<script lang="ts">

    import {pb} from "./pocketbase";
    import {topic,topic_name,topic_color} from "./stores";
    import {currentUser} from "./pocketbase";
    import {getTextColor} from "./colors";

    async function createPost() {
        const etitle = document.getElementById('createPostTitle')!;
        const edescription = document.getElementById('createPostDescription')!;
        const eurl = document.getElementById('createPostURL')!;
        const eimageurl = document.getElementById('createPostImageURL')!;
        //const eimage = document.getElementById('createPostImage')!;
        const dtitle = etitle.value;
        const ddescription = edescription.value;
        const durl = eurl!.value;
        const dimage = eimageurl!.value;
        const dauthor = $currentUser!.id;
        const dtopic = $topic;
        const data:any = {
            "title": dtitle.trim(),
            "author": dauthor,
            "topic": dtopic
        };
        if (ddescription) {
            data['description'] = ddescription.trim();
        }
        if (durl) {
            data['url'] = durl.trim();
        }
        if (dimage) {
            data['image_url'] = dimage.trim();
        //}else if (eimage.files.length>0) {
        //    data['image'] = eimage.files[0];
        }
        try{
        let response = await pb.collection('posts').create(data)
        etitle.value = '';
        edescription.value = '';
        eurl.value = '';
        eimageurl.value = '';
        updatePreview();
        //eimage.value = '';
        }catch(e){
            console.error(e);
            alert('Konnte die Recommendation nicht erstellen. Überprüfe ob du einen Titel hast und keine ungültige URL eingegeben hast.')
        }
    }

    async function previewLink() {
        const eurl = document.getElementById('createPostURL')!;
        const durl = eurl!.value;
        if (durl) {
            let response = await fetch(pb.baseUrl+'/api/urlPreview?url=' + durl);
            let data = await response.json();
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
                updatePreview()
            }
        }
    }

    async function updatePreview() {
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

<div class="border dark:border-slate-700 rounded-xl flex justify-between overflow-clip mt-3">
    <div class="grow">
        <details hidden="{$topic==='all'}">
            <summary class="px-2 py-2 {getTextColor($topic_color)}" style:background-color="#{$topic_color}">Neue {$topic_name} Empfehlung erstellen</summary>
            <div class="px-2 py-2 flex flex-col">
                <input id="createPostTitle" type="text" placeholder="Titel" class="w-full border rounded-xl p-2 mb-2">
                <textarea id="createPostDescription" placeholder="Beschreibung" class="w-full border rounded-xl p-2 mb-2"></textarea>
                <div class="flex flex-row gap-2">
                    <input id="createPostURL" type="url" placeholder="Link" class="w-full border rounded-xl p-2 mb-2">
                    <button on:click={previewLink} class="w-1/3 rounded-xl bg-gray-500 text-white mb-2">Link abfragen</button>
                </div>
                <div class="flex flex-row gap-2">
                    <input on:change={updatePreview} id="createPostImageURL" type="url" placeholder="Bild URL" class="w-full border rounded-xl p-2 mb-2">
                    <!--<div class="flex flex-col justify-center mb-2"><p>oder</p></div>
                    <input id="createPostImage" accept="image/png, image/jpeg, image/webp, image/gif" type="file" class="w-full border rounded-xl p-2 mb-2">-->
                </div>
                <img id="createPostImagePreview" alt="Ungültige Bild URL" class="px-2 py-1 h-max object-contain max-h-96" hidden />
                <button on:click={createPost} class="w-full border rounded-xl p-2 bg-blue-500 {getTextColor($topic_color)}" style:background-color="#{$topic_color}">Empfehlung erstellen</button>
            </div>
        </details>
        <div class="px-2 py-2 bg-gray-100 dark:bg-slate-500 dark:text-slate-100" hidden="{$topic!=='all'}">Wähle ein Topic aus um zu posten</div>
    </div>
</div>