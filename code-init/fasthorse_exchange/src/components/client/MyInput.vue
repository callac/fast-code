<template>
  <div class="my-input"
       :class="{'type-0':type==='0','type-1':type!=='0','can-not-edit':!canEdit, [theme]:true}">
    <label class="label"
           :for="myItem.id||myItem.name"
           :style="myItem.labelStyle||labelStyle">{{canEdit||type!=='0'?myItem.name:''}}</label>
    <template v-if="canEdit">
      <select-base v-if="myItem.inputType==='select'"
                   class="input-base"
                   :id="myItem.id||myItem.name"
                   :name="myItem.id||myItem.name"
                   :class="{error:errorText}"
                   :init="init"
                   :value="value"
                   :options="myItem.options"
                   :style="myItem.inputStyle||inputStyle"
                   :placeholder="myItem.name"
                   :scrollbarProps="{isMobile,
                                     maxHeight:(myItem.inputStyle||inputStyle||{}).maxHeight}"
                   @input="$emit('input',$event)" @error="$emit('error', 'MyInput: '+$event)"/>
      <img-upload v-else-if="myItem.inputType==='img'"
                  class="input-base"
                  @input="$emit('input', $event)"
                  @check="check"
                  :id="myItem.id||myItem.name"
                  :style="myItem.inputStyle||inputStyle" :init="init"
                  :tip="myItem.placeholder"/>
      <input-base v-else class="input-base"
                  :class="{error:errorText}"
                  :name="myItem.id||myItem.name"
                  :style="myItem.inputStyle||inputStyle"
                  :id="myItem.id||myItem.name"
                  :value="value"
                  :config="myItem"
                  :init="init"
                  @input="$emit('input', $event)"
                  @keyboardInput="$emit('keyboardInput', $event)"
                  @check="check"
                  @keyup.enter="$emit('keyUpEnter')"
                  @focus="isFocus=true" @blur="isFocus=false"/>
    </template>
    <div v-else class="input-base"
         :id="myItem.id||myItem.name"
         :class="{default:!myItem.value,value:myItem.value}"
         :style="myItem.inputStyle||inputStyle">
      {{value||myItem.value||myItem.defaultVal}}
    </div>
    <span v-if="myItem.prefix"
          class="prefix"
          :style="myItem.prefixStyle||prefixStyle">
      {{myItem.prefix}}</span>
    <span v-if="myItem.unit"
          :class="{unit:true, 'is-select':myItem.inputType==='select'}"
          :style="myItem.unitStyle||unitStyle">{{myItem.unit}}</span>
    <template v-if="myItem.btnText">
      <btn-code v-if="myItem.btnCodeFn"
                :class="{btn:true, 'is-select':myItem.inputType==='select'}"
                :getCodeFn="myItem.btnCodeFn"
                :style="myItem.btnStyle||btnStyle"
                @errorGet="$emit('errorGet',$event)"
                @error="$emit('error', $event)"/>
      <button v-else @click="$emit('btnClick')"
              :class="{btn:true, 'is-select':myItem.inputType==='select'}"
              :style="myItem.btnStyle||btnStyle">
        {{myItem.btnText}}
      </button>
    </template>
    <img v-if="myItem.imgCode"
         class="img-code"
         :style="myItem.imgStyle||imgStyle"
         :src="myItem.imgCode"
         alt=""
         @click="$emit('imgClick')">
    <span class="error-text">{{errorText}}</span>
  </div>
</template>

<script>
import BtnCode from 'components/common/BtnCode'
import ImgUpload from 'components/form/ImgUpload'

/**
 * @desc 自定义封装表单项
 * @props { Object } item
 * format:
 * {
 *  name: String                          表单名
 *  inputType: String                     表单类型
 *  needTran: Boolean                     表单名是否需要使用 $t 函数转换
 *  defaultVal: String|Number|Object      默认值
 *  placeholder: String                   placeholder
 *  options: String                       选择框选项
 *  inputStyle: Object                    表单元素样式, 会覆盖 props.inputStyle
 *  btnText: String                       按钮文字
 *  btnCodeFn: Function                   按钮回调函数
 *  btnStyle: Object                      按钮样式, 会覆盖 props.btnStyle
 *  errorText: String                     校验报错信息
 *  prefix: String                        前置信息
 *  prefixStyle: Object                   前置信息样式, 会覆盖 props.prefixStyle
 *  unit: String                          后置信息
 *  unitStyle: String                     后置信息样式, 会覆盖 props.unitStyle
 *  imgCode: String                       图片
 *  imgStyle: String                      图片样式, 会覆盖 props.imgStyle
 * }
 * */
export default {
  name: 'MyInput',
  props: {
    value: [String, Number, Array],
    item: Object,
    type: {
      default: '0',
      type: String,
    },
    theme: {
      default: 'dark',
      type: String, // ['dark', 'white']
    },
    init: [Boolean, Number],
    labelStyle: Object,
    inputStyle: Object,
    prefixStyle: Object,
    unitStyle: Object,
    btnStyle: Object,
    imgStyle: Object,
  },
  data() {
    return {
      errorText: '',
      isFocus: false,
    }
  },
  computed: {
    canEdit() {
      return this.item.canEdit !== false
    },
    myItem() {
      if (!this.item) return {}
      const obj = {}
      if (this.item.inputType === 'select') {
        obj.options = this.item.options
          .map(o => ({ ...o, name: o.needTran ? this.$t(o.name) : o.name }))
      }
      return {
        ...this.item,
        name: this.item.needTran === false ? this.item.name
          : this.$t(this.item.name),
        defaultVal: this.item.needTran === false ? this.item.defaultVal
          : this.$t(this.item.defaultVal),
        placeholder: this.item.needTran === false ? this.item.placeholder
          : this.$t(this.item.placeholder),
        btnText: this.item.needTran === false ? this.item.btnText
          : this.$t(this.item.btnText),
        errorText: this.item.needTran === false ? this.item.errorText
          : this.$t(this.item.errorText),
        ...obj,
      }
    },
  },
  methods: {
    check(val) {
      // if (this.isFocus === false) {
      //   if (!val.valid && !(this.myItem.requiredInPage === false && !this.myItem.value)) {
      //     this.errorText = this.myItem.value
      //        ? this.myItem.errorText || this.$t('invalid') : this.$t('required')
      //   } else if (!val.pristine
      //     && !val.valid
      //     && !this.myItem.value
      //     && this.myItem.required !== false
      //     && this.myItem.requiredInPage !== false) {
      //     this.errorText = this.$t('required')
      //   } else {
      //     this.errorText = ''
      //   }
      // } else {
      //   this.errorText = ''
      // }
      this.$emit('check', val)
    },
  },
  components: { BtnCode, ImgUpload },
}
</script>
