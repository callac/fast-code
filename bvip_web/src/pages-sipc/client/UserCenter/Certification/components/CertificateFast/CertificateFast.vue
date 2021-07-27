<template>
  <div class="certificate-fast">
    <span class="tip">{{$t('certification.qrcode')}}</span>
    <img class="img" :src="qrcode" alt="">
    <span class="tip">{{$t('certification.qrcode.tip')}}</span>
    <!--<button class="back btn-green-fill" @click="$emit('toPrev')">{{$t('pre')}}</button>-->
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'CertificateFast',
  props: {
    qrcode: String,
  },
  mounted() {
    this.getResult()
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  data() {
    return {
      timer: null,
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
    }),
  },
  methods: {
    ...mapActions('user', ['getUserInfo']),
    getResult() {
      this.timer = setTimeout(() => {
        this.timer = setInterval(() => {
          this.getUserInfo().then(() => {
            if (this.user.identity_authenticated) {
              this.snackBar.info(this.$t('authorize.success'))
              this.$router.push('/user-center/security')
            }
          }).catch(this.snackBar.error)
        }, 4000)
      }, 20000)
    },
  },
}
</script>
