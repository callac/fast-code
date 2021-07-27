<template>
  <page-container class="feedback" :title="title">
    <div class="container-inner content">
      <h1>
        <span class="iconfont icon-left-arrow" @click="$router.back()"></span>
        {{title}}
      </h1>
      <div class="form">
        <template v-for="item in items">
          <my-input v-if="item.inputType!=='files'"
                    v-model="item.value"
                    type="1"
                    :item="item"
                    :key="item.name"/>
          <div v-else class="my-input type-1 files" :key="item.name">
            <label class="label">{{$t(item.name)}}</label>
            <div v-if="item.files&&item.files.length>0" class="files-wrap">
              <div v-for="(img, i) in item.files"
                   class="file-wrap"
                   :key="i">
                <img-tag class="img" :src="img"/>
                <span class="iconfont icon-del" @click="delImg(item, i)"></span>
              </div>
            </div>
            <label for="file" class="iconfont icon-add add-label">
              <file-input id="file" @input="addFile(item, $event)"/>
            </label>
          </div>
        </template>
        <btn-once class="btn btn-green-fill btn-submit"
                  :clickFn="submit">{{$t('submit')}}
        </btn-once>
      </div>
      <div v-if="detail" class="replies">
        <h2>{{$t('replies')}}</h2>

        <div v-for="(r, i) in detail.replies"
             class="reply"
             :key="i">
          <h3>
            {{r.is_sys?$t('service'):$t('me')}}
            <time>{{dateFormatter(r.UpdatedAt, 'MM-DD HH:mm')}}</time>
          </h3>
          <p class="content-p">
            {{r.message}}
          </p>
          <div v-if="r.attachments&&r.attachments.length>0"
               class="imgs"
               v-html="showImg(r.attachments)"></div>
        </div>
      </div>
    </div>
  </page-container>
</template>

<script>
import MyInput from 'components/client/MyInput'
import Templates from 'data/immutable-data/Templates'
import AliOss from 'utils/AliOss'
import { dataDeal } from 'utils/DataDeal'
import { mapActions, mapState } from 'vuex'

const itemsOrder = [
  'phone',
  'email',
  'title',
  'content',
  'attachments',
]

export default {
  name: 'Feedback',
  components: { MyInput },
  data() {
    return {
      items: [],
    }
  },
  computed: {
    ...mapState('feedback', ['details']),
    ...mapState('user', ['info']),
    id() {
      return this.$route.params.id
    },
    title() {
      return this.id ? this.$t('feedback.reply') : this.$t('feedback.new')
    },
    detail() {
      const detail = this.details && this.details[this.id]
      if (!detail) return detail
      return {
        ...detail,
        replies: [{ ...detail.ticket, message: detail.ticket.body }, ...detail.messages]
          .reverse()
          .map(item => ({ ...item, attachments: item.attach.split(',') })),
      }
    },
  },
  methods: {
    ...mapActions('feedback', ['getDetails', 'create', 'reply']),
    ...mapActions('user', ['getOssConfig']),
    generateItems() {
      return Templates.generator('feedback', {
        order: this.id ? itemsOrder.filter(k => k === 'content' || k === 'attachments') : itemsOrder,
        dealFn: (k, item) => {
          if (k === 'phone') {
            item.value = this.info.phone_origin
          } else if (k === 'email') {
            item.value = this.info.email_origin
          }
          return item
        },
      })
    },
    addFile(target, files) {
      AliOss
        .ossUpload(files[0])
        .then((res) => {
          this.$set(target, 'value', (target.value || []).concat([res.name]))
          this.$set(target, 'files', (target.files || []).concat([files[0]]))
        })
        .catch(this.snackBar.error)
    },
    showImg(imgUrls) {
      return imgUrls.reduce((pre, img) => (img ? `${pre}<img class="feedback-img-show" src="${img}">` : pre), '')
    },
    delImg(target, index) {
      target.files.splice(index, 1)
      target.value.splice(index, 1)
      this.$set(target, 'files', target.files)
      this.$set(target, 'value', target.value)
    },
    submit() {
      return this.validate(this.items)
        .then(() => {
          const data = {
            ...dataDeal(this.items),
            attach: this.items[this.items.length - 1].value
            && this.items[this.items.length - 1].value.join(','),
          }
          if (this.id) {
            return this.reply({ ...data, message: data.body, ticket_id: this.id })
              .then(() => {
                this.snackBar.info(this.$t('reply.success'))
                this.getDetails(this.id)
              })
          }
          if (!data.phone && !data.email) throw new Error(this.$t('phone&email.at-least-one'))
          return this.create(data)
            .then(() => {
              this.snackBar.info(this.$t('add.success'))
              this.$router.push('/feedback/list')
            })
        })
    },
  },
  created() {
    this.getOssConfig().catch(this.snackBar.error)
    if (this.id) this.getDetails(this.id)
    this.items = this.generateItems()
  },
}
</script>
