<template>
  <page-container class="container-inner content repair-order" :title="title">
    <tab-head :value="''" :options="[{name:title, value:'', needTran: false}]"/>
    <div class="forms">
      <template v-for="(item, i) in items">
        <my-input v-model="item.value" type="1" :item="item" :key="i"
                  @imgClick="getImgCode"/>
      </template>
      <div class="wrap">
        <btn-once class="btn btn-green-fill" :clickFn="submit">{{$t('submit')}}</btn-once>
      </div>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import TabHead from 'components/client/user-center/TabHead'
import { validateVerifyCode } from 'utils/FormValidate'
import { mapActions } from 'vuex'

const options = [
  { name: 'question.type.choose', value: '', needTran: true },
  { name: '登录注册相关', value: '登录注册相关' },
  { name: '账户认证相关', value: '账户认证相关' },
  { name: '币币交易相关', value: '币币交易相关' },
  { name: 'C2C交易相关', value: 'C2C交易相关' },
  { name: '费用标准', value: '费用标准' },
  { name: '充值提现', value: '充值提现' },
  { name: '其他', value: '其他' },
]
export default {
  name: 'RepairOrder',
  beforeMount() {
    this.getImgCode()
  },
  data() {
    return {
      items: [
        { name: 'email', value: '', alias: 'email' },
        { name: 'question.type', value: '', alias: 'type', inputType: 'select', options },
        {
          name: 'question.desc',
          value: '',
          alias: 'desc',
          inputType: 'textarea',
          placeholder: 'question.desc.tip',
          maxLength: 500,
          inputStyle: { height: '1.8rem' },
        },
        {
          name: 'img.upload',
          value: '',
          alias: 'desc',
          inputType: 'img',
          placeholder: 'question.img.upload.tip',
          required: false,
        },
        {
          name: 'verify.code.img',
          value: '',
          alias: 'img_code',
          imgCode: '',
          validator: validateVerifyCode,
        },
      ],
      imgCodeId: '',
    }
  },
  computed: {
    title() {
      return this.$t('repair-order.submit')
    },
  },
  methods: {
    ...mapActions('user', ['getCodeImg']),
    getImgCode() {
      return this.getCodeImg().then(({ id, url }) => {
        this.items.find(item => item.alias === 'img_code').imgCode = url
        this.imgCodeId = id
      })
    },
    submit() {
      return this.validate(this.items)
    },
  },
  components: { MyInput, TabHead },
}
</script>
