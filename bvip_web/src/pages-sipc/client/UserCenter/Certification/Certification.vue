<template>
  <page-container class="sipc-content certification" :title="title">
    <h1 class="content page-head">{{title}}</h1>
    <div class="content-wrap-1">
      <div class="tab-wrap">
        <div class="tab selected">{{title}}</div>
      </div>
      <p class="tab-tip"> -
        <span :class="className" style="font-size: .12rem">{{statusName}}</span>
        <span class="p">{{$t('certification.no-edit')}}</span>
      </p>
      <loading v-if="step===0" class="step-loading" size=".3rem" color="#fff"/>
      <div v-else class="step-wrap">
        <div v-if="step!==2||(step===2&&type===Status.certificateTypes.fast&&!qrcode)"
             class="step-1">
          <my-input
            v-for="(item,i) in showItems"
            v-model="item.value"
            type="1"
            :key="i"
            :item="item"
          />
          <btn-once v-if="step===1" class="submit btn-green-fill"
                    :clickFn="next" :useLoading="true">{{$t('next')}}
          </btn-once>
        </div>
        <template v-if="step!==1">
          <template v-if="type===Status.certificateTypes.fast">
            <certificate-fast v-if="qrcode" :qrcode="qrcode" @toPrev="step=1;qrcode=null"/>
          </template>
          <certificate-manual v-else @toPrev="step=1"/>
        </template>
        <div v-if="tip&&!qrcode" class="tip" :class="className">* {{tip}}
        </div>
        <button v-if="step===4" class="submit btn-green-fill" @click="step=1">
          {{$t('authorize.again')}}
        </button>
      </div>
    </div>
  </page-container>
</template>

<script>
import CertificateFast from '@/pages-sipc/client/UserCenter/Certification/components/CertificateFast/CertificateFast'
import CertificateManual from '@/pages-sipc/client/UserCenter/Certification/components/CertificateManual/CertificateManual'
import MyInput from 'components/client/MyInput'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { QrCode, strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Certification',
  components: { MyInput, CertificateFast, CertificateManual },
  data() {
    return {
      step: 0,
      qrcode: null,
      timer: null,
      Status,
      items: [
        {
          name: 'nation',
          alias: 'country_id',
          inputType: 'select',
          value: '',
          options: [],
        },
        {
          name: 'name',
          alias: 'name',
          value: '',
          placeholder: 'name',
          preFormatter: val => val.trim(),
        },
        {
          name: 'name.family',
          alias: 'first_name',
          value: '',
          placeholder: 'name.family',
          preFormatter: val => val.trim(),
        },
        {
          name: 'name.first',
          alias: 'last_name',
          value: '',
          placeholder: 'name.first',
          preFormatter: val => val.trim(),
        },
        {
          name: 'idCard',
          alias: 'number',
          value: '',
          placeholder: 'idCard',
          preFormatter: strTrimAll,
        },
      ],
      showItems: [],
    }
  },
  computed: {
    ...mapState('user', {
      user: state => state.info,
      certificateInfo: 'certificateInfo',
      originCountries: 'countries',
    }),
    type() {
      return this.certificateInfo.method
    },
    countries() {
      return this.originCountries && this.originCountries.map(item => ({
        ...item,
        name: this.$i18n.locale.includes('zh-hans') ? item.name_cn : item.name_en,
        value: item.ID,
      }))
    },
    title() {
      return this.$t('user.certification')
    },
    className() {
      if (this.certificateInfo.status === Status.authorizeStatus[3].value) {
        return 'font-red'
      }
      return 'font-green'
    },
    statusName() {
      if (!this.certificateInfo.statusName) return ''
      if (this.step === 1 && this.certificateInfo.status !== Status.authorizeStatus[0].value) {
        return this.$t('authorize.again')
      }
      return this.$t(this.certificateInfo.statusName)
    },
    tip() {
      if (this.step === 2) {
        return this.type === Status.certificateTypes.fast ? this.$t('check.wait') : ''
      }
      if (this.step === 5) {
        return this.$t('checking')
      }
      if (this.step === 3) {
        return this.$t('authorized')
      }
      if (this.step === 4) {
        return `${this.$t('checked.not-passed')}:${this.certificateInfo.remark}`
      }
      return ''
    },
  },
  watch: {
    step: {
      handler(val) {
        if (val !== 2 && this.countries.length < 1) {
          this.getCountries().catch(this.snackBar.error)
        }
        if (val !== 2 || (val === 2 && this.type === Status.certificateTypes.fast)) {
          this.showItems = val !== 1
            ? this.items
              .map(item => ({ ...item, value: this.setVal(item.alias), canEdit: false }))
              .filter(item => item.alias === 'country_id'
                || (item.value && item.alias !== 'name')
                || (item.alias === 'name' && !this.certificateInfo.first_name))
            : this.items
              .filter(item => item.alias !== 'name')
              .map(item => ({ ...item, value: this.setVal(item.alias, false) }))
          if (this.showItems[0]) this.$set(this.showItems[0], 'options', this.countries)
        }
      },
      immediate: true,
    },
    certificateInfo: {
      handler(val) {
        if (!val) this.step = 0
        this.step = (+val.status || 0) + 1
      },
      immediate: true,
    },
    countries: {
      handler(val) {
        if (val.length > 0 && this.showItems[0]) {
          this.$set(this.showItems, '0', {
            ...this.items[0],
            value: this.setVal('country_id', this.step !== 1),
            options: val,
            canEdit: this.step === 1,
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    ...mapActions('user', ['getCertificationUrl', 'updateCertificateInfo', 'getCertificateInfo', 'getCountries']),
    next() {
      return this.validate(this.showItems)
        .then(() => (this.certificateInfo.status === Status.authorizeStatus[0].value
        || this.certificateInfo.status === Status.authorizeStatus[3].value
          ? this.getCertificationUrl(dataDeal(this.showItems))
          : this.updateCertificateInfo({
            id: this.certificateInfo.ID,
            ...dataDeal(this.showItems),
          })))
        .then(res => this.getCertificateInfo()
          .then(() => this.certificateInfo.method === Status.certificateTypes.fast
            && QrCode(res.url).then((url) => {
              this.qrcode = url
            })))
        .catch(this.snackBar.error)
    },
    setVal(alias, needTran = true) {
      if (alias === 'country_id' && needTran) {
        return (this.countries.find(c => c.value === this.certificateInfo.country_id)
          || this.countries[0] || {}).name
      }
      return this.certificateInfo[alias]
    },
  },
  beforeMount() {
    this.getCertificateInfo().catch(this.snackBar.error)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
}
</script>
