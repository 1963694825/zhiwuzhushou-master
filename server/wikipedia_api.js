// 维基百科植物搜索接口
app.get('/api/plants/search', async (req, res) => {
    const { q, page = 1 } = req.query;

    if (!q) {
        return res.status(400).json({ code: 400, message: '缺少搜索关键词' });
    }

    console.log(`正在搜索维基百科: ${q}`);

    try {
        // 调用维基百科搜索 API
        const offset = (page - 1) * 20;
        const searchUrl = `https://zh.wikipedia.org/w/api.php?` +
            `action=query&list=search&srsearch=${encodeURIComponent(q)}` +
            `&format=json&origin=*&srlimit=20&sroffset=${offset}`;

        const response = await axios.get(searchUrl);
        const searchResults = response.data.query.search;

        console.log(`维基百科搜索成功，找到 ${searchResults.length} 条结果`);

        // 转换为统一格式
        const plants = searchResults.map((item) => ({
            id: item.pageid,
            common_name: item.title,
            common_name_zh: item.title,
            scientific_name: item.title,
            description: item.snippet.replace(/<[^>]*>/g, '').substring(0, 200),
            slug: item.pageid,
            image_url: null, // 详情页获取
            family: 'Unknown'
        }));

        res.json({
            code: 200,
            data: plants
        });

    } catch (error) {
        console.error('维基百科搜索错误:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});

// 维基百科植物详情接口
app.get('/api/plants/detail/:id', async (req, res) => {
    const { id } = req.params;

    console.log(`正在获取维基百科详情: ${id}`);

    try {
        // 获取页面内容
        const parseUrl = `https://zh.wikipedia.org/w/api.php?` +
            `action=parse&pageid=${id}&format=json&origin=*` +
            `&prop=text|displaytitle|images`;

        const response = await axios.get(parseUrl);
        const pageData = response.data.parse;

        // 提取摘要（前500字符）
        const htmlContent = pageData.text['*'];
        const textContent = htmlContent
            .replace(/<[^>]*>/g, '')
            .replace(/\n/g, ' ')
            .trim()
            .substring(0, 500);

        // 获取第一张图片
        let imageUrl = null;
        if (pageData.images && pageData.images.length > 0) {
            const firstImage = pageData.images[0];
            const imageInfoUrl = `https://zh.wikipedia.org/w/api.php?` +
                `action=query&titles=File:${encodeURIComponent(firstImage)}` +
                `&prop=imageinfo&iiprop=url&format=json&origin=*`;

            const imageResponse = await axios.get(imageInfoUrl);
            const pages = imageResponse.data.query.pages;
            const pageId = Object.keys(pages)[0];
            if (pages[pageId].imageinfo) {
                imageUrl = pages[pageId].imageinfo[0].url;
            }
        }

        res.json({
            code: 200,
            data: {
                id: pageData.pageid,
                common_name: pageData.displaytitle,
                common_name_zh: pageData.displaytitle,
                scientific_name: pageData.displaytitle,
                description: textContent,
                observations_zh: textContent,
                image_url: imageUrl,
                wiki_url: `https://zh.wikipedia.org/?curid=${pageData.pageid}`
            }
        });

    } catch (error) {
        console.error('维基百科详情错误:', error);
        res.status(500).json({ code: 500, message: error.message });
    }
});
