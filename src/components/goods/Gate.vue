<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加商品按钮 -->
      <el-button type="primary" @click="showCateDialog">添加商品</el-button>
      <!-- 商品表单 -->
      <tree-table
        class="treeTable"
        border
        :data="cateList"
        :columns="columns"
        :show-index="true"
        index-text
        :expand-type="false"
        :selection-type="false"
      >
        <!-- 是否有效列模板 -->
        <template slot="isOk" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 权限列模板 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-else size="mini">三级</el-tag>
        </template>
        <!-- 操作列模板 -->
        <template slot="operation">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加分类对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
        <!-- 对话框表格 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称: " prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类: ">
            <el-cascader
              v-model="selectedCates"
              :options="parentCateList"
              :props="{ expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children', checkStrictly: true }"
              @change="handleChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="getResetField">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品数据列表
      cateList: [],
      //总数据条数
      total: 0,
      //表格各列的配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        //需要使用自定义插槽 指定type为template
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'operation'
        }
      ],
      addCateDialogVisible: false,
      //添加分类表单
      addCateForm: {
        //分类名称
        cat_name: '',
        //分类父 ID
        cat_pid: 0,
        //分类层级
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      //父级分类数据列表
      parentCateList: [],
      //选择的Cates
      selectedCates: []
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200)
        return this.$message.error('获取商品列表失败')
      this.cateList = res.data.result
      this.total = res.data.total
      console.log(res)
    },
    //监听每页条数改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听当前页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //展示添加分类对话框
    showCateDialog() {
      //获取父级分类列表
      this.getParentGate()
      this.addCateDialogVisible = true
    },
    //获取父级分类列表
    async getParentGate() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败!')
      }
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    //cascader选择时
    handleChange() {
      if (this.selectedCates.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedCates[
          this.selectedCates.length - 1
        ]
        //分类层级
        this.addCateForm.cat_level = this.selectedCates.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //添加分类确定按钮
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }

        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    //重置表单
    getResetField() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedCates = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.addCateDialogVisible = false
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>