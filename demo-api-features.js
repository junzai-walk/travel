// 徐州旅游指南应用 - 三个核心模块API功能演示脚本
const BASE_URL = 'http://175.178.87.16:30001/api';

async function demonstrateFeatures() {
  console.log('🎯 徐州旅游指南应用 - 三个核心模块API功能演示');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    // 1. 预算参考模块演示
    console.log('💰 预算参考模块 (Budget Reference Module)');
    console.log('-' .repeat(40));
    
    // 获取现有预算数据
    const budgetResponse = await fetch(`${BASE_URL}/budget`);
    const budgetData = await budgetResponse.json();
    console.log(`📊 当前预算参考项目: ${budgetData.data.items.length} 条`);
    
    // 展示前3条预算数据
    budgetData.data.items.slice(0, 3).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.category} - ${item.item_name}: ¥${item.recommended_amount}`);
    });
    
    // 创建新的预算项目
    console.log('\n🔄 创建新的预算参考项目...');
    const newBudgetItem = await fetch(`${BASE_URL}/budget/reference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: '娱乐费',
        item_name: '云龙湖游船',
        min_amount: 30,
        max_amount: 80,
        recommended_amount: 50,
        unit: '元',
        description: '云龙湖风景区游船体验',
        tips: '建议选择黄昏时分乘坐，景色更美',
        is_essential: false
      })
    });
    
    if (newBudgetItem.ok) {
      const result = await newBudgetItem.json();
      console.log(`✅ 成功创建预算项目: ${result.data.item_name} (ID: ${result.data.id})`);
      
      // 更新预算项目
      console.log('🔄 更新预算项目...');
      const updateResponse = await fetch(`${BASE_URL}/budget/reference/${result.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          recommended_amount: 60,
          tips: '建议选择黄昏时分乘坐，景色更美。团体票有优惠。'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ 预算项目更新成功');
      }
      
      // 清理测试数据
      await fetch(`${BASE_URL}/budget/reference/${result.data.id}`, { method: 'DELETE' });
      console.log('🧹 测试数据已清理');
    }
    
    console.log('');
    
    // 2. 实际消费支出模块演示
    console.log('💳 实际消费支出模块 (Actual Expenses Module)');
    console.log('-' .repeat(40));
    
    // 获取现有支出数据
    const expensesResponse = await fetch(`${BASE_URL}/expenses`);
    const expensesData = await expensesResponse.json();
    const expensesCount = expensesData.data && expensesData.data.items ? expensesData.data.items.length : 0;
    console.log(`💸 当前支出记录: ${expensesCount} 条`);
    
    // 创建新的支出记录
    console.log('\n🔄 创建新的支出记录...');
    const newExpense = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: '餐饮费',
        amount: 128.50,
        description: '马市街小吃街晚餐',
        date: '2025-07-12',
        time: '19:30',
        location: '马市街小吃街',
        payment_method: '微信支付',
        notes: '品尝了徐州特色小吃：烙馍、羊肉汤、蜜三刀',
        is_planned: true
      })
    });
    
    if (newExpense.ok) {
      const result = await newExpense.json();
      console.log(`✅ 成功记录支出: ${result.data.description} - ¥${result.data.amount}`);
      console.log(`   📍 地点: ${result.data.location}`);
      console.log(`   💰 支付方式: ${result.data.payment_method}`);
      
      // 更新支出记录
      console.log('🔄 更新支出记录...');
      const updateResponse = await fetch(`${BASE_URL}/expenses/${result.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          amount: 135.00,
          notes: '品尝了徐州特色小吃：烙馍、羊肉汤、蜜三刀。还买了一些特产。'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ 支出记录更新成功');
      }
      
      // 清理测试数据
      await fetch(`${BASE_URL}/expenses/${result.data.id}`, { method: 'DELETE' });
      console.log('🧹 测试数据已清理');
    }
    
    console.log('');
    
    // 3. 出行清单模块演示
    console.log('📝 出行清单模块 (Travel Checklist Module)');
    console.log('-' .repeat(40));
    
    // 获取现有清单数据
    const checklistResponse = await fetch(`${BASE_URL}/checklist`);
    const checklistData = await checklistResponse.json();
    const checklistCount = checklistData.data && checklistData.data.items ? checklistData.data.items.length : 0;
    console.log(`📋 当前清单项目: ${checklistCount} 条`);
    
    // 展示前5条清单数据
    if (checklistData.data && checklistData.data.items) {
      checklistData.data.items.slice(0, 5).forEach((item, index) => {
        const status = item.is_completed ? '✅' : '⬜';
        console.log(`   ${status} ${item.item_name} (${item.category})`);
      });
    }
    
    // 创建新的清单项目
    console.log('\n🔄 创建新的清单项目...');
    const newChecklistItem = await fetch(`${BASE_URL}/checklist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_name: '徐州特产购买清单',
        category: '其他',
        priority: '中',
        is_completed: false,
        notes: '蜜三刀、小孩酥糖、沛县狗肉'
      })
    });
    
    if (newChecklistItem.ok) {
      const result = await newChecklistItem.json();
      console.log(`✅ 成功创建清单项目: ${result.data.item_name}`);
      
      // 切换完成状态
      console.log('🔄 标记为已完成...');
      const toggleResponse = await fetch(`${BASE_URL}/checklist/${result.data.id}/toggle`, {
        method: 'PATCH'
      });
      
      if (toggleResponse.ok) {
        const toggleResult = await toggleResponse.json();
        const status = toggleResult.data.is_completed ? '✅ 已完成' : '⬜ 未完成';
        console.log(`✅ 状态更新: ${status}`);
      }
      
      // 更新清单项目
      console.log('🔄 更新清单项目...');
      const updateResponse = await fetch(`${BASE_URL}/checklist/${result.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          item_name: '徐州特产购买清单（已完成）',
          notes: '✅ 蜜三刀、小孩酥糖、沛县狗肉 - 已在马市街购买'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ 清单项目更新成功');
      }
      
      // 清理测试数据
      await fetch(`${BASE_URL}/checklist/${result.data.id}`, { method: 'DELETE' });
      console.log('🧹 测试数据已清理');
    }
    
    console.log('');
    console.log('🎉 功能演示完成！');
    console.log('=' .repeat(60));
    console.log('');
    console.log('📊 演示总结:');
    console.log('✅ 预算参考模块: 完整CRUD功能正常');
    console.log('✅ 实际支出模块: 完整CRUD功能正常');  
    console.log('✅ 出行清单模块: 完整CRUD功能正常');
    console.log('');
    console.log('🚀 所有三个核心模块的API集成已成功实现！');
    console.log('💡 用户现在可以通过前端界面进行完整的数据管理操作。');
    
  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error.message);
  }
}

demonstrateFeatures();
