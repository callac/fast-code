<template>
  <transition name="fade-enter">
    <router-link class="msg-pin" :to="route">
      <h3 class="title">
        <p class="title-text" :style="{width: noTime ? '80%' : '100%'}">{{msg.title}}</p>
        <time class="time" v-if="noTime">{{msg.createdAt|datePipe('')}}</time>
      </h3>
      <!--<p class="brief">{{msg.resume||msg.brief}}</p>-->
    </router-link>
  </transition>
</template>

<script>
export default {
  name: 'MsgPin',
  props: {
    msg: Object,
    route: String,
    noTime: {
      default: true,
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
