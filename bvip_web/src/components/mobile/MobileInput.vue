<template>
  <div class="mobile-input" :class="{'can-not-edit':!canEdit}">
    <label class="label" v-if="myItem.name"
           :for="myItem.id||myItem.name"
           :style="myItem.labelStyle||labelStyle">{{canEdit||type!=='0'?myItem.name:''}}</label>
    <template v-if="canEdit">
      <input-base v-if="myItem.inputType!=='select'" class="input-base"
                  :class="{error:errorText,'have-icon': myItem.icon}"
                  :style="myItem.inputStyle||inputStyle" :id="myItem.id||myItem.name" :value="value"
                  :config="myItem" @input="$emit('input',$event)" @check="check"/>
      <select-base v-else :id="myItem.id||myItem.name" class="input-base"
                   :class="{error:errorText,'have-icon': myItem.icon}"
                   :value="value" :options="myItem.options" :style="myItem.inputStyle||inputStyle"
                   :scrollbarProps="{isMobile,
                                     maxHeight:(myItem.inputStyle||inputStyle||{}).maxHeight}"
                   @input="$emit('input',$event)" @error="$emit('error', 'MyInput: '+$event)"/>
    </template>
    <div v-else class="input-base" :id="myItem.id||myItem.name"
         :class="{default:!myItem.value,value:myItem.value,'have-icon': myItem.icon}"
         :style="myItem.inputStyle||inputStyle">
      {{myItem.value||myItem.defaultVal}}
    </div>
    <span v-if="myItem.icon" class="iconfont" :class="myItem.icon"></span>
    <!--<span v-if="myItem.prefix" class="prefix" :style="myItem.prefixStyle||prefixStyle">-->
      <!--{{myItem.prefix}}</span>-->
    <span v-if="myItem.unit" :class="{unit:true, 'is-select':myItem.inputType==='select'}"
          :style="myItem.unitStyle||unitStyle">{{myItem.unit}}</span>
    <template v-if="myItem.btnText">
      <btn-code v-if="myItem.btnCodeFn" :class="{btn:true, 'is-select':myItem.inputType==='select'}"
                :getCodeFn="myItem.btnCodeFn" :style="myItem.btnStyle||btnStyle"
                @errorGet="$emit('errorGet',$event)" @error="$emit('error', $event)"/>
      <button v-else @click="$emit('btnClick')"
              :class="{btn:true, 'is-select':myItem.inputType==='select'}"
              :style="myItem.btnStyle||btnStyle">
        {{myItem.btnText}}
      </button>
    </template>
    <img v-if="myItem.imgCode" class="img-code" :style="myItem.imgStyle||imgStyle"
         :src="myItem.imgCode" alt="" @click="$emit('imgClick')">
    <span class="error-text">{{errorText}}</span>
  </div>
</template>

<script>
import BtnCode from 'components/common/BtnCode'

export default {
  name: 'MobileInput',
  props: {
    value: [String, Number],
    item: Object,
    inputStyle: Object,
    labelStyle: Object,
    prefixStyle: Object,
    unitStyle: Object,
    btnStyle: Object,
    imgStyle: Object,
  },
  data() {
    return {
      errorText: '',
    }
  },
  computed: {
    canEdit() {
      return this.item.canEdit !== false
    },
    myItem() {
      if (!this.item) return {}
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
      }
    },
  },
  methods: {
    check(val) {
      if (!val.valid) {
        this.errorText = this.myItem.errorText
      } else {
        this.errorText = ''
      }
      this.$emit('check', val)
    },
  },
  components: { BtnCode },
}
</script>
