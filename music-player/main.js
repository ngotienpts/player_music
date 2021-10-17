/**
 * 1: Render songs
 * 2: Sroll top
 * 3: play / pause / seek
 * 4: CD rotate
 * 5: Next / prev
 * 6: Random
 * 7: Next / Repeat when ended
 * 8: Active song
 * 9: Scroll active song intro
 * 10: Play song when click
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "F8-player";

const cd = $(".cd");
const heading = $("header h2");
const thumbImg = $(".cd-thumb");
const audio = $("#audio");
const player = $(".player");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const prevBtn = $(".btn-prev");
const nextBtn = $(".btn-next");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playList = $(".playlist");
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: "Nevada",
            singer: "Vicetone",
            path: "./music/1.mp3",
            image: "./images/1.jpg",
        },
        {
            name: "SummerTime",
            singer: "K-391",
            path: "./music/2.mp3",
            image: "./images/2.jpg",
        },
        {
            name: "Monodi",
            singer: "TheFastRast",
            path: "./music/3.mp3",
            image: "./images/3.jpg",
        },
        {
            name: "Reality",
            singer: "Lost Frenquensies",
            path: "./music/4.mp3",
            image: "./images/4.jpg",
        },
        {
            name: "Ngay khac la",
            singer: "Tripide",
            path: "./music/5.mp3",
            image: "./images/5.jpg",
        },
        {
            name: "Lemon tree",
            singer: "Dj Desa remix",
            path: "./music/6.mp3",
            image: "./images/6.jpg",
        },
        {
            name: "Sugar",
            singer: "Maron 5",
            path: "./music/7.mp3",
            image: "./images/7.jpg",
        },
        {
            name: "Mylove",
            singer: "westlife",
            path: "./music/8.mp3",
            image: "./images/8.jpg",
        },
        {
            name: "Attention",
            singer: "Chenest",
            path: "./music/9.mp3",
            image: "./images/9.jpg",
        },
        {
            name: "Monster",
            singer: "Keytykai",
            path: "./music/10.mp3",
            image: "./images/10.jpg",
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    defineProperties: function() {
        Object.defineProperty(this, "currentSong", {
            get: function() {
                return this.songs[this.currentIndex];
            },
        });
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div data-index=${index} class="song ${
        index === this.currentIndex ? "active" : ""
      }">
                    <div class="thumb" style="background-image: url('${
                      song.image
                    }')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`;
        });
        playList.innerHTML = htmls.join("");
    },
    handleEvent: function() {
        const _this = this;
        // Xử lý phóng to / thu nhỏ CD
        const cdWidth = cd.offsetWidth;
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop || window.scrollY;
            const cdNewWidth = cdWidth - scrollTop;
            cd.style.width = cdNewWidth > 0 ? cdNewWidth + "px" : 0;
            cd.style.opacity = cdNewWidth / cdWidth > 0 ? cdNewWidth / cdWidth : 0;
        };

        // Xử lý quay / dừng cd
        const animateRotate = thumbImg.animate([{ transform: "rotate(360deg)" }], {
            duration: 10000,
            iterations: Infinity,
        });
        animateRotate.pause();

        //  Xử lý play audio
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };
        // Khi song được  play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add("playing");
            animateRotate.play();
        };

        //  Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove("playing");
            animateRotate.pause();
        };

        // Khi tiến độ thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPersent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPersent;
            }
        };

        // Xử lý khi tua
        progress.oninput = function(e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
            audio.play();
        };

        // Xử lý next bài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        };

        // Xử lý prev bài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.scrollToActiveSong();
        };

        // Xử lý khi random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            if (!_this.isRepeat) {
                randomBtn.classList.toggle("active", _this.isRandom);
                _this.setConfig("isRandom", _this.isRandom);
            }
        };

        // Xử lý phát 1 bài liên tục
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            if (!_this.isRandom) {
                repeatBtn.classList.toggle("active", _this.isRepeat);
                _this.setConfig("isRepeat", _this.isRepeat);
            }
        };

        // Xử lý next khi hêt bài
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.load();
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lắng nghe hành vi click vào song
        playList.onclick = function(e) {
            const songNode = e.target.closest(".song:not(.active)");
            const optionNode = e.target.closest(".option");
            if (songNode && !optionNode) {
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
        };
    },
    scrollToActiveSong: function() {
        setTimeout(function() {
            $(".song.active").scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
            });
        }, 200);
    },
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name;
        thumbImg.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;
        if ($(".song.active")) {
            $(".song.active").classList.remove("active");
        }
        const listSongs = $$(".song");
        listSongs.forEach((song) => {
            if (song.getAttribute("data-index") == this.currentIndex) {
                song.classList.add("active");
            }
        });
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        repeatBtn.classList.toggle("active", this.isRepeat);
        randomBtn.classList.toggle("active", this.isRandom);
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function() {
        // Gán cấu hình từ config trong localStorage vào ứng dụng
        this.loadConfig();

        //Định nghia các thuộc tính của Object
        this.defineProperties();

        // xử lý các sự kiện
        this.handleEvent();

        // Tải thông tin của bài hát đầu tiên
        this.loadCurrentSong();

        // render playlist
        this.render();
    },
};
app.start();