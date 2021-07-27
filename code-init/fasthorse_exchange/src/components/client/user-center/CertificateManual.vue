<template>
  <div v-if="!isShow" class="certificate-manual">
    <p class="warn font-red">* {{$t('certificate.further.tip')}}</p>
    <template v-for="(item, i) in picItems">
      <h2 :key="'h2-'+i">{{i+1}}.{{item.title}}</h2>
      <p class="tip" v-html="item.tip" :key="'p-'+i"></p>
      <div class="input-content" :key="'div-'+i">
        <div class="input">
          <h3>{{item.name}}:</h3>
          <my-file-input v-if="item" :value="item.value" :id="item.alias"
                         :uploading="uploading[item.type]"
                         @input="uploadImg(item.type, $event)"/>
        </div>
        <div class="example">
          <h3>{{$t('certificate.example')}}:</h3>
          <div v-if="i===1&&!isAustralia" class="img-wrap">
            <img class="img" :src="item.example" alt="">
            <div class="mask" :style="maskStyle" ref="mask">{{siteInfo.name}}</div>
          </div>
          <img v-else class="img" :src="item.example" alt="">
        </div>
      </div>
    </template>
    <button class="submit btn-gray-fill" @click="$emit('toPrev')">&lt; {{$t('pre')}}</button>
    <button class="submit btn-green-fill" @click="submit">{{$t('submit')}}</button>
  </div>
  <div v-else class="certificate-manual">
    <div class="input-content-column">
      <template v-for="(item, i) in picItems">
        <div v-if="item&&item.value" class="input" :key="i">
          <h3>{{item.name}}:</h3>
          <my-file-input :value="item.value" :id="item.alias" :canEdit="false"
                         @input="fullImg(i)"/>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
/* eslint-disable import/no-dynamic-require */
import MyFileInput from 'components/form/MyFileInput'
import Status from 'data/immutable-data/Status'
import AliOss from 'utils/AliOss'
import { mapActions, mapState } from 'vuex'

