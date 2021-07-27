<template>
  <div class="container">
    <client-header/>
    <router-view/>
    <client-footer/>
  </div>
</template>

<script>
/* eslint-disable import/extensions,import/no-unresolved */

import { currentTheme } from '$router/ThemeComponents'
import ClientFooter from 'components/client/ClientFooter-sipc'

const { ClientHeader } = currentTheme
export default {
  name: 'Frame',
  data() {
    return {}
  },
  components: { ClientFooter, ClientHeader },
}
</script>
