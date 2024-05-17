routerAdd("GET", "/api/v1/urlPreview", (c) => {
    let url = c.queryParam("url");
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        $app.logger().info("GET urlPreview","url",url,"error","Invalid URL")
        return c.json(400, {code: 400, message: "Invalid URL", data:{}});
    }

    try{
        const res = $http.send({
            url:     url,
            method:  "GET",
            body:    "",
            headers: {"content-type": "application/json"},
            timeout: 5,
        });

        //console.log(res.headers)    // the response headers (ex. res.headers['X-Custom'][0])
        //console.log(res.statusCode) // the response HTTP status code
        //console.log(res.raw)        // the response body as plain text

        if (res.statusCode !== 200) {
            return c.json(res.statusCode, {code: 400, message: "Failed to fetch URL", data:{}});
        }

        function decodeHTMLEntities(text) {
            return text.replace(/&#(\d+);/g, function(match, dec) {
                return String.fromCharCode(dec);
            });
        }

        const titleRegex = /<title>(.*?)<\/title>/i;
        const titleMatch = res.raw.match(titleRegex);
        const titleTag = titleMatch ? titleMatch[1] : url;

        //Scrape meta tags like title, description, image, og:title, og:description, og:image, twitter:title, twitter:description, twitter:image
        const metaTagsRegex = /<meta\s+property=["']([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi;
        const metaTags = {};
        let match;

        while ((match = metaTagsRegex.exec(res.raw)) !== null) {
            const [, property, content] = match;
            metaTags[property] = content;
        }

        const title = decodeHTMLEntities(metaTags['og:title'] || metaTags['twitter:title'] || metaTags['title'] || titleTag);
        const description = decodeHTMLEntities(metaTags['og:description'] || metaTags['twitter:description'] || metaTags['description'] || '');
        const image = decodeHTMLEntities(metaTags['og:image'] || metaTags['twitter:image'] || '');

        $app.logger().info("GET urlPreview","url",url,"title",title,"description", description,"image", image)
        return c.json(200, { url, title, description, image });

    } catch (e) {
        $app.logger().info("GET urlPreview","url",url,"error","Failed to fetch URL")
        return c.json(400, {code: 400, message: "Failed to fetch URL", data:{}});
    }
},$apis.activityLogger($app),$apis.requireRecordAuth());

