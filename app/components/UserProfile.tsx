'use client'

import React, { useState } from 'react'
import { 
  Card, Form, Input, Button, Tabs, Space, message, 
  Row, Col, Avatar, Tag 
} from 'antd'
import { 
  UserOutlined, LockOutlined, SaveOutlined, 
  MailOutlined, PhoneOutlined, TeamOutlined 
} from '@ant-design/icons'
import { updateUser, changePassword, User } from '../../lib/supabase'

interface UserProfileProps {
  user: User
  onUserUpdate: (user: User) => void
}

export default function UserProfile({ user, onUserUpdate }: UserProfileProps) {
  const [loading, setLoading] = useState(false)
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()

  // 更新个人信息
  const handleProfileUpdate = async (values: any) => {
    try {
      setLoading(true)
      const updatedUser = await updateUser(user.id, values)
      message.success('个人信息更新成功')
      onUserUpdate(updatedUser)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败')
    } finally {
      setLoading(false)
    }
  }

  // 修改密码
  const handlePasswordChange = async (values: any) => {
    const { oldPassword, newPassword, confirmPassword } = values
    
    if (newPassword !== confirmPassword) {
      message.error('两次输入的新密码不一致')
      return
    }

    try {
      setLoading(true)
      await changePassword(user.id, oldPassword, newPassword)
      message.success('密码修改成功')
      passwordForm.resetFields()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '密码修改失败')
    } finally {
      setLoading(false)
    }
  }

  const profileTabContent = (
    <div className="max-w-2xl">
      {/* 用户头像和基本信息 */}
      <Card className="mb-6">
        <div className="flex items-center space-x-6">
          <Avatar size={80} icon={<UserOutlined />} />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 flex items-center mt-1">
              <MailOutlined className="mr-2" />
              {user.email}
            </p>
            <div className="mt-2">
              <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </Tag>
            </div>
          </div>
        </div>
      </Card>

      {/* 个人信息表单 */}
      <Card title="个人信息">
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={user}
          onFinish={handleProfileUpdate}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
              >
                <Input prefix={<TeamOutlined />} placeholder="请输入部门" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="职位"
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="phone"
            label="联系电话"
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )

  const passwordTabContent = (
    <div className="max-w-md">
      <Card title="修改密码">
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入当前密码" 
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入新密码" 
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请确认新密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请再次输入新密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">密码安全提示:</h4>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• 密码长度至少6位</li>
            <li>• 建议包含字母、数字和特殊字符</li>
            <li>• 定期更换密码确保账户安全</li>
          </ul>
        </div>
      </Card>
    </div>
  )

  const items = [
    {
      key: 'profile',
      label: '个人信息',
      children: profileTabContent
    },
    {
      key: 'password',
      label: '修改密码',
      children: passwordTabContent
    }
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">个人设置</h1>
      
      <Tabs
        defaultActiveKey="profile"
        items={items}
        size="large"
      />
    </div>
  )
} 