// 手动认证
export default {
  name: 'CertificateManual',
  components: { MyFileInput },
  data() {
    return {
      example: {
        front: require('assets/client/user-center/certificate-front.jpg'),
        frontAustralia: require('assets/client/user-center/certificate-front-australia.jpg'),
        inhand: require('assets/client/user-center/certificate-inhand.jpg'),
        inhandAustralia: require('assets/client/user-center/certificate-inhand-Australia.jpg'),
        extraAustralia: require('assets/client/user-center/certificate-extra-australia.jpg'),
      },
      Status: Status.authorizeStatus,
      uploading: {},
      uploaded: {},
      maskStyle: { display: 'block', transform: 'translate(-50%, -50%)' },
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
      certificateInfo: 'certificateInfo',
    }),
    ...mapState(['siteInfo']),
    id() {
      return this.certificateInfo.ID
    },
    isAustralia() {
      return this.certificateInfo.country_id === 13
    },
    status() {
      return this.certificateInfo.status
    },
    isShow() {
      return this.status !== Status.authorizeStatus[1].value
    },
    tipParams() {
      return {
        1: `<span class="font-red">${this.$t('certificate.front')}</span>`,
        2: `<span class="font-red">${this.$t('certificate.inhand.statement')}</span>`,
        3: `<span class="font-red">${this.$t('date.now')}</span>`,
        uid: `<span class="font-red">${this.$t('user.id')}</span>`,
        domain: `<span class="font-red">${this.siteInfo.name || this.$t('site.name')}</span>`,
      }
    },
    texts() {
      if (this.isAustralia) {
        return {
          frontTitle: this.$t('certificate.auth'),
          frontName: this.$t('certificate.front.Australia'),
          frontTip: this.$t('certificate.auth.tip.Australia'),
          inhandTitle: this.$t('certificate.inhand.auth.Australia'),
          inhandTip: this.$t('certificate.inhand.tip.Australia'),
          inhandName: this.$t('certificate.inhand.pic.Australia'),
          extraTitle: this.$t('certificate.extra.auth.Australia'),
          extraName: this.$t('certificate.extra.pic.Australia'),
          extraTip: this.$t('certificate.extra.tip.Australia'),
        }
      }
      return {
        frontTitle: this.$t('certificate.auth'),
        frontName: this.$t('certificate.front'),
        frontTip: this.$t('certificate.auth.tip'),
        inhandTitle: this.$t('certificate.inhand.auth'),
        inhandTip: this.$t('certificate.inhand.tip', this.tipParams),
        inhandName: this.$t('certificate.inhand.pic'),
      }
    },
    picItems() {
      const {
        frontTitle,
        frontName,
        frontTip,
        inhandTitle,
        inhandTip,
        inhandName,
        extraName,
        extraTitle,
        extraTip,
      } = this.texts
      const items = [
        {
          name: frontName,
          title: frontTitle,
          tip: frontTip,
          alias: 'idCard_front',
          type: Status.certificateImgTypes.front,
          value: '',
          example: this.isAustralia ? this.example.frontAustralia : this.example.front,
        },
        {
          name: inhandName,
          title: inhandTitle,
          tip: inhandTip,
          alias: 'idCard_inhand',
          type: Status.certificateImgTypes.inhand,
          value: '',
          example: this.isAustralia ? this.example.inhandAustralia : this.example.inhand,
        },
      ]
      const extra = {
        name: extraName,
        title: extraTitle,
        tip: extraTip,
        alias: 'idCard_extra',
        type: Status.certificateImgTypes.extraAustralia,
        value: '',
        example: this.example.extraAustralia,
      }
      return (this.isAustralia ? [...items, extra] : items).map(it => ({
        ...it,
        value: this.certificateInfo.images
        && (this.certificateInfo.images.find(img => img.type === it.type) || {}).value,
      }))
    },
  },
  watch: {
    'siteInfo.name': {
      handler(val) {
        this.$nextTick(() => {
          if (val) {
            const scale = 7 / Math.max(this.siteInfo.name.length, 7)
            this.maskStyle = {
              display: 'block',
              transform: `translate(-50%, -50%) scale(${scale}, ${scale})`,
            }
          }
        })
      },
      immediate: true,
    },
    'picItems': {
      handler(val) {
        val.forEach((it) => {
          if (it.value) {
            this.uploaded[it.type] = true
          }
        })
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', ['getUserInfo', 'getOssConfig', 'uploadCertificateImg', 'getCertificateInfo', 'certificateSubmitAll']),
    uploadImg(img_type, files) {
      this.uploading[img_type] = true
      AliOss
        .ossUpload(files[0])
        .then(res => this.updateImg(img_type, res.name))
        .then(() => {
          this.uploaded[img_type] = true
        })
        .catch(this.snackBar.error)
        .then(() => {
          this.uploading[img_type] = false
        })
    },
    updateImg(img_type, file) {
      this.uploadCertificateImg({ id: this.id, file, img_type })
        .then(() => this.snackBar.info(this.$t('img.upload.success')))
        .catch(this.snackBar.error)
    },
    submit() {
      const uploadedAll = !this.picItems.some(({ name, type }) => {
        if (!this.uploaded[type]) {
          this.snackBar.error(this.$t('certificate.upload.tip', { type: this.$t(name) }))
          return true
        }
        return false
      })
      if (uploadedAll) {
        this.certificateSubmitAll(this.id)
          .then(() => this.snackBar.info(this.$t('submitted')))
          .then(() => this.getCertificateInfo())
          .catch(this.snackBar.error)
      }
    },
    fullImg(index) {
      this.imgFullScreen.open({ imgs: this.picItems, index })
    },
  },
  beforeMount() {
    if (!this.isShow) this.getOssConfig().catch(this.snackBar.error)
  },
}
</script>
