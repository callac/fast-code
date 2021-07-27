<template>
  <div v-if="!user.id" class="user-pin login">
    <router-link class="btn transition" :to="'/sign-in?redirectTo='+$route.path">
      {{$t('sign-in')}}
    </router-link>
    <router-link class="btn transition" :to="'/sign-up?redirectTo='+$route.path">
      {{$t('sign-up')}}
    </router-link>
  </div>
  <div v-else class="user-pin user">
    <drop-down
      v-for="(item,i) in myItems"
      class="item"
      arrowPosition="end"
      :popperOptions="{placement: 'bottom-end'}"
      :key="i"
    >
      <span class="name value">{{i!==0?$t(item.name):item.name}}</span>
      <div class="sub-items" slot="popper">
        <template v-for="(sub,j) in item.children">
          <div
            v-if="!sub.route"
            class="sub-item a"
            :key="j"
            @click="sub.click"
          >{{$t(sub.name)}}
          </div>
          <router-link
            v-else
            class="sub-item"
            :key="j"
            :to="sub.route"
          >{{$t(sub.name)}}
          </router-link>
        </template>
      </div>
    </drop-down>
  </div>
</template>

<script>
import DropDown from 'components/common/DropDown'
import { mapActions, mapState } from 'vuex'

// header 用户信息组件
// 未登录显示登录注册按钮
// 已登录显示用户手机号或者邮箱，下拉显示菜单
export default {
  name: 'UserPin',
  components: { DropDown },
  computed: {
    ...mapState('user', {
      user: state => state.info,
    }),
    myItems() {
      return [
        {
          name: this.user.username,
          children: [
            { name: 'asset.manage', route: '/user-center/assets-manage' },
            { name: 'user.security', route: '/user-center/security' },
            {
              name: 'user.logout',
              click: this.logout,
            },
          ],
        },
      ]
    },
  },
  methods: {
    ...mapActions('user', ['logout']),
  },
}
</script>
