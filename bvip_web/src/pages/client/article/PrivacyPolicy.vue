<template>
  <page-container class="container-inner privacy-policy" :title="$t(title)">
    <privacy class="content"/>
  </page-container>
</template>

<script>
import Privacy from 'components/client/Privacy'

export default {
  name: 'PrivacyPolicy',
  data() {
    return {
      title: 'sign-up.agreement',
    }
  },
  components: { Privacy },
}
</script>
