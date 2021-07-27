<template>
  <div class="img-upload">
    <label class="iconfont icon-add" :for="id">
      <span v-if="tip" class="tip" v-html="tip"></span>
      <file-input :id="id" :multiple="true" @input="input"/>
    </label>
    <div v-for="(img, i) in myFiles" class="img" :key="i">
      <img-tag :src="img" @click="show(i)"/>
      <span class="name transition">{{img.name}}</span>
    </div>
  </div>
</template>

<script>
// 图片上传&预览组件
export default {
  name: 'ImgUpload',
  props: {
    id: [Number, String],
    imgStyle: Object,
    tip: String,
  },
  data() {
    return {
      myFiles: [],
    }
  },
  methods: {
    input(files) {
      this.myFiles.push(...Array.prototype.filter
        .call(files, f => !this.myFiles.some(f1 => f1.name === f.name && f1.size === f.size)))
      this.$emit('input', this.myFiles)
    },
    show(index) {
      this.imgFullScreen.open({ imgs: this.myFiles.map(f => ({ value: f })), index })
    },
  },
}
</script>