routerAdd("GET", "/api/v1/posts", async (c) => {
    $app.logger().debug("GET /api/posts", "info", "Request received");

    try {
        // Extract query parameters
        const topic = c.queryParam("topic");
        const sort = c.queryParam("sort") || "created"; // Default to sorting by creation time
        const order = c.queryParam("order") || "desc"; // Default to descending order
        const amount = parseInt(c.queryParam("amount")) || 20; // Default to 20 posts
        const offset = parseInt(c.queryParam("offset")) || 0; // Default to no offset
        const user = c.queryParam("user");
        const search = c.queryParam("search") || "";

        $app.logger().debug("GET /api/posts", "parameters", { topic, sort, order, amount, offset });


        //
        //
        //

        if (topic && topic !== "all" && topic !== "mine") {
            if (typeof topic !== "string") {
                return c.json(400, { code: 400, message: "Invalid topic parameter", data: {} });
            }
        }
        if (sort !== "created" && sort !== "updated" && sort !== "likes") {
            return c.json(400, { code: 400, message: "Invalid sort parameter", data: {} });
        }
        if (order !== "asc" && order !== "desc") {
            return c.json(400, { code: 400, message: "Invalid order parameter", data: {} });
        }
        if (isNaN(amount) || amount <= 0) {
            return c.json(400, { code: 400, message: "Invalid amount parameter", data: {} });
        }
        if (isNaN(offset) || offset < 0) {
            return c.json(400, { code: 400, message: "Invalid offset parameter", data: {} });
        }
        if (typeof user !== "string"||user === "") {
            return c.json(400, { code: 400, message: "Invalid user parameter", data: {} });
        }

        // Build query dynamically based on parameters
        const result = arrayOf(new DynamicModel({
            "id":"",
            "title": "",
            "description": "",
            "url": "",
            "image_url": "",
            "topic": "",
            "created": "",
            "updated": "",
            "author": new DynamicModel({
                "id": "",
                "username": "",
                "avatar": "",
                "nitro": false
            }),
            "topic": new DynamicModel({
                "id": "",
                "name": "",
                "color_code": ""
            }),
            "liked": "",
            "like_count": 0,
        }));

        $app.logger().debug("GET /api/posts", "info", "Building query");

        const query = $app.dao().db()
            .select(
                "posts.*",
                "users.id as author.id",
                "users.username as author.username",
                "users.avatar as author.avatar",
                "users.nitro as author.nitro",
                "topics.id as topic.id",
                "topics.name as topic.name",
                "topics.color_code as topic.color_code",
                "COUNT(likes.id) as like_count",
                "CASE WHEN EXISTS (SELECT 1 FROM likes WHERE likes.user = {:user_id} AND likes.post = posts.id) THEN (SELECT id FROM likes WHERE likes.user = {:user_id} AND likes.post = posts.id) ELSE '' END AS liked"
            )
            .from("posts")
            .leftJoin("likes", $dbx.exp("posts.id = likes.post"))
            .leftJoin("users", $dbx.exp("posts.author = users.id"))
            .leftJoin("topics", $dbx.exp("posts.topic = topics.id"))
            .groupBy("posts.id")
            .where($dbx.exp("1 = 1")); // Dummy condition that is always true


        // if topic contains | then its a list of topics to filter. The list is | separated. Example: topic1|topic2|topic3
        if (topic && topic.includes("|")) {
            const topics = topic.split("|");
            query.andWhere($dbx.in("posts.topic", ...topics));
            $app.logger().debug("GET /api/posts", "info", "Multiple topics filter split", "topics", topics);
        }else if (topic && topic !== "all" && topic !== "mine") {
            query.andWhere($dbx.hashExp({ "posts.topic": topic }));
        }

        // Add user filter if topic is "mine"
        if (topic === "mine") {
            query.andWhere($dbx.hashExp({ "posts.author": user }));
        }

        // Add search filter

        if (search) {
            query.andWhere($dbx.exp("(LOWER(posts.title) LIKE LOWER({:search})) OR (LOWER(posts.description) LIKE LOWER({:search}))", { search: '%'+search+'%' }))
        }



        $app.logger().debug("GET /api/posts", "info", "Added topic filter");

        // Sort and order
        switch (sort) {
            case "created":
                query.orderBy("posts.created "+ order.toUpperCase() ,"posts.updated DESC");
                break;
            case "updated":
                query.orderBy("posts.updated "+ order.toUpperCase(), "posts.created DESC");
                break;
            case "likes":
                query.orderBy("like_count "+ order.toUpperCase() , "posts.created DESC");
                break;
        }

        $app.logger().debug("GET /api/posts", "info", "Added sort and order", "values",{ sort, order });

        query.limit(amount);

        $app.logger().debug("GET /api/posts", "info", "Added limit");

        query.offset(offset);
        $app.logger().debug("GET /api/posts", "info", "Added offset");

        query.bind({ user_id: user });
        // Execute query
        query.all(result);

        //
        //
        //

        $app.logger().debug("GET /api/posts", "info", "Query executed");
        return c.json(200, result);
    } catch (e) {
        $app.logger().error("GET /api/posts", "error", e);
        return c.json(500, { code: 500, message: "Internal Server Error", data: {} });
    }
}, $apis.activityLogger($app)/*);//*/,$apis.requireRecordAuth());

routerAdd("GET","/api/v1/rss", async (c) =>{
    return c.json(200 , {code: 200, url: "https://goodstuff.timmorgner.de/api/v1/rss/0d915567-7114-4696-93d3-744b9f6b83b4/", message: "RSS Feed URL"});
},$apis.activityLogger($app),$apis.requireRecordAuth());

