<template>
  <input v-if="needCapture" type="file" accept='image/*' capture="camera" :id="id"
         @change="$emit('input',$event.target.files)" hidden
         multiple/>
  <input v-else="" type="file" accept='image/jpeg,image/gif,image/png' :id="id"
         @change="$emit('input',$event.target.files)" :multiple="multiple"
         hidden/>
</template>

<script>
import { isAndroid, isWeiXin } from 'utils/UserAgent'

// 图片上传表单项
export default {
  name: 'FileInput',
  props: {
    id: [String, Number],
    multiple: Boolean,
  },
  data() {
    const needCapture = isWeiXin() && isAndroid()
    return {
      needCapture, // 是否需要 capture 属性，兼容某些版本的安卓微信
    }
  },
}
</script>
