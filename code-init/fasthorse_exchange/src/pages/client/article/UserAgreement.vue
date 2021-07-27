<template>
  <page-container class="container-inner user-agreement" :title="$t(title)">
    <agreement class="content"/>
  </page-container>
</template>

<script>
import Agreement from 'components/client/Agreement'

export default {
  name: 'UserAgreement',
  data() {
    return {
      title: 'sign-up.agreement',
    }
  },
  components: { Agreement },
}
</script>
