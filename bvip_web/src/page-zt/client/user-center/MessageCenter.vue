<template>
  <page-container class="user-content message-center" :title="$t('message.center')">
    <tab-head v-model="tab.value" :options="tab.options"/>
    <msg-pin v-for="(m, i) in data" :key="i" :route="$route.path+'/'+m.id" :msg="m"/>
  </page-container>
</template>

<script>
import MsgPin from 'components/client/MsgPin'
import TabHead from 'components/client/user-center/TabHead'

export default {
  name: 'MessageCenter',
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
      data: null,
    }
  },
  methods: {
    getData() {
      return Promise.resolve([
        {
          id: 1,
          title: '数字碳交易所上线通知',
          brief: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容',
          createdAt: '2017-04-28 15:09:47',
        },
        {
          id: 2,
          title: '数字碳交易所上线通知',
          brief: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容',
          createdAt: '2017-04-28 15:09:47',
        },
        {
          id: 3,
          title: '数字碳交易所上线通知',
          brief: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容',
          createdAt: '2017-04-28 15:09:47',
        },
        {
          id: 4,
          title: '数字碳交易所上线通知',
          brief: '消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容消息内容',
          createdAt: '2017-04-28 15:09:47',
        },
      ]).then((res) => {
        this.data = res
      }).catch(this.snackBar.error)
    },
  },
  components: { TabHead, MsgPin },
}
</script>
