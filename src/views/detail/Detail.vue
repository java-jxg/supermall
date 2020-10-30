<template>
<div>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"></detail-nav-bar>
    <scroll class="content" ref="scroll" :probe-type="3" @scroll="contentScroll">
<!--      <ul>-->
<!--        <li v-for="item in $store.state.cartList">-->
<!--          {{item}}-->
<!--        </li>-->
<!--      </ul>-->
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref="params" :param-info="paramInfo"></detail-param-info>
      <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
      <goods-list ref="recommend" :goods="recommends"></goods-list>
    </scroll>
    <detail-bottom-bar @addCart="addToCart"></detail-bottom-bar>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>

  </div>
</div>
</template>

<script>
import DetailNavBar from "./childComps/DetailNavBar";
import DetailSwiper from "./childComps/DetailSwiper";
import {getDetail,Goods,Shop,GoodsParam,getRecommend} from "../../network/detail";
import DetailBaseInfo from "./childComps/DetailBaseInfo";
import DetailShopInfo from "./childComps/DetailShopInfo";
import Scroll from "../../components/common/scroll/Scroll";
import DetailGoodsInfo from "./childComps/DetailGoodsInfo";
import DetailParamInfo from "./childComps/DetailParamInfo";
import DetailCommentInfo from "./childComps/DetailCommentInfo";
import GoodsList from "../../components/content/goods/GoodsList";
import {debounce} from "../../common/utils";
import DetailBottomBar from "./childComps/DetailBottomBar";
import BackTop from "../../components/content/backTop/BackTop";
import {mapActions} from "vuex"

export default {
  name: "Detail",
  components: {
    GoodsList,
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailBottomBar,
    Scroll,
    BackTop
  },
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop: {},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommends: [],
      themeTopYs: [],
      getThemeTopY: null,
      currentIndex: 0,
      isShowBackTop: false,
    }
  },
  created() {
    //1.得到id
    this.iid = this.$route.params.iid
    //2.请求数据
    getDetail(this.iid).then(res => {
      //console.log("ress"+res)
      const data = res.result
      this.topImages = data.itemInfo.topImages

      this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

      this.shop = new Shop(data.shopInfo)

      this.detailInfo = data.detailInfo;

      this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

      if(data.rate.cRate !== 0){
        this.commentInfo = data.rate.list[0]
      }
    })
    //3.请求推荐数据
    getRecommend().then(res => {

      this.recommends = res.data.list
    })
    //4给getThemeTopY赋值,防抖
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = []
      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop);
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop);
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop);

      console.log(this.themeTopYs);
    },100)
  },
  methods: {
    ...mapActions(['addCart']),
    imageLoad() {
      this.$refs.scroll.refresh()
      this.getThemeTopY()
    },
  titleClick(index){
    this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],200)
  },
  contentScroll(position){
    // 1.判断BackTop是否显示
    this.isShowBackTop = (-position.y) > 1000

    const positoinY = -position.y
    let length = this.themeTopYs.length
    for (let i = 0; i < length; i++){
      if(this.currentIndex !==i && ((i < length - 1 && positoinY >= this.
        themeTopYs[i] && positoinY < this.themeTopYs[i+1]) || (i === length -1 && positoinY
        >= this.themeTopYs[i]))){
        this.currentIndex = i
        this.$refs.nav.currentIndex = this.currentIndex
      }
    }
  },
    backClick() {
      this.$refs.scroll.scrollTo(0, 0)
    },
    addToCart(){
      //console.log('----');
      //1.获取购物车需要展示的商品信息
      const product = {}
      product.image = this.topImages[0];
      product.title = this.goods.title;
      product.desc = this.goods.desc;
      product.price = this.goods.realPrice;
      product.iid = this.iid;

      //2.将商品添加到购物车
      //this.$store.cartList.push(product)
      //this.$store.commit('addCart',product)
      this.addCart(product).then(res => {
        // this.show = true;
        // this.message = res;
        // setTimeout(() => {
        //   this.show = false;
        // },1500)
        //this.$toast.show(res, 2000)
        //console.log(this.$toast);
      })
      // this.$store.dispatch('addCart',product).then(res => {
      //   console.log(res);
      // })

      //成功添加到购物车
    },
  }
}
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }
  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }
  .content {
    height: calc(100% - 44px - 49px);
  }
</style>
