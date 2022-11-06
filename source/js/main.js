const Spinner = window.VueSimpleSpinner;
const vue_options = { el: '#app', vuetify: new Vuetify(), components: { Spinner } };

var vue;
var categories  = [];
var headers     = [];

async function initialise() {
    const config = await axios.get('data/config.json');
    categories  = config.data['categories'];
    headers     = config.data['headers'];
    vueSetup();
}

function vueSetup() {
    vue_options.data = {
        gridData: [],
        loading: true,
        types: categories, 
        headers: headers, 
        keyword:'',
        selected: '',
        total: 0,
        results: [],
        perPage: 30, 
        currentPage: 1,
        datacount: '',
        pageCount: 0
    };

    // Vue functions
    vue_options.beforeCreate = function() {
        this.loading = true;
        axios.get('data/database.json')
            .then((response) => {
                this.results  = response.data;
                this.gridData = response.data;
            })
            .catch(console.error);
    };
    vue_options.updated = function() {
        this.loading   = false;
        this.datacount = this.gridData.length;
    };

    // Methods
    vue_options.methods = {
        search: function() {
            var filtered = [];
            var dataset  = this.gridData;
            for (var i in dataset) {
                const row    = dataset[i];
                const rowStr = JSON.stringify(row);
                if (rowStr.indexOf(this.keyword) !== -1) {
                    if (this.selected && row.type !== this.selected) continue;
                    filtered.push(row);
                }
            }
            this.results = filtered;
            this.currentPage = 1;
        },
        noImage(element) { element.target.src = './img/noimage.png' }
    };

    // Computed methods
    vue_options.computed = {
        getItems: function() {
            let current = this.currentPage * this.perPage;
            let start   = current - this.perPage;
            return this.results.slice(start, current);
        },
        getHash: function() {
            return item => {
                var uint32 = new Uint32Array(1);
                var sanitised = String(item.uri).toLowerCase();
                for (var char of sanitised) {
                    uint32[0] *= 37;
                    uint32[0] += char.charCodeAt();
                }
                return new DataView(uint32.buffer).getUint32(0, true);  // 'true' indicates LE but this outputs the (intended) BE value...??
            } 
        },
        getPageCount: function() { return Math.ceil(this.results.length / this.perPage); },
        getImagePath: function() { return uuid => `./thumb/large/${uuid}.png` },
        countData:    function() { return this.results.length(); },
    }

    // Initialise Vue with the configured options
    vue = new Vue(vue_options);
}

initialise();