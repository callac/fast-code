<template>
  <a :href="fileSrc" download="" target="download">
    <!--download, target属性必需-->
    {{showName ? filename : ''}}
    <slot/>
  </a>
</template>

<script>
import { blobToBase64 } from 'base64-blob'

export default {
  name: 'Download',
  beforeMount() {
    this.convert(this.src)
  },
  props: {
    showName: Boolean,
    src: {
      validator(val) {
        return !val || typeof val === 'string' || val instanceof FileList
      },
    },
  },
  data() {
    return {
      fileSrc: '',
      filename: '',
    }
  },
  watch: {
    src(val) {
      this.convert(val)
    },
  },
  methods: {
    convert(val) {
      this.fileSrc = ''
      if (!val || typeof val === 'string') {
        this.fileSrc = val
      } else if (val instanceof FileList && val[0]) {
        this.filename = val[0].name
        blobToBase64(val[0]).then((blobUrl) => {
          this.fileSrc = blobUrl
        })
      }
    },
  },
}
</script>
