<template>
  <transition name="fade-enter">
    <router-link class="family-msg" :to="route">
      <h3 class="title">{{msg.title}}
        <!--<time class="time">{{msg.createdAt|datePipe('')}}</time>-->
      </h3>
      <!--<p class="brief">{{msg.resume||msg.brief}}</p>-->
    </router-link>
  </transition>
</template>

<script>
export default {
  name: 'FamiliarList',
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
