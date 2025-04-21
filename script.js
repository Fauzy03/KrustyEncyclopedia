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

      fetch(
        `https://${this.language}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&generator=search&gsrsearch=${this.query}&gsrlimit=5&pilimit=5&pithumbsize=300`
      )
        .then((res) => res.json())
        .then((data) => {
          this.results = [];

          if (data.query && data.query.pages) {
            this.results = Object.values(data.query.pages).map((page) => ({
              title: page.title,
              body: page.extract,
              link: `https://${this.language}.wikipedia.org/?curid=${page.pageid}`,
              image: page.thumbnail
                ? page.thumbnail.source
                : "https://via.placeholder.com/150?text=No+Image",
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
      // Dummy data untuk simulasi
      this.news = [
        {
          title:
            "Kronologi Titiek Puspa Jatuh Sakit hingga Meninggal Dunia",
          source: { name: "CNN Indonesia" },
          url: "https://www.cnnindonesia.com/hiburan/20250410184139-234-1217561/kronologi-titiek-puspa-jatuh-sakit-hingga-meninggal-dunia",
          urlToImage:
            "https://akcdn.detik.net.id/visual/2017/11/21/199ff8b7-ff3d-450c-bc8d-9dacf8a8f000_169.jpg?w=280&q=90",
        },
        {
          title:
            "Harga Emas Hari Ini, 10 April 2025: Antam, UBS, Galeri 24 Naik Tajam",
          source: { name: "Kompas" },
          url: "https://www.kompas.com/jawa-tengah/read/2025/04/10/081343188/harga-emas-hari-ini-10-april-2025-antam-ubs-galeri-24-naik-tajam",
          urlToImage:
            "https://asset.kompas.com/crops/48OoZEgbg311pRxdydiNQnouubA=/450x301:4046x2699/1200x800/data/photo/2025/03/24/67e0e5c5d5db7.jpg",
        },
        {
          title:
            "Terungkap, Modus Dokter Residen Anestesi di Bandung Bius Korban Sebelum Perkosa",
          source: { name: "Kompas" },
          url: "https://www.kompas.com/jawa-timur/read/2025/04/09/191900288/terungkap-modus-dokter-residen-anestesi-di-bandung-bius-korban",
          urlToImage:
            "https://asset.kompas.com/crops/52c-tWOZj1_40tzfBtqq4OH9ipE=/0x0:800x533/1200x800/data/photo/2025/04/09/67f65f3c1eb38.jpeg",
        },
      ];

      this.isLoadingNews = false;
    },
    onImageError(event) {
      event.target.src = "https://via.placeholder.com/300x200?text=No+Image";
    },
  },
  mounted() {
    this.fetchNews();
  },
});
