import { testConnection, syncDB } from './src/config/database.js';

async function testMySQL() {
  try {
    console.log('🔄 正在测试MySQL连接...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('✅ MySQL连接测试成功');
      console.log('🔄 正在同步数据库表结构...');
      const synced = await syncDB();
      
      if (synced) {
        console.log('✅ 数据库表结构同步成功');
      } else {
        console.log('❌ 数据库表结构同步失败');
      }
    } else {
      console.log('❌ MySQL连接测试失败');
    }
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    console.error('详细错误信息:', error);
  }
  
  process.exit(0);
}

testMySQL();
