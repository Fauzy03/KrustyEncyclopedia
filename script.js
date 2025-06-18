new Vue({
  el: "#app",
  data: {
    // Core
    language: "id",
    query: "",
    results: [],
    showResults: false,
    isLoadingSearch: false,
    isLoadingNews: true,
    news: [],

    // Login
    loginForm: {
      username: "",
      password: "",
    },
    isLoggedIn: false,
    username: "",
    showLoginModal: false,

    // Fitur tambahan
    favorites: JSON.parse(localStorage.getItem("favorites")) || [],
    searchHistory: JSON.parse(localStorage.getItem("searchHistory")) || [],
    darkMode: JSON.parse(localStorage.getItem("darkMode")) || false,
  },
  methods: {
    // ======= Search Wikipedia =======
    search() {
      if (this.query.trim() === "") return;

      // Simpan histori tanpa duplikat, maksimal 10
      if (!this.searchHistory.includes(this.query.trim())) {
        this.searchHistory.unshift(this.query.trim());
        if (this.searchHistory.length > 10) this.searchHistory.pop();
        localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
      }

      this.isLoadingSearch = true;
      this.showResults = false;

      fetch(`https://${this.language}.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages|extracts&exintro&explaintext&generator=search&gsrsearch=${encodeURIComponent(this.query)}&gsrlimit=5&pilimit=5&pithumbsize=300`)
        .then((res) => res.json())
        .then((data) => {
          this.results = [];

          if (data.query && data.query.pages) {
            this.results = Object.values(data.query.pages).map((page) => {
              const isFav = this.favorites.some(fav => fav.title === page.title);
              const comments = this.loadComments(page.title);
              return {
                title: page.title,
                body: page.extract,
                link: `https://${this.language}.wikipedia.org/?curid=${page.pageid}`,
                image: page.thumbnail ? page.thumbnail.source : null,
                extraInfo: "",
                comments: comments || [],
                newComment: "",
                isFavorite: isFav
              };
            });
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

    // ======= NewsAPI =======
    fetchNews() {
      const apiKey = "b0c16bbdd4dd43879b18f366d1bf61d9"; // tetap pakai API key Anda
      // bisa ganti query/tab untuk berita Indonesia atau global
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

    // ======= Favorites =======
    toggleFavorite(item) {
      const index = this.favorites.findIndex(fav => fav.title === item.title);
      if (index === -1) {
        this.favorites.push({ title: item.title, body: item.body });
        item.isFavorite = true;
      } else {
        this.favorites.splice(index, 1);
        item.isFavorite = false;
      }
      localStorage.setItem("favorites", JSON.stringify(this.favorites));
    },

    // ======= Search History =======
    searchFromHistory(term) {
      this.query = term;
      this.search();
    },
    clearHistory() {
      this.searchHistory = [];
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    // ======= Comments =======
    addComment(item) {
      if (item.newComment && item.newComment.trim() !== "") {
        item.comments.push(item.newComment.trim());
        this.saveComments(item.title, item.comments);
        item.newComment = "";
      }
    },
    saveComments(title, comments) {
      const allComments = JSON.parse(localStorage.getItem("comments")) || {};
      allComments[title] = comments;
      localStorage.setItem("comments", JSON.stringify(allComments));
    },
    loadComments(title) {
      const allComments = JSON.parse(localStorage.getItem("comments")) || {};
      return allComments[title] || [];
    },

    // ======= Download Results =======
    downloadResults() {
      const data = this.results.map(item => {
        return `Judul: ${item.title}\nDeskripsi: ${item.body}\nInfo Terkait: ${item.extraInfo || '-'}\nLink: ${item.link}\nKomentar: ${(item.comments || []).join(", ")}\n\n`;
      }).join("");

      const blob = new Blob([data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "hasil-pencarian.txt";
      link.click();
      URL.revokeObjectURL(url);
    },

    // ======= Dark Mode =======
    applyDarkMode() {
      if (this.darkMode) document.body.classList.add("dark-mode");
      else document.body.classList.remove("dark-mode");
    },

    // ======= Login / Logout =======
    login() {
      const { username, password } = this.loginForm;
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        this.username = username;
        this.isLoggedIn = true;
        this.showLoginModal = false;
        this.loginForm.username = "";
        this.loginForm.password = "";
      } else {
        alert("Username atau password salah.");
      }
    },
    logout() {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("username");
      this.isLoggedIn = false;
      this.username = "";
    },
  },
  watch: {
    darkMode(newVal) {
      this.applyDarkMode();
      localStorage.setItem("darkMode", JSON.stringify(newVal));
    }
  },
  mounted() {
    // Inisialisasi
    this.fetchNews();

    // Dark mode & login state
    this.applyDarkMode();
    this.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    this.username = localStorage.getItem("username") || "";
  }
});
