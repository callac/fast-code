<template>
  <transition name="fade-enter">
    <router-link class="msg-pin" :to="route">
      <h3 class="title">{{msg.title}}
        <time class="time">{{msg.createdAt|datePipe('')}}</time>
      </h3>
      <p class="brief">{{msg.resume||msg.brief}}</p>
    </router-link>
  </transition>
</template>

<script>
// 文章、消息列表单元组件
export default {
  name: 'MsgPin',
  props: {
    msg: Object,
    route: String,
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
