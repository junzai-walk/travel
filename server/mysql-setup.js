import mysql from 'mysql2/promise';

async function setupMySQLConnection() {
  console.log('🔄 正在检查MySQL连接配置...');
  
  const config = {
    host: '175.178.87.16',
    port: 3306,
    user: 'junzai',
    password: '123qwer',
    database: 'xuzhou'
  };
  
  try {
    console.log(`📍 尝试连接到 MySQL 服务器: ${config.host}:${config.port}`);
    console.log(`👤 用户名: ${config.user}`);
    console.log(`🗄️  数据库: ${config.database}`);
    
    const connection = await mysql.createConnection(config);
    console.log('✅ MySQL连接成功！');
    
    // 测试数据库操作
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ 数据库查询测试成功:', rows);
    
    // 检查数据库是否存在
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 可用数据库:', databases.map(db => db.Database));
    
    // 检查是否有xuzhou数据库
    const hasXuzhouDB = databases.some(db => db.Database === 'xuzhou');
    if (hasXuzhouDB) {
      console.log('✅ xuzhou 数据库存在');
    } else {
      console.log('⚠️  xuzhou 数据库不存在，正在创建...');
      await connection.execute('CREATE DATABASE IF NOT EXISTS xuzhou CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log('✅ xuzhou 数据库创建成功');
    }
    
    await connection.end();
    console.log('🎉 MySQL连接配置验证完成！');
    
  } catch (error) {
    console.error('❌ MySQL连接失败:', error.message);
    console.log('\n💡 可能的解决方案:');
    console.log('1. 检查MySQL服务器是否运行');
    console.log('2. 检查网络连接是否正常');
    console.log('3. 检查用户权限设置');
    console.log('4. 在MySQL服务器上执行以下命令授权:');
    console.log(`   GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456';`);
    console.log(`   FLUSH PRIVILEGES;`);
    
    if (error.code === 'ER_HOST_NOT_PRIVILEGED') {
      console.log('\n🔧 主机权限问题解决方案:');
      console.log('在MySQL服务器上执行:');
      console.log(`CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '123456';`);
      console.log(`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';`);
      console.log(`FLUSH PRIVILEGES;`);
    }
  }
}

setupMySQLConnection();
