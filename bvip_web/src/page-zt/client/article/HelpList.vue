<template>
  <page-container class="container-inner article-wrap" :title="$t(type)">
    <div class="content">
      <!--<h1 class="h1">{{$t(type)}}</h1>-->
      <div class="wrap">
        <help-aside/>
        <h1 class="familiar-title">{{$t('problems')}}</h1>
        <query class="right" :queryFn="queryFn" :noResult="!list||list.length<1"
          @error="log('HelpList:',$event)">
          <div class="familiar-list">
            <FamiliarList v-for="(m,i) in list" :msg="m"
                          :route="'/helpDetailArticle/'
                          +m.id
                          +'.html?classId='
                          +m.classId
                          +'&&detailTitle='+m.className"
                          :key="i"/>
            <!--<pagination :config="pageConfig" @to="pageConfig.page=$event;queryAgain=true"/>-->
          </div>
        </query>
      </div>
    </div>
  </page-container>
</template>

<script>
/* eslint-disable guard-for-in */

import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import HelpAside from './HelpAside'
import FamiliarList from '@/page-zt/components/FamiliarList/FamiliarList'

export default {
  name: 'HelpList',
  created() {
    this.queryFn().then((res) => {
      res()
    })
  },
  data() {
    return {
      // familiarList: [],
      pageConfig: {
        total: 1,
        pages: 1,
        page: 1,
        pageSize: 10,
      },
      // queryAgain: false,
    }
  },
  computed: {
    ...mapState('article', ['articleList', 'classes', 'familiarList']),
    ...mapGetters('article', ['classesArr']),
    type() {
      return 'help'
    },
    classId() {
      const t = this.classesArr[this.type]
      return this.$route.query.classId || (t && t[0] && t[0].id)
    },
    list() {
      // const t = this.articleList[this.type] || {}
      // return t[this.classId] && t[this.classId].map(item => ({
      //   ...item,
      //   brief: item.description || item.title,
      //   createdAt: item.dateline,
      // }))
      // return this.familiarArr(this.type)
      return this.familiarList[this.type]
    },
  },
  watch: {
    classId() {
      this.pageConfig.page = 1
      // this.queryAgain = true
    },
    classes(val) {
      if (val[this.type] && Object.keys(val[this.type]).length > 0) {
        this.queryFn().then((res) => {
          res()
        })
      }
    },
    '$route'() {
      this.queryFn().then((res) => {
        res()
      })
    },
  },
  methods: {
    ...mapActions('article', ['getArticles']),
    ...mapMutations('article', ['GET_FAMILIAR']),
    queryFn() {
      const pro = Promise.resolve(() => {
        const classesArr = this.classes
        const arr = JSON.parse(JSON.stringify(classesArr))
        const arrHelp = arr.help
        const tempArr = []
        if (typeof arrHelp === 'object') {
          Object.keys(arrHelp)
            .forEach((i) => {
              if (arrHelp[i] && arrHelp[i].id) {
                this.getArticles({
                  type: this.type,
                  class_id: arrHelp[i].id,
                })
                  .then((res) => {
                    const a = res.records
                    a.forEach((item, idx) => {
                      item.className = arrHelp[i].name
                      item.classId = arrHelp[i].id
                      if (idx < 3) {
                        tempArr.push(item)
                      }
                    })
                  })
                  .catch(this.snackBar.error)
              }
            })
        }
        this.GET_FAMILIAR({
          type: this.type,
          array: tempArr,
        })
      })
      return pro
    },
  },
  components: {
    FamiliarList,
    HelpAside,
  },
}
</script>
