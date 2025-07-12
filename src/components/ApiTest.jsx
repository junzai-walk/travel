import React, { useState, useEffect } from 'react';
import { checklistAPI, itineraryAPI, activitiesAPI, budgetAPI, expensesAPI } from '../services/api.js';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 测试健康检查
  const testHealthCheck = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试 MongoDB 连接
  const testMongoConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test-mongo');
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试出行清单 API
  const testChecklistAPI = async () => {
    try {
      const result = await checklistAPI.getAll();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试行程安排 API
  const testItineraryAPI = async () => {
    try {
      const result = await itineraryAPI.getAll();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试活动规划 API
  const testActivitiesAPI = async () => {
    try {
      const result = await activitiesAPI.getAll();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试预算参考 API
  const testBudgetAPI = async () => {
    try {
      const result = await budgetAPI.getAll();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 测试实际支出 API
  const testExpensesAPI = async () => {
    try {
      const result = await expensesAPI.getAll();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsLoading(true);
    const results = {};

    console.log('开始 API 测试...');

    // 健康检查
    results.health = await testHealthCheck();
    console.log('健康检查:', results.health);

    // MongoDB 连接测试
    results.mongodb = await testMongoConnection();
    console.log('MongoDB 连接:', results.mongodb);

    // 出行清单 API
    results.checklist = await testChecklistAPI();
    console.log('出行清单 API:', results.checklist);

    // 行程安排 API
    results.itinerary = await testItineraryAPI();
    console.log('行程安排 API:', results.itinerary);

    // 活动规划 API
    results.activities = await testActivitiesAPI();
    console.log('活动规划 API:', results.activities);

    // 预算参考 API
    results.budget = await testBudgetAPI();
    console.log('预算参考 API:', results.budget);

    // 实际支出 API
    results.expenses = await testExpensesAPI();
    console.log('实际支出 API:', results.expenses);

    setTestResults(results);
    setIsLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">🧪 API 接口测试</h2>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p className="text-muted mb-0">测试后端 API 接口连接状态</p>
            <button 
              className="btn btn-primary"
              onClick={runAllTests}
              disabled={isLoading}
            >
              {isLoading ? '测试中...' : '重新测试'}
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">测试中...</span>
              </div>
              <p className="mt-2">正在测试 API 接口...</p>
            </div>
          )}

          {!isLoading && Object.keys(testResults).length > 0 && (
            <div className="row">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="col-md-6 col-lg-4 mb-3">
                  <div className={`card ${result.success ? 'border-success' : 'border-danger'}`}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        {key === 'health' && '🏥 健康检查'}
                        {key === 'mongodb' && '🗄️ MongoDB 连接'}
                        {key === 'checklist' && '📋 出行清单'}
                        {key === 'itinerary' && '📅 行程安排'}
                        {key === 'activities' && '🎯 活动规划'}
                        {key === 'budget' && '💰 预算参考'}
                        {key === 'expenses' && '💸 实际支出'}
                      </h6>
                      <span className={`badge ${result.success ? 'bg-success' : 'bg-danger'}`}>
                        {result.success ? '✅ 成功' : '❌ 失败'}
                      </span>
                    </div>
                    <div className="card-body">
                      {result.success ? (
                        <div>
                          <p className="text-success mb-2">连接成功</p>
                          {result.data && (
                            <small className="text-muted">
                              状态: {result.data.status}<br/>
                              消息: {result.data.message}
                            </small>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="text-danger mb-2">连接失败</p>
                          <small className="text-muted">
                            错误: {result.error}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <h5>📝 测试说明</h5>
            <ul className="list-unstyled">
              <li>• 确保后端服务器运行在 http://localhost:3001</li>
              <li>• 绿色表示 API 接口连接成功</li>
              <li>• 红色表示 API 接口连接失败</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
