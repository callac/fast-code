<template>
  <page-container
    class="container-inner user-center"
    :title="$t('user.center')"
  >
    <aside class="aside">
      <nav class="nav">
        <router-link v-for="(r, i) in nav" class="a"
                     :class="{active: $route.path.includes(r.route)}" :key="i" :to="r.route">
          <span class="nav-wrap" :ref="'nav-'+i" :style="$style">
            <span class="iconfont" :class="r.icon"></span>{{$t(r.name)}}
          </span>
        </router-link>
      </nav>
    </aside>
    <div class="user-content-wrap">
      <router-view/>
    </div>
  </page-container>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserCenter',
  data() {
    return {
      maxWidth: 0,
    }
  },
  computed: {
    ...mapGetters(['siteInfo']),
    nav() {
      return [
        {
          name: 'asset.manage',
          icon: 'icon-zichanguanli',
          route: '/user-center/assets-manage',
        },
        {
          name: 'exchange.manage',
          icon: 'icon-jiaoyiguanli',
          route: '/user-center/exchange',
        },
        ...(this.siteInfo.c2cEnabled ? [{
          name: 'exchange.cash',
          icon: 'icon-money',
          route: '/user-center/cash-exchange',
        }] : []),
        {
          name: 'user.security',
          icon: 'icon-anquan',
          route: '/user-center/security',
        },
        {
          name: 'user.invite',
          icon: 'icon-users',
          route: '/user-center/invite',
        },
        // {
        //   name: 'message.center',
        //   icon: 'icon-xiaoxi',
        //   route: '/user-center/message',
        // },
      ]
    },
    $style() {
      return this.maxWidth && { width: `${this.maxWidth}px` }
    },
  },
  mounted() {
    setTimeout(() => {
      this.nav.forEach((r, i) => {
        if (this.$refs[`nav-${i}`]) {
          const el = this.$refs[`nav-${i}`][0]
          this.maxWidth = Math.max(el.offsetWidth, this.maxWidth)
        }
      })
    }, 500)
  },
}
</script>
