const symbols = [
    { type: "image", path: "at_at.svg" },
    { type: "image", path: "c3po.svg" },
    { type: "image", path: "darth_vader.svg" },
    { type: "image", path: "death_star.svg" },
    { type: "image", path: "falcon.svg" },
    { type: "image", path: "r2d2.svg" },
    { type: "image", path: "stormtrooper.svg" },
    { type: "image", path: "tie_ln.svg" },
    { type: "image", path: "yoda.svg" }
]

Vue.component('Gift',{
    template:'#reelOutput',
    props:{
        trigger: {
            type: Date,
            default: false
        },
        config: {
            type: Object,
            required: true
        },
        autoPlay: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isRunning: false,
            currentDeg: 0,
            targetDeg: 0,
            giftsDeg: [],
        }
    },
    methods:{
        logGiftsDeg () {
            // 紀錄獎品角度
            this.config.gifts.forEach((gift, index) => {
              this.giftsDeg[index] = {
                from: index === 0 ? 0 : this.giftsDeg[index - 1].to,
                to: index === 0 ? this.rotate : this.giftsDeg[index - 1].to + this.rotate,
                name: gift.name
              }
            })
        },
        setConfig () {
            // 將config的變數們寫入CSS變數中
            this.$el.style.setProperty('--rotateY', this.config.rotateY + "deg")
            this.$el.style.setProperty('--duration', this.config.duration + "ms")
            this.$el.style.setProperty('--fontSize', this.config.fontSize + "px")
            this.$el.style.setProperty('--height', this.config.height + "px")
            this.$el.style.setProperty('--width', this.config.width + "px")
            this.$el.style.setProperty('--currentDeg', -this.currentDeg + "deg")
        },
        autoTurn () {
            // 取得隨機角度(預設至少跑5圈)
            let randomDeg = (Math.random() * 360) + (360 * 5)
            randomDeg -= randomDeg % this.rotate // 減去餘數，避免有高低不一的狀況
            this.targetDeg = randomDeg
            // 取得隨機回彈角度
            const randomRollBackDeg = this.config.rollback
              ? Math.random() * this.config.rollback + 1 : 1
            // 設定轉動角度
            this.$el.style.setProperty('--targetDeg', -this.targetDeg + "deg")
            if( !this.autoPlay ) {
                this.$el.style.setProperty('--rollBackDeg', randomRollBackDeg)
            }
            
            // 執行轉動
            this.isRunning = true
        },
        autoTurnStop () {
            // 把結束時的角度設定為當前角度
            this.currentDeg = this.targetDeg % 360
            this.$el.style.setProperty('--currentDeg', -this.currentDeg + "deg")
            // 顯示獎品資料(結束角度 + 單片角度/2)
            let giftName = null
            const endDeg = this.currentDeg + (this.rotate / 2)
            this.giftsDeg.forEach((gift) => {
                if (endDeg >= gift.from && endDeg <= gift.to) {
                    giftName = gift.name
                }
            })
            // 宣告轉動結束
            this.isRunning = false
            this.$emit('finished', giftName) // 告訴上層已經轉完
        }
    },
    computed:{
        rotate() {
            return 360 / this.config.gifts.length
        },
        translateZ() {
            return (this.config.height / 2) / Math.tan((this.rotate / 2 / 180) * Math.PI)
        }
    },
    watch:{
        config: {
            handler() {
              this.setConfig()
            },
            deep: true
        },
        trigger() {
            this.autoTurn()
        },
        isRunning() {
            if (this.isRunning) {
              setTimeout(() => {
                this.autoTurnStop()
              }, this.config.duration + 200)
            }
        }
    },
    mounted() {
        this.setConfig()
        this.logGiftsDeg()
    }
})


var app = new Vue({
    el:"#vueApp",
    data:{
        trigger: null,
        disabled: false,
        configs: [
          {
            rotateY: -25,
            duration: 4000,
            rollback: 0.3,
            fontSize: 100,
            height: 100,
            width: 200,
            gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index } }),
            img: symbols
        },
          {
            rotateY: -25,
            duration: 5000,
            rollback: 0.3,
            fontSize: 100,
            height: 100,
            width: 200,
            gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index } }),
            img: symbols
          },
          {
            rotateY: -25,
            duration: 6000,
            rollback: 0.3,
            fontSize: 100,
            height: 100,
            width: 200,
            gifts: Array.from(new Array(10), (val, index) => { return { type: 'text', name: index } }),
            img: symbols
          }
        ],
        openResultHistory: false,
        result: [],
        resultHistory: [],
        autoPlay: false
    },
    computed:{
    },
    methods:{
        turn () {
            this.disabled = true
            this.trigger = new Date()
        },
        isFinished (val) {
            const autoTurnList = this.$el.querySelectorAll('.autoTurn')
            this.result.push(val)
            // 剩一個轉輪在表演時紀錄歷史
            if (autoTurnList.length === 1) {
                this.disabled = false
                this.resultHistory.push(this.result)
                this.result = []

                if( this.autoPlay ) {
                    setTimeout(()=>{
                        this.turn();
                    }, 200)
                }
            }
        },
    }
})


