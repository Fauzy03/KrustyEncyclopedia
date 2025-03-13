new Vue({
    el: "#app",
    data: {
        query: "",
        results: [],
        showResults: false
    },
    methods: {
        async search() {
            if (!this.query.trim()) return; 

            this.results = [];
            this.showResults = true;

            const searchUrl = `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(this.query)}&format=json&origin=*`;

            try {
                const searchResponse = await fetch(searchUrl);
                const searchData = await searchResponse.json();
                
                if (searchData.query.search.length > 0) {
                    for (let item of searchData.query.search) {
                        const pageTitle = item.title;
                        const pageUrl = `https://id.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;

                        // Ambil gambar dari Wikipedia
                        const imageUrl = `https://id.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=300&format=json&origin=*`;
                        let image = "";

                        try {
                            const imageResponse = await fetch(imageUrl);
                            const imageData = await imageResponse.json();
                            const pages = imageData.query.pages;
                            const firstPage = Object.values(pages)[0];

                            if (firstPage.thumbnail) {
                                image = firstPage.thumbnail.source;
                            }
                        } catch (imgError) {
                            console.warn("Gagal mengambil gambar untuk:", pageTitle);
                        }

                        this.results.push({
                            title: pageTitle,
                            body: item.snippet.replace(/<\/?[^>]+(>|$)/g, ""),
                            image: image,
                            link: pageUrl
                        });
                    }
                } else {
                    this.results.push({ 
                        title: "Tidak ditemukan", 
                        body: "Coba kata kunci lain.", 
                        image: "", 
                        link: "" 
                    });
                }
            } catch (error) {
                console.error("Gagal mengambil data Wikipedia", error);
                this.results.push({ 
                    title: "Kesalahan", 
                    body: "Tidak dapat mengambil data.", 
                    image: "", 
                    link: "" 
                });
            }
        },
        reset() {
            this.showResults = false;
            this.query = "";
            this.results = [];
        }
    }
});
