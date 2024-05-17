import {writable} from "svelte/store";

export const topic = writable( localStorage.getItem("topic")||"all")
export const topic_name = writable(localStorage.getItem("topic_name")||"Alles")
export const topic_color = writable(localStorage.getItem("topic_color")||"#DDDDDD")
export const search = writable(localStorage.getItem("search")||"")
export const order = writable(localStorage.getItem("order")||"newest")
export const fullscreenImage = writable(localStorage.getItem("fullscreenImage")||"")
export const feed = writable(parseLocalStorageToList(localStorage.getItem("feed"))||[])

function parseLocalStorageToList(value:any) {
    if (value) {
        return value.split(",")
    }
    return []
}

search.subscribe(value => {
    localStorage.setItem("search", value)
})

topic.subscribe(value => {
    localStorage.setItem("topic", value)
})

topic_name.subscribe(value => {
    localStorage.setItem("topic_name", value)
})

topic_color.subscribe(value => {
    localStorage.setItem("topic_color", value)
})

fullscreenImage.subscribe(value => {
    localStorage.setItem("fullscreenImage", value)
})

order.subscribe(value => {
    localStorage.setItem("order", value)
})

feed.subscribe(value => {
    localStorage.setItem("feed", value.join(","))
})
