<template>
  <div class="container not-found">
    <h1>404</h1>
    <p>{{$t('not-found')}}</p>
    <div class="back btn btn-blue" @click="$router.replace('/')">{{$t('back')}}</div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  beforeMount() {
    document.title = '404'
  },
}
</script>
