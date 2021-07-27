<template>
  <page-container class="container-inner user-agreement" :title="$t(title)">
    <div class="assets-manager-title privacy-title">{{$t(title)}}</div>
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
