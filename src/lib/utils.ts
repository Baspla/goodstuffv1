import {currentUser, pb} from "./pocketbase";
import {get} from "svelte/store";
import {topic} from "./stores";

export function fixPost(toFix: any) {
    console.log('fixing post', toFix);
    let liked = "";
    let likeCount = 0;

    if(toFix.expand.likes_via_post){
        likeCount = toFix.expand.likes_via_post.length;
        toFix.expand.likes_via_post.forEach((like: any) => {
            if(like.user===get(currentUser)?.id){
                liked = like.id;
            }
        });
    }
    let fixed = {
        created: toFix.created,
        updated: toFix.updated,
        id: toFix.id,
        author: {
            id: toFix.author,
            username: toFix.expand.author.username,
            avatar: toFix.expand.author.avatar,
            nitro: toFix.expand.author.nitro
        },
        title: toFix.title,
        description: toFix.description,
        url: toFix.url,
        image_url: toFix.image_url,
        like_count: likeCount,
        liked: liked,
        topic: {
            id: toFix.topic,
            name: toFix.expand.topic.name,
            color_code: toFix.expand.topic.color_code
        }

    }
    return fixed;
}

export function getImageFromImageOrImageURL(post:any) {
    if(post.image){
        return pb.files.getUrl(post,post.image,{'thumb': '500x0'});
    }else if(post.image_url){
        return post.image_url;
    }else{
        return null;
    }
}

export function trimProtocol(url: string) {
    return url.replace(/(^\w+:|^)\/\//, '');
}

export function postFilterMatches(post: any) : boolean {
    const currentTopic = get(topic)
    if(currentTopic==='all'){
        return true;
    }
    if(currentTopic==='mine'){
        return post.author.id===get(currentUser)?.id;
    }
    if(post.topic.id===currentTopic){
        return true;
    }
    //TODO my feed
    return false;
}

export function limitStr(url: string, number: number) {
    if (url.length > number) {
        return url.substring(0, number) + "...";
    }
    return url;
}
