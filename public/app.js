<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>


const app = new Vue({
  el: '#app',
  data: {
    url: '',
    slug: '',
    error: '',
    formVisible: true,
    created: null,
  },
    methods: {
      async createUrl() {
        this.error = '';
        const response = await fetch('/url', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            url: this.url,
            slug: this.slug || undefined,
          }),
        });
        if (response.ok) {
          const result = await response.json();
          this.formVisible = false;
          this.created = `http://localhost/${result.slug}`;
        } else if (response.status === 429) {
          this.error = 'You are sending too many requests. Try again in 30 seconds.';
        } else {
          const result = await response.json();
          this.error = result.message;
        }
      },
    },
  });