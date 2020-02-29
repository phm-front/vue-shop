<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="logo" />
        <span>电商管理平台</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边导航 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <el-menu
          :unique-opened="true"
          background-color="#323744"
          text-color="#fff"
          active-text-color="#389bff"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 侧边栏的折叠与展开 -->
          <div class="asideCollage" @click="asideCollage">|||</div>
          <el-submenu :index="'' + item.id" v-for="(item, index) in menuList" :key="item.id">
            <template slot="title">
              <i :class="icons[index]"></i>
              <span>{{item.authName}}</span>
            </template>

            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveActivePath('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      icons: [
        'iconfont icon-users',
        'iconfont icon-tijikongjian',
        'iconfont icon-shangpin',
        'iconfont icon-danju',
        'iconfont icon-baobiao'
      ],
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenus() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menuList = res.data
      console.log(res)
    },
    asideCollage() {
      this.isCollapse = !this.isCollapse
    },
    // 存储activePath
    saveActivePath(activePath) {
      //存储到sessionStorage中保证选中的状态
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created() {
    //发送请求获取侧边栏数据
    this.getMenus()
    this.activePath = window.sessionStorage.getItem('activePath')
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  background-color: #373c41;
  > div {
    display: flex;
    align-items: center;
    font-size: 20px;
    color: #fff;
    span {
      margin-left: 5px;
    }
  }
}
.el-aside {
  background-color: #323744;
  .el-menu {
    border-right: 0;
    .asideCollage {
      width: 100%;
      height: 25px;
      background-color: #485164;
      text-align: center;
      line-height: 25px;
      color: #fff;
      font-size: 12px;
      letter-spacing: 0.2em;
      cursor: pointer;
    }
  }
}
.el-main {
  background-color: #eaedf2;
}
.iconfont {
  margin-right: 10px;
}
</style>