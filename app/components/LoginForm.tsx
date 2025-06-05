'use client'
import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Alert, Typography, Divider } from 'antd'
import { UserOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'

const { Title, Text } = Typography

interface LoginFormProps {
  onLoginSuccess: (user: any) => void
}

interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
  title?: string
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showDemo, setShowDemo] = useState(false)

  useEffect(() => {
    loadDemoUsers()
  }, [])

  const loadDemoUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('role', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('加载用户失败:', err)
    }
  }

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    setError(null)

    try {
      // 简化的登录逻辑 - 在实际项目中应该使用真正的密码验证
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', values.email)
        .single()

      if (error || !user) {
        throw new Error('用户不存在或邮箱错误')
      }

      // 这里应该验证密码，目前简化处理
      // 在真实项目中，应该使用 Supabase Auth 或其他安全的认证方式
      
      // 保存用户信息到 localStorage
      localStorage.setItem('currentUser', JSON.stringify(user))
      
      onLoginSuccess(user)
    } catch (err: any) {
      setError(err.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (user: User) => {
    localStorage.setItem('currentUser', JSON.stringify(user))
    onLoginSuccess(user)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <TeamOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            科研成果管理系统
          </Title>
          <Text type="secondary">课题组内部管理平台</Text>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          name="login"
          onFinish={handleLogin}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱地址' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="邮箱地址" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%', height: 44 }}
            >
              登录系统
            </Button>
          </Form.Item>
        </Form>

        <Divider>或使用演示账号</Divider>

        <div style={{ textAlign: 'center' }}>
          <Button 
            type="link" 
            onClick={() => setShowDemo(!showDemo)}
            style={{ marginBottom: 16 }}
          >
            {showDemo ? '隐藏' : '显示'}演示账号
          </Button>

          {showDemo && (
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {users.map((user) => (
                <Card 
                  key={user.id}
                  size="small" 
                  style={{ 
                    marginBottom: 8, 
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0'
                  }}
                  onClick={() => handleDemoLogin(user)}
                  hoverable
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong>{user.name}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {user.email}
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Text 
                        style={{ 
                          fontSize: 11,
                          background: user.role === 'admin' ? '#f6ffed' : '#fff7e6',
                          color: user.role === 'admin' ? '#52c41a' : '#fa8c16',
                          padding: '2px 8px',
                          borderRadius: 4,
                          border: `1px solid ${user.role === 'admin' ? '#b7eb8f' : '#ffd591'}`
                        }}
                      >
                        {user.role === 'admin' ? '管理员' : '普通用户'}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {user.title || '研究员'}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 演示模式：点击任意账号即可登录体验
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default LoginForm 