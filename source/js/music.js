const vue_options = { el: '#musicapp', vuetify: new Vuetify() };

var vue;
var songs = [];

async function initialise() {
    const music = await axios.get('data/music.json');
    songs = music.data['songlist'];
    vueSetup();
}

function vueSetup() {
    const initial_id = 0;
    vue_options.data = {
        songlist: songs,
        audio: new Audio(),
        currentSong: initial_id,
        src: songs[initial_id].filename,
        songTitle: songs[initial_id].title,
        desc: songs[initial_id].desc,
        currentTime: 0,
        duration: 0,
        perTime: 0,
        isPlaying: false,
        seekerFocused: false,
        vol: 50
    };

    // Vue functions
    vue_options.mounted = function () {
        this.audio.src = this.src;
        this.audio.load();
        this.audio.volume = this.vol / 100;
        this.audio.addEventListener('canplay', () => this.duration = this.audio.duration);
        this.audio.addEventListener('timeupdate', () => this.currentTime = this.audio.currentTime);
    };
    
    vue_options.watch = {
        vol(value) { this.audio.volume = value / 100; },
        nowtime(value) { this.audio.currentTime = value; },
    };

    // Methods
    vue_options.methods = {
        play: function() {
            this.audio.play();
            this.isPlaying = true;
        },
        pause: function() {
            this.audio.pause();
            this.isPlaying = false;
        },
        skipPrev: function() { this.setNewSong(Math.max(0, this.currentSong - 1)) },
        skipNext: function() { this.setNewSong(Math.min(3, this.currentSong + 1)) },
        setNewSong: function(value) {
            var newsong    = this.songlist[value];
            this.audio.src = newsong.filename;
            this.songTitle = newsong.title;
            this.desc      = newsong.desc;

            this.audio.pause();
            this.audio.load();
            this.currentSong = value;
            this.currentTime = 0;
            if (this.isPlaying) this.audio.play();
        },
        /**
         * 'time' is an integer between 0 and 100
         * We can divide by 100 to get the % as a decimal
         * Then: Multiply the song's duration by this amount to get our desired time
         */
        seek: function(time) {
            time = time / 100;
            const seekTo = this.audio.duration * time;
            this.audio.fastSeek(seekTo);
            this.currentTime = seekTo;
        }
    };

    // Computed methods
    vue_options.computed = {
        volumeIcon() {
            if (this.muted)        return this.muteVolumeIcon;
            if (this.volume === 0) return this.lowVolumeIcon;
            if (this.volume >= 50) return this.highVolumeIcon;
            return this.mediumVolumeIcon;
        },
        currentMinsec: function() {
            var num = this.currentTime;
            var min = Math.floor(num % (24 * 60 * 60) % (60 * 60) / 60);
            var retmin = ( '00' + min ).slice( -2 );
            var sec = Math.round(num % (24 * 60 * 60) % (60 * 60) % 60);
            var retsec = ( '00' + sec ).slice( -2 );
            var curtime = retmin + ":" + retsec;
            return curtime;
        },
        durationMinsec: function() {
            var num = this.duration;
            var min = Math.floor(num % (24 * 60 * 60) % (60 * 60) / 60);
            var retmin = ( '00' + min ).slice( -2 );
            var sec = Math.round(num % (24 * 60 * 60) % (60 * 60) % 60);
            var retsec = ( '00' + sec ).slice( -2 );
            var curtime = retmin + ":" + retsec;
            return curtime;
        }
    };

    // Initialise Vue with the configured options
    vue = new Vue(vue_options);
}

initialise();