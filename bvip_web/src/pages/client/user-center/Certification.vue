<template>
  <page-container class="user-content certification" :title="$t('user.certification')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <loading v-if="step===0" class="step-loading" size=".3rem" color="#fff"/>
    <template v-else>
      <div v-if="step!==2||(step===2&&type===Status.certificateTypes.fast&&!qrcode)" class="step-1">
        <my-input v-for="(item,i) in showItems" type="1" :key="i" :item="item"
                  :labelStyle="extraCss.label"
                  v-model="item.value"/>
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
      <div v-if="tip&&!qrcode" class="tip" :class="className"
           :style="extraCss.margin">* {{tip}}
      </div>
      <button v-if="step===4" class="submit btn-green-fill"
              :style="extraCss.margin" @click="step=1">{{$t('authorize.again')}}
      </button>
    </template>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import CertificateFast from 'components/client/user-center/CertificateFast'
import CertificateManual from 'components/client/user-center/CertificateManual'
import TabHead from 'components/client/user-center/TabHead'
import Status from 'data/immutable-data/Status'
import { dataDeal } from 'utils/DataDeal'
import { QrCode, strTrimAll } from 'utils/Utils'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Certification',
  beforeMount() {
    this.getCertificateInfo().catch(this.snackBar.error)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
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
    className() {
      if (this.certificateInfo.status === Status.authorizeStatus[3].value) {
        return 'font-red'
      }
      return 'font-green'
    },
    tab() {
      const statusName = () => {
        if (!this.certificateInfo.statusName) return ''
        if (this.step === 1 && this.certificateInfo.status !== Status.authorizeStatus[0].value) {
          return this.$t('authorize.again')
        }
        return this.$t(this.certificateInfo.statusName)
      }
      return {
        value: '',
        options: [
          {
            name: `${this.$t('user.certification')}&nbsp;-
                  <span class="${this.className}" style="font-size: .12rem">&nbsp;${statusName()}&nbsp;</span>
                  <span class="p" style="font-size:.12rem;color:inherit;opacity:.8">(${this.$t('certification.no-edit')})</span>`,
            value: '',
            needTran: false,
          },
        ],
      }
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
    extraCss() {
      if (this.step !== 1 && this.type !== Status.certificateTypes.fast) {
        return {
          label: { width: '1.6rem' },
          margin: { marginLeft: '1.6rem' },
        }
      }
      return {}
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
  components: { TabHead, MyInput, CertificateFast, CertificateManual },
}
</script>
