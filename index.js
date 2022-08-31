const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  isHeart: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: 'Nhạt',
      singer: 'Phan Mạnh Quỳnh',
      path: './assets/music/song1.mp3',
      image: './assets/img/song1.png',
    },
    {
      name: 'Khóc Cùng Em',
      singer: 'Mr.Siro',
      path: './assets/music/song2.mp3',
      image: './assets/img/song2.png',
    },
    {
      name: 'Nếu Ta Ngược Lối',
      singer: 'Châu Khải Phong',
      path: './assets/music/song3.mp3',
      image: './assets/img/song3.png',
    },
    {
      name: 'Cao ốc 20',
      singer: 'Bray x ĐạtG',
      path: './assets/music/song4.mp3',
      image: './assets/img/song4.png',
    },
    {
      name: 'Bên trên tầng lầu',
      singer: 'Tăng Duy Tân',
      path: './assets/music/song5.mp3',
      image: './assets/img/song5.png',
    },
    {
      name: 'Ngây Thơ',
      singer: 'Tăng Duy Tân x Phong Max',
      path: './assets/music/song6.mp3',
      image: './assets/img/song6.png',
    },
    {
      name: 'Thu cuối',
      singer: 'Mr T x Yanbi x Hằng Bingboong',
      path: './assets/music/song7.mp3',
      image: './assets/img/song7.png',
    },
  ],
  setConfig: function (key, value) {
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      //lap qua mang song
      return `
      <div class="song ${
        index === this.currentIndex ? 'active' : ''
      } " data-index="${index}">
      <div class="thumb" style="background-image:url('${song.image}')"></div>
      <div class="body">
      <h3 class="title">${song.name}</h3>
      <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fa-solid fa-heart"></i>
      </div>
      </div>
    `
    })

    playlist.innerHTML = htmls.join('') // day ma html vao playlist
  },

  handleEvents: function () {
    const _this = this
    const cdWidth = cd.offsetWidth

    // console.log(timeSong)
    // xử lý sự kiện quay đĩa nhạc CD khi nhạc phát
    const cdThumbAnimate = cdThumb.animate(
      [
        {
          transform: 'rotate(360deg)',
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
      }
    )
    cdThumbAnimate.pause()
    // xử lý phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newWidth = cdWidth - scrollTop
      cd.style.width = newWidth > 0 ? newWidth + 'px' : 0
      cd.style.opacity = newWidth / cdWidth
    }
    // Xử lý play music
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
    }
    // Khi song được play
    audio.onplay = function () {
      player.classList.add('playing')
      _this.isPlaying = true
      cdThumbAnimate.play()
    }
    // Khi song bị pause
    audio.onpause = function () {
      player.classList.remove('playing')
      _this.isPlaying = false
      cdThumbAnimate.pause()
    }
    // tiến độ bài hát
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const currentPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        )
        progress.value = currentPercent
        // hiển thị thời gian tại vị trí bài hát hát
        const currentMinutes = Math.floor(this.currentTime / 60)
        const currentSecond = Math.floor(audio.currentTime % 60)
        $('#songCurrentTime').textContent = `0${currentMinutes}:${
          currentSecond < 9 ? '0' + currentSecond : currentSecond
        }`
      }
    }
    // khi hết bài hát
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play()
      } else {
        nextBtn.click()
      }
    }
    // hiển thị thời gian tổng của bài hát
    audio.onloadedmetadata = function () {
      const songTime = Math.floor(this.duration / 60)
      const songSeconds = Math.floor(this.duration % 60)

      $('#songDuration').textContent = `0${songTime}:${
        songSeconds < 9 ? '0' + songSeconds : songSeconds
      }`
    }

    // khi tua
    progress.oninput = function (e) {
      var seekTime = (e.target.value * audio.duration) / 100
      audio.currentTime = seekTime
    }
    // next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong()
      } else {
        _this.nextSong()
      }
      if (_this.currentIndex > 3) {
        console.log(_this.currentIndex)
        _this.scrollToActiveSong()
      } else {
        console.log(_this.currentIndex)
        _this.scrollToActiveSong2()
      }
      audio.play()

      _this.render()
    }
    //prev song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong()
      } else {
        _this.prevSong()
      }
      audio.play()
      _this.render()
    }
    // xử lý lặp lại một song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat
      _this.setConfig('isRepeat', _this.isRepeat)
      this.classList.toggle('active')
    }
    // random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom
      _this.setConfig('isRandom', _this.isRandom)

      this.classList.toggle('active', _this.isRandom)
    }
    // xử lý lick vào vùng playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active')
      const optionNode = e.target.closest('.option')
      if (songNode || optionNode) {
        if (songNode && !optionNode) {
          _this.currentIndex = Number(songNode.dataset.index)
          // console.log(songNode.dataset.index)
          _this.loadCurrentSong()
          _this.render()
          audio.play()
        }
        if (optionNode) {
          _this.isHeart = !_this.isHeart
          _this.setConfig('isHeart', _this.isHeart)
          optionNode.classList.toggle('heart', _this.isHeart)
          console.log(optionNode)
        }
      }
    }
  },
  // định nghĩa thuộc tính cho obj
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      // currentSong là name định nghĩa để gọi  ra obj
      get: function () {
        return this.songs[this.currentIndex] // trả về obj tại vị trí currentIndex trong songs
      },
    })
  },
  // tải ra bài hát đầu tiên lên UI
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name // lấy ra thuộc tính name ở obj song
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')` // lấy ra thuộc tính image gán vào CD
    audio.src = this.currentSong.path // lấy path bài hát gán vào src của thẻ audio
  },
  // scroll to active song, bài hát đang play phải được hiện ra ở giao diện để không bị khất
  scrollToActiveSong: function () {
    setTimeout(function () {
      $('.song.active').scrollIntoView({
        behavior: 'smooth', // tạo hiệu ứng chuyển động mượt hơn
        block: 'nearest', // bài hát đang active có vị trí gần
      })
    }, 300)
  },
  // scroll to active song, bài hát đang play phải được hiện ra ở giao diện
  scrollToActiveSong2: function () {
    setTimeout(function () {
      $('.song.active').scrollIntoView({
        behavior: 'smooth',
        block: 'center', //bài hát đang active hiện ở giữa view
      })
    }, 300)
  },
  // next song isPlaying  -> play next song
  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }
    this.loadCurrentSong()
  },
  // prev song isPlaying -> play prev song
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }
    this.loadCurrentSong()
  },
  // random song -> play random song
  randomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length)
    } while (newIndex === this.currentIndex)
    this.currentIndex = newIndex
    this.loadCurrentSong()
  },
  loadConfig: function () {
    this.isRepeat = this.config.isRepeat
    this.isRandom = this.config.isRandom
    // this.isHeart = this.config.isHeart
  },
  start: function () {
    this.loadConfig()
    // Định nghĩa cacs thuộc tính cho object
    this.defineProperties()
    // lắng nghe xử lý các sử kiện (DOM Events)
    this.handleEvents()

    this.loadCurrentSong()

    //Render ra playlist
    randomBtn.classList.toggle('active', this.isRandom)
    repeatBtn.classList.toggle('active', this.isRepeat)
    // $('.option').classList.toggle('heart', this.isHeart)

    this.render() //goi ham render
  },
}
app.start() //chay code
