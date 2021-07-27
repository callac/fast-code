<template>
  <page-container class="user-content message" :title="$t('message.details')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <h1 class="h1">{{data.title}}</h1>
    <time class="time">{{data.createdAt|datePipe('')}}</time>
    <p v-for="(p, i) in paragraphs" class="p" :key="i">{{p}}</p>
  </page-container>
</template>

<script>
import TabHead from 'components/client/user-center/TabHead'

export default {
  name: 'Message',
  beforeMount() {
    this.getData()
  },
  data() {
    return {
      tab: {
        value: '',
        options: [
          { name: 'message.center', value: '' },
        ],
      },
      data: {},
    }
  },
  computed: {
    paragraphs() {
      return this.data && this.data.content && this.data.content.split(/\s/)
    },
  },
  methods: {
    getData() {
      return Promise.resolve({
        id: 1,
        title: '数字碳交易所上线通知',
        brief: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容',
        content: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容,消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容\n消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容,消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容\n消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容,消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容\n消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容,消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容\n',
        createdAt: '2017-04-28 15:09:47',
      }).then((res) => {
        this.data = res
      }).catch(this.snackBar.error)
    },
  },
  components: { TabHead },
}
</script>
