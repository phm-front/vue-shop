<template>
  <div class="login-contain">
    <div class="login-box">
      <!-- 头像 -->
      <div class="login-img">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login-form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="login-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      //表单验证规则
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证用户密码是否合法
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm() {
      //重置表单
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      //登录时验证表单
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return
        //发送网络请求
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登陆成功')
        //登录成功后把token保存到客户端的sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        //跳转到主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-contain {
  position: relative;
  height: 100%;
  background-color: #274a6c;
}
.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
}
.login-img img {
  position: absolute;
  left: 50%;
  top: -20%;
  width: 130px;
  height: 130px;
  transform: translate(-50%, 0);
  border: 5px solid #fff;
  border-radius: 50%;
  background-color: #eee;
  box-shadow: 0 0 10px #ddd;
}
.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.login-btns {
  display: flex;
  justify-content: flex-end;
}
</style>