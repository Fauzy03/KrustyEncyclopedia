new Vue({
  el: "#app",
  data: {
    language: "id",
    query: "",
    results: [],
    showResults: false,
    isLoadingSearch: false,
    isLoadingNews: true,
    news: [],
  },
  methods: {
    search() {
      if (this.query.trim() === "") return;

      this.isLoadingSearch = true;
      this.showResults = false;

      fetch(`https://${this.language}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&generator=search&gsrsearch=${this.query}&gsrlimit=5&pilimit=5&pithumbsize=300`)
        .then((res) => res.json())
        .then((data) => {
          this.results = [];

          if (data.query && data.query.pages) {
            this.results = Object.values(data.query.pages).map((page) => ({
              title: page.title,
              body: page.extract,
              link: `https://${this.language}.wikipedia.org/?curid=${page.pageid}`,
              image: page.thumbnail ? page.thumbnail.source : null,
            }));
          }

          this.showResults = true;
          this.isLoadingSearch = false;
        })
        .catch((err) => {
          console.error(err);
          this.isLoadingSearch = false;
        });
    },
    reset() {
      this.results = [];
      this.showResults = false;
      this.query = "";
    },
    fetchNews() {
      const apiKey = "b0c16bbdd4dd43879b18f366d1bf61d9"; // ← Ganti dengan API key Anda

      // BERITA INDO
      // const url = `https://newsapi.org/v2/everything?q=indonesia&language=id&sortBy=publishedAt&pageSize=6&apiKey=${apiKey}`;

      // BERITA GLOBAL
      const url = `https://newsapi.org/v2/everything?q=breaking&language=en&sortBy=publishedAt&pageSize=6&apiKey=${apiKey}`;


      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          this.news = data.articles.map(article => ({
            title: article.title,
            source: { name: article.source.name },
            url: article.url,
            urlToImage: article.urlToImage,
          }));
          this.isLoadingNews = false;
        })
        .catch((err) => {
          console.error("Gagal fetch berita:", err);
          this.isLoadingNews = false;
        });
    },
  },
  mounted() {
    this.fetchNews();
  },
});
