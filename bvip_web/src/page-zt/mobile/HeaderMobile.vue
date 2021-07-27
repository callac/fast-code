<template>
  <header class="sign-header">
    <div class="website">
      <img :src="require('assets/mobile/site.png')"/>
    </div>
    <div class="description">{{$t('down-ios-terrace')}}</div>
    <div class="tab-content">
      <a @click="$router.replace('/mobile/sign-up?routeType=sign-up')"
                 :class="{acitve:type === 'sign-up'}">{{$t('sign-up')}}</a>
      <a @click="$router.replace('/mobile/sign-up?routeType=sign-in')"
                   :class="{acitve:type === 'sign-in'}">{{$t('sign-in')}}</a>
      <!--<router-link to="/mobile/sign-in?type=sign-in">{{$t('sign-in')}}</router-link>-->
    </div>
  </header>
</template>

<script>
export default {
  name: 'header-mobile',
  data() {
    return {}
  },
  computed: {
    type() {
      return this.$route.query.routeType ? this.$route.query.routeType : 'sign-up'
    },
  },
  methods: {},
}
</script>
