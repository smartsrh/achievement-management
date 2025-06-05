'use client'

import React, { useState } from 'react'
import { Button, Input, Form, Card, message, Spin } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { loginUser, User } from '../../lib/supabase'

interface LoginProps {
  onLogin: (user: User) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true)
      const user = await loginUser(values.email, values.password)
      message.success('登录成功！')
      onLogin(user)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card 
        title={
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">科研成果管理系统</h1>
            <p className="text-gray-500 mt-2">请登录您的账户</p>
          </div>
        } 
        className="w-full max-w-md shadow-lg"
      >
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          size="large"
          autoComplete="off"
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
              className="w-full"
              loading={loading}
            >
              {loading ? <Spin size="small" /> : '登录'}
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>默认密码：123456</p>
          <p>如有问题请联系管理员</p>
        </div>
      </Card>
    </div>
  )
} 