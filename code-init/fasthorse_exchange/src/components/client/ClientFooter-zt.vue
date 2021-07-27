<template>
  <footer v-if="show" class="content client-footer">
    <div class="columns">
      <template v-for="(column, i) in [aboutUs, help, contact, follow]">
        <section v-if="column.items&&column.items.length>0"
                 :key="i" class="section" :class="{last: i===3}">
          <h2>{{$t(column.name)}}</h2>
          <div class="items">
            <template v-for="(item, j) in column.items">
              <router-link v-if="item.route" class="link" :key="j" :to="item.route">
                {{item.needTran===false?item.name:$t(item.name)}}
              </router-link>
              <a v-else-if="item.href" :key="j" :href="item.href" target="_blank" class="link">
                {{item.needTran===false?item.name:$t(item.name)}}
              </a>
              <a v-else-if="item.image" :key="j" :href="item.url||'javascript:void 0'"
                 target="_blank"
                 class="icon">
                <img class="icon-img" :src="item.image"/>
                <div v-if="item.qrcode" class="qrcode">
                  <img :src="item.qrcode" alt="">
                </div>
              </a>
              <div v-else-if="item.value" :key="j" class="item">
                {{item.needTran===false?item.name:$t(item.name)}}: {{item.value}}
              </div>
            </template>
          </div>
        </section>
      </template>
    </div>
    <section class="section friendly-links">
      <template v-if="friendlyLinks.items&&friendlyLinks.items.length>0">
        <h2>{{$t(friendlyLinks.name)}}</h2>
        <div class="items">
          <a class="link" target="_blank" v-for="(item,i) in friendlyLinks.items" :key="i"
             :href="item.href" rel="nofollow">
            {{item.name}}<span class="separate" v-if="i<friendlyLinks.items.length-1">|</span>
          </a>
        </div>
      </template>
    </section>
  </footer>
</template>
<script>
import Status from 'data/immutable-data/Status'
import { orderBy } from 'utils/Sort'
import { mapActions, mapState } from 'vuex'
// 底部栏页尾组件
export default {
  name: 'ClientFooter',
  data() {
    return {}
  },
  computed: {
    ...mapState(['siteInfo', 'footers']),
    aboutUs() {
      const aboutUs = this.footers[Status.footerItems[1].alias]
      return {
        name: 'about-us',
        items: orderBy([
          ...(aboutUs.some(f => f.label_name === '关于我们')
            ? [] : [{ name: 'about-us', route: '/about-us', order: 1 }]),
          { name: 'about-us.privacy-policy', route: '/privacy-policy', order: 2 },
          { name: 'about-us.login-agreement', route: '/user-agreement', order: 3 },
          // { name: 'repair-order.submit', route: '/repair-order' },
          ...aboutUs.map(f => ({
            name: f.label_name,
            href: f.api_url,
            needTran: false,
            order: +f.order,
          })),
        ], 'order'),
      }
    },
    qq() {
      const { qq } = this.siteInfo
      return qq ? qq.split(',') : []
    },
    contact() {
      return {
        name: 'contact-us',
        items: [
          ...(this.siteInfo.service_email
            ? [{ name: 'contact-us.email', value: this.siteInfo.service_email }] : []),
          ...this.qq.map((q, i) => ({
            name: `${this.$t('qq.group')} ${i + 1}`,
            value: q,
            needTran: false,
          })),
        ],
      }
    },
    help() {
      return {
        name: Status.footerItems[2].name,
        items: this.footers[Status.footerItems[2].alias].map(item => ({
          ...item,
          name: item.label_name || item.name,
          ...(item.api_url ? { href: item.api_url } : { route: `/help?classId=${item.id}` }),
          needTran: false,
        })),
      }
    },
    follow() {
      return {
        name: Status.footerItems[3].name,
        items: this.footers[Status.footerItems[3].alias].map(item => ({
          ...item,
          image: item.image || item.icon,
          url: item.api_url || item.url,
          qrcode: item.qrcode,
          needTran: false,
        })),
      }
    },
    friendlyLinks() {
      return {
        name: Status.footerItems[4].name,
        items: this.footers[Status.footerItems[4].alias].map(item => ({
          ...item,
          name: item.label_name,
          href: item.api_url,
          needTran: false,
        })),
      }
    },
    show() {
      return !['/sign-in', '/sign-up', '/password/reset', '/exchange'].includes(this.$route.path)
    },
  },
  methods: {
    ...mapActions(['getFooters']),
  },
  beforeMount() {
    this.getFooters().catch(this.snackBar.error)
  },
}
</script>
