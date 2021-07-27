<template>
  <div class="overlay-wrap" @click="$emit('click',$event)" @touchmove.stop.prevent="">
    <div class="overlay" @click.stop.prevent="">
      <slot/>
    </div>
  </div>
</template>

<script>
// 弹窗的深色背景层
export default {
  name: 'Overlay',
}
</script>
