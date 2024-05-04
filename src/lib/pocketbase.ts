import PocketBase from 'pocketbase';

import {writable} from "svelte/store";

export const pb = new PocketBase('https://goodstuff.timmorgner.de');

//export const pb = new PocketBase('http://localhost:8090');

export const currentUser = writable(pb.authStore.model)

pb.authStore.onChange(() => {
    console.log('auth changed')
    currentUser.set(pb.authStore.model)
})