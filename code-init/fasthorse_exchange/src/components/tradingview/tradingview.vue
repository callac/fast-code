<template>
  <div class="tradingView-box" :class="{isFullscreen:fullState}">
    <div class="tradingView-header">
      <div class="tradingView-nav" v-for="(item, i) in resolutionButtons"
           :class="{'active':(resolutionSelect === item.resolution &&
           chartType === item.chartType)}"
           :key="i"
           @click="changeResolution(item)">
        {{item.title}}
      </div>
      <div class="tradingView-nav tradingView-border-nav tradingView-border-left"
           @click="executeAction(1)">
        <img title="指标" :src="require('assets/tradingview/compare.png')"/>
      </div>
      <div class="tradingView-nav tradingView-border-nav" @click="executeAction(2)">
        <img title="设置" :src="require('assets/tradingview/set.png')"/>
      </div>
      <div class="tradingView-nav tradingView-border-nav" @click="executeAction(3)">
        <img v-show="fullState" title="取消全屏" :src="require('assets/tradingview/fullscreened.png')"/>
        <img v-show="!fullState" title="全屏" :src="require('assets/tradingview/fullscreen.png')"/>
      </div>
      <div class="tradingView-nav tradingView-border-nav" @click="changeTheme()">
        <img v-show="theme === 'white'" title="夜间模式"
             :src="require('assets/tradingview/night-icon.png')"/>
        <img v-show="theme === 'black'" title="日间模式"
             :src="require('assets/tradingview/day-icon.png')"/>
      </div>
    </div>
    <div class="tradingView-body">
      <div id="chart_container" class="tradingView-container"></div>
<!--      <div class="watermark">-->
<!--        <img :src="require('assets/tradingview/watermark.png')"/>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script>
// import { deepMergeArr } from 'utils/Sort'
// import Storage from 'utils/StorageX'
import { mapActions, mapState } from 'vuex'
// import config from 'config/config'
import datafeeds from './datafeeds/datafees'

// 单条 K 线数据存储长度上限
// const limit = 1586
const limit = 400

// const storage = new Storage()

// let KLineTime = null

// 历史数据获取次数 限定五次 （2次未获取到数据不再获取）
// let historyCount = 0

