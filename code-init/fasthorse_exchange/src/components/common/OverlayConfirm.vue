<template>
  <overlay class="overlay-confirm"
           @click="$emit('close')">
    <div class="float-win"
         :style="{width:winWidth+'px'}">
      <h2 v-if="head">{{head}}</h2>
      <div class="overlay-content">
        <p v-if="!hideTip"
           v-html="tipText || ($t('sure')+$t('del')+$t('ma'))"></p>
        <slot/>
      </div>
      <div class="btn-group">
        <div class="btn btn-green-fill"
             @click="$emit('confirm')">{{confirmText || $t('sure')}}
        </div>
        <div class="btn"
             @click="$emit('cancel')">{{cancelText || $t('cancel-1')}}
        </div>
      </div>
    </div>
  </overlay>
</template>

<script>
// 确认弹窗
// 使用确认弹窗提醒用户再次确认操作
export default {
  name: 'OverlayConfirm',
  props: {
    // 弹窗标题
    head: String,
    // 提示语
    tipText: String,
    // 确认按钮的文字
    confirmText: String,
    // 取消按钮的文字
    cancelText: String,
    // 窗口的宽度
    winWidth: Number,
    // 是否使用 slot 代替 tipText
    hideTip: Boolean,
  },
}
</script>
