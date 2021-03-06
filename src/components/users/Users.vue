<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- layout布局 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <div>
            <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUsers">
              <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表表单 -->
      <el-table :data="userList" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="statuChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showUserMessage(scope.row)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配用户按钮 -->
            <el-tooltip effect="dark" content="分配用户" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoleClick(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加用户dialog -->
    <el-dialog title="提示" :visible.sync="addUserDialogVisible" width="50%" @close="dialogClosed">
      <!-- 内容区域 -->
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- footer -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户dialog -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editFormClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserMessage">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配用户dialog -->
    <el-dialog title="提示" :visible.sync="setRoleDialogVisible" width="50%" @close="setRolseClosed">
      <p>当前的用户: {{userInfo.username}}</p>
      <p>当前的角色: {{userInfo.role_name}}</p>
      <div>
        分配新的角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="selectedRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //校验邮箱
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      if (regEmail.test(value)) {
        //合法邮箱
        return callback()
      }
      callback(new Error('请输入合法邮箱'))
    }
    //校验手机号
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      if (regMobile.test(value)) {
        //合法手机号
        return callback()
      }
      callback(new Error('请输入合法手机号'))
    }
    return {
      //获取用户列表传参
      queryInfo: {
        query: '',
        //当前页的页码
        pagenum: 1,
        //总页数
        pagesize: 2
      },
      userList: [],
      total: 0,
      //控制对话框的显示和隐藏
      addUserDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 15, message: '长度在 5 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //检验邮箱
          { validator: checkEmail, trigger: 'blur', message: '请输入合法邮箱' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '请输入合法手机号',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          //检验邮箱
          { validator: checkEmail, trigger: 'blur', message: '请输入合法邮箱' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            validator: checkMobile,
            message: '请输入合法手机号',
            trigger: 'blur'
          }
        ]
      },
      setRoleDialogVisible: false,
      //当前的用户信息
      userInfo: '',
      roleList: [],
      selectedRoleId: ''
    }
  },
  methods: {
    async getUsers() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
      console.log(res)
    },
    //监听改变每页显示条数
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getUsers()
    },
    //监听改变页码
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getUsers()
    },
    //监听用户状态改变
    async statuChange(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      this.$message.success('修改用户状态成功！')
    },
    //dialog关闭时重置表单
    dialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('校验表单失败')
        //发送添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        //重新获取用户列表数据
        this.getUsers()
        //关闭对话框
        this.addUserDialogVisible = false
      })
    },
    //点击修改信息展示用户信息
    showUserMessage(data) {
      console.log(data)
      // this.editForm.id = data.id
      // this.editForm.username = data.username
      // this.editForm.email = data.email
      // this.editForm.mobile = data.mobile
      // console.log(this.editForm)
      this.editForm = data

      this.editDialogVisible = true
    },
    //关闭编辑对话框重置表格
    editFormClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息
    editUserMessage() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        //验证通过发送修改用户请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        //关闭editDialog
        this.editDialogVisible = false
        //获取用户列表数据
        this.getUsers()
        this.$message.success('修改成功！')
      })
    },
    //删除用户
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //用户确认删除，confirmResult值为confirm
      //用户取消删除，confirmResult值为cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('用户删除失败')
      }
      this.$message.success('删除成功！')
      this.getUsers()
    },
    //监听分配用户按钮点击
    async setRoleClick(role) {
      this.setRoleDialogVisible = true
      this.userInfo = role
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色失败！')
      this.roleList = res.data
    },
    //分配用户dialog点击确定
    async selectedRole() {
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败！')
      }
      this.setRoleDialogVisible = false
      this.getUsers()
    },
    //分配用户dialog关闭时重置
    setRolseClosed() {
      this.selectedRoleId = ''
    }
  },
  created() {
    //获取用户列表参数
    this.getUsers()
  }
}
</script>

<style lang="less" scoped>
</style>