<template>
  <div :class="[nav.value === 1 ? 'nav-head-1': (nav.value === 2 ? 'nav-head-2' : 'nav-head-3')]">
    <template v-if="nav.value === 1">
      <ul>
        <li v-for="(item, idx) in nav.options" :key="idx">
          <span v-if="idx>0">＞</span>
          <router-link v-if="item.url !== ''" :to="item.url">
            {{item.name}}
          </router-link>
          <span v-else>{{item.name}}</span>
        </li>
      </ul>
    </template>
    <template v-if="nav.value === 2">
      <ul>
        <li v-for="(item, idx) in nav.options" :key="idx">
          <span :class="[idx === 0 ? 'visible-none' : '']" class="iconfont icon-right"></span>
          <p :class="[nav.selected > idx ? 'selected' : '']">{{item.name}}</p>
        </li>
      </ul>
    </template>
    <template v-if="nav.value === 3">
      <ul>
        <li v-for="(item, idx) in nav.options" :key="idx">
          <span v-if="idx>0">＞</span>
          <router-link v-if="item.url !== ''" :to="item.url">
            {{item.name}}
          </router-link>
          <span v-else>{{item.name}}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
export default {
  name: 'NavHead',
  props: {
    nav: Object,
  },
}
</script>

<style scoped>

</style>