// 储存的键值的前缀
// const keyPrefix = 'KLINE'
/* eslint-disable */
export default {
  props: {
    // 交易对
    symbol: String,
    coin: Object,
    theme: String,
  },
  data() {
    return {
      // 初始数据
      data: [],
      test:[],
      getBarTimer: null,
      // k线起始时间间隔
      period: undefined,
      // 增量数据
      updateData: {},
      // K 线蜡烛时间间隔
      resolution: '15', // 商品的周期
      resolutionSelect: '15', // 商品的周期选中状态值
      // isLoading: true,
      chart: null,
      datafeeds: new datafeeds(this),
      loadMore: false,  //是否还有历史行情
      lastTime:'',  //k线最后的时间
      prev:Date.now(),  //k线更新优化  1秒更新一次
      resolutionButtons:[
        {title:'Time',resolution:'1',chartType:3},
        {title:'1m',resolution:'1',chartType:1},
        {title:'5m',resolution:'5',chartType:1},
        {title:'15m',resolution:'15',chartType:1},
        {title:'30m',resolution:'30',chartType:1},
        {title:'1h',resolution:'60',chartType:1},
        {title:'2h',resolution:'120',chartType:1},
        {title:'4h',resolution:'240',chartType:1},
        {title:'6h',resolution:'360',chartType:1},
        {title:'12h',resolution:'720',chartType:1},
        {title:'1d',resolution:'1D',chartType:1},
        {title:'1w',resolution:'W',chartType:1},
      ],
      chartType:1, //k线类型
      fullState:false, //全屏状态
      rangeStartDate:'', //k线开始时间
      loadHistoryState:false,
      onReadyState: false,
    }
  },
  created(){
    const resolution = window.localStorage.getItem('resolution')
    this.resolution=resolution?resolution:'15'
    this.resolutionSelect=resolution?resolution:'15'
  },
  mounted() {
    const self = this;
    this.query();
    this.initOnReady();
    // 监听esc退出
    if(navigator.userAgent.indexOf("MSIE")>0)  {
      //IE
      document.onkeydown=function(){
        if(27 === event.keyCode){
          self.fullState=false
        }
      }
    }else{
      //非IE
      window.onkeydown=function(){
        if(27 === event.keyCode){
          self.fullState=false
        }
      }
    }
  },
  computed: {
    // 服务器与客户端本地时间差
    ...mapState(['deltaTime']),
    ...mapState('market', {
      // 订阅得到的增量数据
      updateData1: state => state.kline.updateData,
    }),
    ...mapState('market', ['symbols']),
    // 商品的周期入参
    interval(){
      let interval=60
      switch (this.resolution) {
        case '1D':
          interval=24*60*60*1000;
          break;
        // case '5D':
        //   interval=5*24*60*60*1000;
        //   limit=50;
        //   break;
        //   // 5天  221184060   221184060
        //   // 1周  283737660
        // case '1W':
        //   limit=15;
        //   interval=7*24*60*60*1000;
        //   break;
        case 'D': //一周
          interval=7*24*60*60*1000;
          break;
        case 'W': //一周
          interval=7*24*60*60*1000;
          break;
        default:
          interval=Number(this.resolution)*60*1000;
          break;
      }
      return Number(interval)
    },
    // 获取历史数据k线参数
    // intervaltype(){
    //   let type='1min'
    //   switch (this.resolutionSelect){
    //     case '1':
    //       type='1min'
    //       break;
    //     case '5':
    //       type='5min'
    //       break;
    //     case '15':
    //       type='15min'
    //       break;
    //     case '30':
    //       type='30min'
    //       break;
    //     case '60':
    //       type='1hour'
    //       break;
    //     case '120':
    //       type='2hour'
    //       break;
    //     case '240':
    //       type='4hour'
    //       break;
    //     case '360':
    //       type='6hour'
    //       break;
    //     case '720':
    //       type='12hour'
    //       break;
    //     case '1D':
    //       type='day'
    //       break;
    //     case 'W':
    //       type='week'
    //       break;
    //     default:
    //       type='1min'
    //       break;
    //   }
    //   return type
    // },
    // 获取国际化语言配置
    getLang() {
      const langs = {
        'zh-hans': 'zh',
        'zh-hant': 'zh_TW',
        'en': 'en',
        'ja': 'ja',
      }
      return (langs[this.$i18n.locale] || 'en')
    },
    // 储存的键值
    localStorageKey() {
      // if (!this.symbol || !(this.period && this.period.value)) return ''
      return ''
      // return this.getKey(this.symbol, this.period.value)
    },
  },
  watch: {
    // resolution() {
    //   // 当间隔对象发生变化时，重新请求数据
    //   this.query(false, true)
    // },
    symbol() {
      this.updateData={}
      // 当交易对发生变化时，重新请求数据
      // console.log(this.onReadyState)
      if(this.onReadyState){
        this.query(false, true)
      }
    },
    updateData1({ data, market, interval }) {
      // const key = this.getKey(market, interval)
      const localData = this.data;
      // 当增量数据发生变化时，通过 K 线的 updateData 更新 K 线
      // 条件：
      // 1. 交易对和时间间隔都和现在的交易对对应（此时 key 和 localStorageKey 相同）
      // 2. 第一个增量数据与 K 线本地最后一个数据的时间间隔等于 interval 的倍数
      // this.updateData={}
      const DataLength=data.length-1<0 ? 0 : data.length-1;
      if (this.data.length > 0 && data[DataLength]
        && (data[DataLength][0] - localData[localData.length - 1].time) % interval === 0
        && data[DataLength][7]=== this.symbol) {
        const now = Date.now();
        if (now - this.prev >= 1000) { //限制1秒执行一次
          const updateData = {
            time: data[DataLength][0],
            open: data[DataLength][1],
            high: data[DataLength][2],
            low: data[DataLength][3],
            close: data[DataLength][4],
            volume: data[DataLength][5],
          }
          this.datafeeds.barsUpdater.updateData()
          this.data[this.data.length-1] = updateData
          this.updateData = updateData;
          this.prev = Date.now();
        }
        // this.setLocalStorage(key)
      }
    },
  },
  methods: {
    ...mapActions(['getDeltaTime']),
    ...mapActions('market', ['klineQuery', 'klineUpdate', 'klineUnsubscribe', 'getKline']),
    // 绘制k线图
    initOnReady() {
      this.onReadyState = false
      const self=this;
      const themes = {
        "white": {
          theme:'Light',
          "background": "#fff",
          toolbar_bg:'#fff', //工具栏背景色
          'lineColor' : "#7A8E99",
          'textColor' : "#7A8E99",
          'GridColor' : "#EBF1F5",
          'loadingBan' : "#fff",
        },
        "black": {
          theme:'Dark',
          "background": "#151B1F",
          toolbar_bg:'#1F2529', //工具栏背景色
          'lineColor' : "#5b6469",
          'textColor' : "#5b6469",
          'GridColor' : "#2A3338",
          'loadingBan' : "#1f2b34",
        }
      };
      console.log('tvWidget初始化')
      this.chart = window.tvWidget = new TradingView.widget({
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        autosize: true,
        // symbol: self.String,
        symbol: this.symbol,
        interval: this.resolution,
        timezone: "Asia/Shanghai",
        container_id: "chart_container",
        debug: false,
        // custom_css_url: './css/tradingview_'+skin+'.css',
        //	BEWARE: no trailing slash is expected in feed URL
        // datafeed: self.feed,
        // datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com"),
        datafeed: this.datafeeds,
        library_path: process.env.NODE_ENV === 'production' ? "/chart_main/":'/static/chart_main/',
        locale: this.getLang,
        // custom_css_url : 'css/chart.css',    //自定义css存放位置,以library_path为目录
        // custom_css_url : 'css/tradingview_black.css',    //自定义css存放位置,以library_path为目录
        custom_css_url : `https://ztstatic.oss-cn-hangzhou.aliyuncs.com/chart_main_zt/static/css/tradingview_${this.theme}.css`,    //自定义css存放位置,以library_path为目录
        //隐藏模块
        disabled_features: [
          "header_widget_dom_node",   //顶部工具条
          "use_localstorage_for_settings",  //语言设置
          "header_saveload", //模板保存
          "header_compare",  //比较功能
          "header_symbol_search",  //交易对搜索
          "header_screenshot",   //截图保存
          "timeframes_toolbar",  // 底部时间跳转
          "volume_force_overlay",  //在主数据量列的窗格上放置成交量指标
          "display_market_status",  //显示市场状态 （开市休市，加载中等）
          "symbol_info",  //商品信息弹窗
          "header_chart_type",  //图标类型
          "header_undo_redo",  //左右按钮
          "header_resolutions",  //k线周期
          "header_indicators",   //指标
          "border_around_the_chart",   //顶部工具栏
          "remove_library_container_border",   //顶部工具栏
          "header_settings",   //设置按钮
          "header_fullscreen_button",   //全屏按钮
          "header_widget",   //头部工具栏
        ],
        enabled_features: [
          // "move_logo_to_main_pane",  //将logo放在主数据列窗格上而不是底部窗格
        ],
        // 绘图覆盖
        overrides:{
          // "paneProperties.bottomMargin":5,
          // "paneProperties.topMargin":12,
          // "volumePaneSize": "small",
          "paneProperties.background": themes[this.theme].background,
          "paneProperties.vertGridProperties.color": themes[this.theme].GridColor,
          "paneProperties.horzGridProperties.color": themes[this.theme].GridColor,
          // "symbolWatermarkProperties.transparency": 90,
          // "scalesProperties.textColor": "rgba(255,255,255,.8)",
          // "mainSeriesProperties.candleStyle.drawBorder": !1
          //K线图的颜色
          'mainSeriesProperties.candleStyle.upColor':'#50A39A',
          'mainSeriesProperties.candleStyle.downColor':'#DE5E56',
          // 'mainSeriesProperties.candleStyle.drawWick':true,
          // 'mainSeriesProperties.candleStyle.drawBorder':true,
          //涨的外边线
          'mainSeriesProperties.candleStyle.borderUpColor': "#50A39A",
          //跌的外边线
          'mainSeriesProperties.candleStyle.borderDownColor': "#DE5E56",
          'scalesProperties.lineColor' : themes[this.theme].lineColor,
          'scalesProperties.textColor' : themes[this.theme].textColor,
          // 交易量区域
          "volumePaneSize": "medium", // 支持的值: large, medium, small, tiny
        }, //图表背景等样式重载（即修改样式
        // studies_overrides: {
        //   "volume.volume.color.0": "#ff5353",
        //   "volume.volume.color.1": "#00b07c",
        //   "volume.volume.transparency": "53",
        //   "volume.show ma": !0,
        //   "volume.volume ma.plottype": "line"
        // },    //线条样式的重载
        charts_storage_url: 'http://saveload.tradingview.com',
        charts_storage_api_version: "1.1",
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        toolbar_bg:themes[this.theme].toolbar_bg, //工具栏背景色
        theme: themes[this.theme].theme,  // "Light" | "Dark".]）
        // theme: this.theme === 'black' ? 'Dark' : 'Light',  // "Light" | "Dark".]）
        favorites: {
          intervals: ['1', '5', '15', '30', '60', '120', '240','360','720','1D', '1W']
        },
        customFormatters: {
          // timeFormatter: {
          //   format: function(date) { var _format_str = '%h:%m'; return _format_str.replace('%h', date.getUTCHours(), 2). replace('%m', date.getUTCMinutes(), 2). replace('%s', date.getUTCSeconds(), 2); }
          // },
          dateFormatter: {
            format: function(date) { return date.getUTCFullYear() + '-' + (date.getUTCMonth()+1) + '-' + date.getUTCDate(); }
          }
        },  //自定义显示日期和时间的值
        loading_screen: {
          backgroundColor: themes[this.theme].loadingBan,
          foregroundColor: "#0CB0FF"
        },    //加载图表时loading的样式
      });

      this.chart.onChartReady(function() {
        console.log(' this.chart.onChartReady===============================')
//           指标
        self.chart.chart().createStudy('Moving Average', false, false, [7, 'close', 0], null, {
          'Plot.color': '#e1dce0',
          'Plot.linewidth': 1
        })
        self.chart.chart().createStudy('Moving Average', false, false, [30, 'close', 0], null, {
          'Plot.color': '#ffb620',
          'Plot.linewidth': 1
        })
        // self.chart.chart().createStudy('Moving Average', false, false, [60, 'close', 0], null, {
        //   'Plot.color': '#0aff2f',
        //   'Plot.linewidth': 1
        // })


//         self.chart.chart().createStudy('Moving Average', false, false, [30, 'close', 0], null, {
//           'Plot.color': '#ff688f',
//           'Plot.linewidth': 1
//         })
      })
    },
    // 切换主题
    changeTheme() {
      const te = this.theme==='black' ? 'white':'black'
      this.$emit('changeTheme',te)
      setTimeout(()=>{
        this.initOnReady();
      },200)
    },
    // 周期切换
    changeResolution(item){
      // historyCount = 0;
      // const serverTime = parseInt(Date.now() - this.deltaTime)
      // const interval = this.interval
      // const from = parseInt(serverTime - limit * interval/2)
      // this.chart.chart().setVisibleRange({from,to:serverTime},()=>{
      //   this.chart.chart().setResolution(item.resolution,()=>{
      //     setTimeout(()=>{
      //       this.loadHistoryState = false
      //     },5000)
      //   })
      // })
      this.loadMore=false;
      this.chart.chart().setResolution(item.resolution,()=>{
        setTimeout(()=>{
          this.loadHistoryState = false
        },5000)
      })
      this.resolutionSelect = item.resolution
      // if(item.resolution === 'W' || item.resolution === '1D'){
      //   // this.chart.chart().onDataLoaded();
      //   this.chart.activeChart().resetData();
      //   // subscribe(object, method, singleshot)
      // }
      if(item.chartType != this.chart.chart().chartType()){
        this.chart.chart().setChartType(item.chartType);
        this.chartType=this.chart.chart().chartType();
        //        Bars = 0            #美国线
//        Candles = 1         #K线图
//        Line = 2            #线形图
//        Area = 3            #面积图
//        Heiken Ashi = 8     #平均K线图
//        Hollow Candles = 9  #空心K线图
//        Renko = 4           #转形图
//        Kagi = 5            #卡吉图
//        Point&Figure = 6    #点数图
//        Line Break = 7      #新价图
      }
      window.localStorage.setItem('resolution',this.resolutionSelect)
    },
    // 自定义按钮事件
    executeAction(index){
      if(index===1){
        // 指标
        this.chart.chart().executeActionById("insertIndicator");
      }else if(index===2){
        // 设置
        this.chart.chart().executeActionById("chartProperties");
      }else if(index===3){  //全屏
        // if(!this.fullState){
        // }
        this.fullState=!this.fullState;
        // setTimeout(()=>{
        //   const iframe = document.getElementsByTagName('iframe')[0]
        //   const body = iframe.contentWindow.document.getElementsByClassName('layout__area--center')[0];
        //   body.style.top=0;
        //   body.style.height=0;
        // },100)
      }
    },

    query(pre = false, reset = false) {
      // this.isLoading = true
      // 获取服务器与客户端本地时间差
      const getTime = this.getDeltaTime()
      this.loadMore=false;
      // 获取存储键值
      // const key = this.localStorageKey
      // if (key) {
      const market = this.symbol
      const interval = this.interval
      // 起始查询时间
      let start = null

      // 本地已缓存的数据
      let localData = []

      // K 线组件中已有的数据。查询之前的 K 线数据时有用
      let data = []

      const serverTime = Date.now() - this.deltaTime

      // 调用 K 线的 reset 方法重置 K 线
      if (reset) this.reset(!pre)

      // 如果是查询之前的 K 线数据，保存 K 线组件中已有的数据到 data 变量
      // 如果不是，则取出本地缓存数据 localData 赋值到 this.data，并计算出起始查询时间 start
      if (!pre) {
        this.klineUnsubscribe()
        // localData = this.data;
        // /* 如果 localStorage 中有旧数据，则使用 start 字段，值为最后一个蜡烛的时间 */
        // if (localData.length > 0) {
        //   [start] = localData[localData.length - 1]
        //   if ((serverTime - start) / interval > 300) {
        //     // this.isLoading = false
        //     this.data = []
        //     start = null
        //   } else {
        //     // 为避免出现重复 candle 再做一道保险
        //     this.data = deepMergeArr(localData, [], '0')
        //       .sort((a, b) => a[0] - b[0])
        //   }
        // } else {
        //   // this.isLoading = false
        //   this.data = []
        // }
      } else {
        // this.isLoading = false
      }

      start= this.rangeStartDate;
      this.loadHistoryState =true
      this.loadMore=false;
      // 查询
      // 如果不是查询之前的 K 线数据，还需要重新订阅 K 线数据
      // if (!pre){
      // }
      // const inter = interval/1000
      start = start ? start : parseInt(serverTime - limit * interval)
      // if (!interval) {
      //   return false
      // }
      console.log('首次加载')
      // getTime.then(() => {
      //   (serverTime - start < interval
      //     ? Promise.resolve([])
      //     : this.getKline({
      //       symbol:market,
      //       start,
      //       end: serverTime,
      //       interval:inter,
      //     }))
      //     .then((res) => {
      //       const newBars = []
      //       this.loadHistoryState =false
      //       // historyCount=0
      //       // this.cacheData[ticker].forEach(item => {
      //       res.forEach(item => {
      //         const barsData = {
      //           time: item[0],
      //           open: item[1],
      //           high: item[2],
      //           low: item[3],
      //           close: item[4],
      //           volume: item[5],
      //           // 时间戳，开盘，高，低，收，成交量
      //         }
      //         newBars.push(barsData)
      //       })
      //       if(newBars.length>0){
      //         this.lastTime = newBars[newBars.length - 1].time
      //       }
      //       // 如果是查询之前的 K 线数据，则合并数据
      //       // 如果不是，则通过 updateData 将数据更新到 K 线，<kline> 会自动合并数据
      //       // if (pre) this.data = [...newBars, ...data]
      //       // else {
      //       //   this.updateData = newBars
      //       //   this.setLocalStorage(key)
      //       // }
      //       // console.log('http加载')
      //       // console.log(newBars)
      //       if(res.length >0 && res[0][7]=== this.symbol){
      //         this.data = [...newBars, ...data]
      //         this.klineUpdate({ market, interval })
      //       }else{
      //         this.data = []
      //         this.loadMore=true;
      //       }
      //       // console.log(this.data)
      //       // this.datafeeds.barsUpdater.updateData()
      //     })
      //     .catch((e) => {
      //       this.snackBar.error(e)
      //       this.loadHistoryState =false
      //       if (!pre) {
      //         this.data = []
      //       }
      //     })
      //     .then(() => {
      //       // this.isLoading = false
      //     })
      // })
      getTime.then(() => {
        (serverTime - start < interval
          ? Promise.resolve([])
          : this.klineQuery({
            market,
            limit,
            start,
            end: pre && data.length > 0 ? data[0].time - interval : serverTime,
            interval,
          }))
          .then((res) => {
            const newBars = []
            this.loadHistoryState =false
            // historyCount=0
            // this.cacheData[ticker].forEach(item => {
            res.forEach(item => {
              const barsData = {
                time: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5],
              }
              newBars.push(barsData)
            })
            if(newBars.length>0){
              this.lastTime = newBars[newBars.length - 1].time
            }
            // 如果是查询之前的 K 线数据，则合并数据
            // 如果不是，则通过 updateData 将数据更新到 K 线，<kline> 会自动合并数据
            // if (pre) this.data = [...newBars, ...data]
            // else {
            //   this.updateData = newBars
            //   this.setLocalStorage(key)
            // }
            // console.log(res[0])
            if(res.length>0 && res[0][7]=== this.symbol){
              this.data = [...newBars, ...data]
            }else{
              this.data = []
              this.loadMore=true;
            }
            // this.datafeeds.barsUpdater.updateData()
          })
          .then(() => {
            // 如果不是查询之前的 K 线数据，还需要重新订阅 K 线数据
            if (!pre){
              this.klineUpdate({ market, interval })
            }
          })
          .catch((e) => {
            this.snackBar.error(e)
            if (!pre) {
              this.data = []
            }
          })
          .then(() => {
            // this.isLoading = false
          })
      })
    },
    // 重置 K 线period
    reset() {
      this.loadMore=false;
      // historyCount = 0
      this.period=null;
      this.data=[];
      const serverTime = parseInt(Date.now() - this.deltaTime)
      const interval = this.interval
      const from = parseInt(serverTime - limit * interval/2)
      this.chart.chart().setVisibleRange({from,to:serverTime},()=>{
        this.chart.setSymbol(this.symbol, this.resolution, ()=>{
          setTimeout(()=>{
            this.loadHistoryState = false
          },5000)
        })
      })
    },
    // 计算存储的键值
    // getKey(symbol, interval) {
    //   return `${keyPrefix}-${symbol}-${interval}`
    // },
    // 设置缓存
    // setLocalStorage(key) {
    //   this.$nextTick(() => {
    //     // 判断 存储键名 是否一致，如果一致则更新缓存
    //     if (key === this.localStorageKey) {
    //       const data = this.$refs.kline ? this.$refs.kline.myData : []
    //       storage.set(key, data.slice(Math.max(0, data.length - limit)))
    //     }
    //   })
    // },
    // 历史数据k线绘制
    getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback) {
      // 切换周期
      if (this.resolution !== resolution && !this.loadHistoryState) {
        this.resolution = resolution;
        this.data=[];
        this.loadMore=false;
        this.klineUnsubscribe()
        // this.rangeStartDate=rangeStartDate*1000
        this.query();
        // if(this.resolution !== '1'){
        //   this.chart.chart().setChartType(1);
        // }
      }
      // console.log(rangeStartDate)
      // console.log(rangeEndDate)
      // 原数据格式
      // 0: 1559094300000   time
      // 1: 11.3   open
      // 2: 11.3    close
      // 3: 11.3    highest
      // 4: 11.3    lowest
      // 5: 0     volume
      // 6: 0    amount
      // 7: "BTC_CNT"
      const self = this
      if(this.data && this.data.length>0 && !this.loadHistoryState){
        // if(!this.loadMore){
        const Data=this.data;
        if(Data[0].time>=rangeStartDate && this.rangeStartDate!==(rangeStartDate*1000) && !this.loadMore){
          // clearTimeout(KLineTime)
          // KLineTime = setTimeout(()=>{
            this.rangeStartDate=rangeStartDate*1000
            this.getHistory();
          // },500)
        }
        // 加载数据
        // console.log('渲染k线')
        if(this.loadMore){
          console.log('不再更新')
          onLoadedCallback([], {noData: true})
        }else{
          onLoadedCallback(Data, {noData: false});
        }
        // const period=rangeEndDate-rangeStartDate;
        // if(this.period!==period){
        //   // if(this.period!==period){
        //   this.period=period;
        //   // console.log(historyCount)
        //   // console.log('交易对更新')
        //   onLoadedCallback(Data, {noData: false});
        // }else{
        //   // this.getBarTimer = setTimeout(function () {
        //   //   self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        //   // }, 333)
        //   console.log('')
        //   onLoadedCallback([], {noData: true})
        // }
      } else {
        this.getBarTimer = setTimeout(function () {
          self.getBars(symbolInfo, resolution, rangeStartDate, rangeEndDate, onLoadedCallback)
        }, 666)
        // console.log('k线数据未取到');
        // console.log('没有更多数据'+this.loadMore);
        if(this.loadMore){
          onLoadedCallback(this.data, {noData: true})
        }
      }
    },
    // 获取当前时间之前的数据
    getHistory(){
      // 获取服务器与客户端本地时间差
      const getTime = this.getDeltaTime()
      const market = this.symbol
      const interval = this.interval;
      const serverTime = Date.now() - this.deltaTime
      const data=this.data
      const endTime= data.length > 0 ? data[0].time - interval : serverTime;
      if(endTime - this.rangeStartDate < interval){
        return false
      }
      // console.log('在加载============')
      const startTime= this.rangeStartDate - parseInt(this.rangeStartDate - endTime)%interval
      this.loadHistoryState =true
      // const inter = interval/1000
      // 查询
      // getTime.then(() => {
      //   (this.getKline({
      //     symbol:market,
      //     start:startTime,
      //     end: endTime,
      //     interval: inter,
      //   }))
      //     .then((res) => {
      //       // console.log('获取历史数据')
      //       this.loadHistoryState =false
      //       if(res.length>0){
      //         // historyCount=0
      //         const Bars = []
      //         // this.cacheData[ticker].forEach(item => {
      //         res.forEach(item => {
      //           const barsData = {
      //             time: item[0],
      //             open: item[1],
      //             high: item[2],
      //             low: item[3],
      //             close: item[4],
      //             volume: item[5],
      //           }
      //           Bars.push(barsData)
      //         })
      //         // 如果是查询之前的 K 线数据，则合并数据
      //         // 如果不是，则通过 updateData 将数据更新到 K 线，<kline> 会自动合并数据
      //         const newBars = Bars.filter(item=> item.time<this.data[0].time)
      //         this.data = [...newBars, ...data]
      //       }else {
      //         // if (historyCount>2){
      //         this.loadMore=true;
      //         // }
      //         // const toTime=parseInt(this.data.length/2);
      //         // this.chart.chart().setVisibleRange({from:this.data[0].item,to:toTime},function () {
      //         //
      //         // })
      //       }
      //     })
      // })
      getTime.then(() => {
        (this.klineQuery({
          market,
          limit,
          start:startTime,
          end: endTime,
          interval,
        }))
          .then((res) => {
            // console.log('获取历史数据')
            this.loadHistoryState =false
            if(res.length>0){
              // historyCount=0
              const newBars = []
              // this.cacheData[ticker].forEach(item => {
              res.forEach(item => {
                const barsData = {
                  time: item[0],
                  open: item[1],
                  high: item[2],
                  low: item[3],
                  close: item[4],
                  volume: item[5],
                }
                newBars.push(barsData)
              })
              // 如果是查询之前的 K 线数据，则合并数据
              // 如果不是，则通过 updateData 将数据更新到 K 线，<kline> 会自动合并数据

              this.data = [...newBars, ...data]
            }else {
              // if (historyCount>2){
              this.loadMore=true;
              // }
              // const toTime=parseInt(this.data.length/2);
              // this.chart.chart().setVisibleRange({from:this.data[0].item,to:toTime},function () {
              //
              // })
            }
          })
      })
    },
  },
  beforeDestroy() {
    this.klineUnsubscribe()
  },
}
</script>
