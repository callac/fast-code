<template>
  <div v-if="canEdit" class="file-input">
    <div v-if="uploading" class="mask">
      <loading size=".3rem" color="#fff"/>
    </div>
    <label class="label" :for="id">
      <template v-if="!myValue">
        <img class="icon" :src="require('assets/icon-upload.png')" alt="">
        <span>{{$t('img.upload')}}</span>
      </template>
      <template v-else="">
        <img-tag class="img" :src="myValue" alt="" @click="$emit('imgClick',myValue)"/>
        <img class="edit" :src="require('assets/icon-edit.png')" alt="">
      </template>
      <file-input :id="id" @input="input"/>
    </label>
  </div>
  <div v-else class="file-input">
    <img-tag class="img " :src="myValue" @click="$emit('imgClick',myValue)"/>
  </div>
</template>

<script>
// 图片上传&预览组件
export default {
  name: 'MyFileInput',
  beforeMount() {
    this.myValue = this.value
  },
  props: {
    id: [String, Number],
    value: [String, File, FileList],
    canEdit: {
      default: true,
      type: Boolean,
    },
    uploading: Boolean,
  },
  data() {
    return {
      myValue: null,
    }
  },
  watch: {
    value(val) {
      this.myValue = val
    },
  },
  methods: {
    input(val) {
      if (val.length > 0) {
        this.myValue = val
        this.$emit('input', val)
      }
    },
  },
}
</script>
