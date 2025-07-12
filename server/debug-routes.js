import express from 'express';

const app = express();

// 中间件
app.use(express.json());

// 测试路由注册
async function testRouteRegistration() {
  console.log('🔄 测试路由注册...\n');
  
  try {
    // 导入路由
    const { default: checklistRoutes } = await import('./src/routes/checklist.js');
    console.log('✅ checklist 路由导入成功');
    
    // 注册路由
    app.use('/api/checklist', checklistRoutes);
    console.log('✅ checklist 路由注册成功');
    
    // 添加一个简单的测试路由
    app.get('/test', (req, res) => {
      res.json({ message: '测试路由工作正常' });
    });
    
    // 启动服务器
    const PORT = 3002;
    app.listen(PORT, () => {
      console.log(`🚀 测试服务器启动在端口 ${PORT}`);
      console.log(`📍 测试地址: http://localhost:${PORT}/test`);
      console.log(`📍 清单接口: http://localhost:${PORT}/api/checklist`);
    });
    
  } catch (error) {
    console.error('❌ 路由注册失败:', error.message);
    console.error('详细错误:', error);
  }
}

testRouteRegistration();
