<template>
  <div class="pdf-page-wrap">
    <div class="btn-group">
      <span class="page">{{page}}/{{totalPage}}</span>
      <button @click="toPrev()">上一页</button>
      <button @click="toNext()">下一页</button>
    </div>
    <pdf class="pdf"
         :src="pdfSrc"
         :page="page"
         @loaded="$emit('loaded')"
         @page-loaded="$emit('page-loaded')"
         @num-pages="totalPage=$event"
         @error="snackBar.error($event)"/>
  </div>
</template>

<script>
import { blobToBase64 } from 'base64-blob'
import pdf from 'vue-pdf'

export default {
  name: 'PDFPage',
  beforeMount() {
    this.convertSrc(this.src)
  },
  props: {
    src: {
      validator(val) {
        return !val || typeof val === 'string' || val instanceof Object || val instanceof FileList
      },
    },
    page: Number,
  },
  data() {
    return {
      numPages: null,
      pdfSrc: '',
      totalPage: 0,
    }
  },
  computed: {},
  watch: {
    src(val) {
      this.convertSrc(val)
    },
  },
  methods: {
    convertSrc(val) {
      const src = val
      if (src instanceof FileList) {
        if (src[0]) {
          blobToBase64(src[0]).then(url => this.setImg(url))
        } else {
          this.pdfSrc = ''
        }
      } else {
        this.pdfSrc = src
      }
    },
    toPrev() {
      let page = this.page - 1
      if (page < 1) page = 1
      this.$emit('toPage', page)
    },
    toNext() {
      let page = this.page + 1
      if (page > this.totalPage) page = this.totalPage
      this.$emit('toPage', page)
    },
    setImg(blobUrl) {
      this.pdfSrc = blobUrl.url
    },
  },
  components: { pdf },
}
</script>