routerAdd("GET","/api/v1/rss/0d915567-7114-4696-93d3-744b9f6b83b4/:topic", async (c) =>{

    function httpEncode(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    }

    const topic = c.pathParam("topic");

    if (topic && topic !== "all") {
        if (typeof topic !== "string") {
            return c.json(400, { code: 400, message: "Invalid topic parameter", data: {} });
        }
    }

    try {
        $app.logger().debug("GET /api/rss", "info", "Request received", "topic", topic);
        let finalText =`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Goodstuff</title>
        <link>https://goodstuff.timmorgner.de</link>
        <description>Empfehlungen der Gnag</description>
        <language>de</language>`
        $app.logger().debug("GET /api/rss", "info", "Added RSS header");
        if(topic !== "all"){
            $app.logger().debug("GET /api/rss", "info", "Getting topic name");
            const model = new DynamicModel({
                "name": ""
            });
            try{
                $app.dao().db().newQuery("SELECT name FROM topics WHERE id = {:id}").bind({ id: topic }).one(model);
                finalText += '<category>'+model.name+'</category>'
                $app.logger().debug("GET /api/rss", "info", "Added topic category to RSS feed", "name", model.name);
            }catch(e){
                $app.logger().debug("GET /api/rss", "error", e);
                return c.json(500, { code: 500, message: "Invalid Topic", data: {} });
            }
        }
        //
        //
        //
        // Build query dynamically based on parameters
        const result = arrayOf(new DynamicModel({
            "id":"",
            "title": "",
            "description": "",
            "url": "",
            "image_url": "",
            "topic": "",
            "created": "",
            "updated": "",
            "author": new DynamicModel({
                "id": "",
                "username": "",
                "avatar": "",
                "nitro": false
            }),
            "topic": new DynamicModel({
                "id": "",
                "name": "",
            })
        }));

        $app.logger().debug("GET /api/posts", "info", "Building query");

        const query = $app.dao().db()
            .select(
                "posts.*",
                "users.id as author.id",
                "users.username as author.username",
                "users.avatar as author.avatar",
                "users.nitro as author.nitro",
                "topics.id as topic.id",
                "topics.name as topic.name",
            )
            .from("posts")
            .leftJoin("users", $dbx.exp("posts.author = users.id"))
            .leftJoin("topics", $dbx.exp("posts.topic = topics.id"))
            .groupBy("posts.id")
            .where($dbx.exp("1 = 1")); // Dummy condition that is always true



        // Add topic filter if topic is not "all"
        if (topic && topic !== "all" && topic !== "mine") {
            query.andWhere($dbx.hashExp({ "posts.topic": topic }));
        }

        $app.logger().debug("GET /api/posts", "info", "Added topic filter");

        query.orderBy("posts.created DESC" ,"posts.updated DESC");

        query.limit(100);

        $app.logger().debug("GET /api/posts", "info", "Added limit");

        query.offset(0);
        $app.logger().debug("GET /api/posts", "info", "Added offset");

        // Execute query
        query.all(result);

        for (let i = 0; i < result.length; i++) {
            let content = httpEncode(result[i].description ? result[i].description : "");
            if(result[i].image_url || result[i].url){
                content += `
                <![CDATA[`
                content += result[i].image_url ? `<img src="${result[i].image_url}" alt="${result[i].title}">` : "";
                content += result[i].url ? `<a href="${result[i].url}">${result[i].url}</a>` : "";
                content +=`]]>`
            }
            finalText += `
        <item>
            <title>${httpEncode(result[i].title)}</title>`
            if(result[i].url){
                finalText += `
                            <link>${result[i].url}</link>`
            }
            if(result[i].description){
                finalText += `
            <description>${content}</description>`
            }
            let fixedDate = new Date(result[i].created.replace(" ", "T"));
            finalText += `
            <pubDate>${fixedDate.toUTCString()}</pubDate>
            <guid isPermaLink="false">${result[i].id}</guid>
            <category>${httpEncode(result[i].topic.name)}</category>
        </item>`
        }
        finalText += `
    </channel>
</rss>`
        c.response().header().set("Content-Type", "application/rss+xml");
        return c.string(200, finalText);

    } catch (e) {
        $app.logger().debug("GET /api/rss", "error", e);
        return c.json(500, { code: 500, message: "Internal Server Error", data: {} });
    }

}, $apis.activityLogger($app))

onRecordBeforeAuthWithOAuth2Request((e) => {

    if(e.isNewRecord){
        // check if user is on discord server using the e.oAuth2User.accessToken
        //(e.oAuth2User.rawUser.premium_type
        const res = $http.send({
            url:     "https://discord.com/api/v9/users/@me/guilds",
            method:  "GET",
            headers: {
                "Authorization": "Bearer " + e.oAuth2User.accessToken,
                "Content-Type": "application/json"
            },
            timeout: 5,
        });

        // Valhalla Server ID: 292728343865065472

        for (let i = 0; i < res.json.length; i++) {
            if (res.json[i].id === "292728343865065472") {
                return true;
            }
        }
        return false;
    }

})