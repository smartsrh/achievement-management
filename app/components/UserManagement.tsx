'use client'

import React, { useState, useEffect } from 'react'
import { 
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm, 
  message, Tag, Card, Row, Col 
} from 'antd'
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, TeamOutlined 
} from '@ant-design/icons'
import { 
  getAllUsers, createUser, updateUser, deleteUser, 
  User 
} from '../../lib/supabase'

interface UserManagementProps {
  currentUser: User
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      if (editingUser) {
        await updateUser(editingUser.id, values)
        message.success('用户更新成功')
      } else {
        await createUser(values)
        message.success('用户创建成功')
      }
      
      setModalVisible(false)
      await loadUsers()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      setLoading(true)
      await deleteUser(userId)
      message.success('用户删除成功')
      await loadUsers()
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => text || '-'
    },
    {
      title: '职位',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => text || '-'
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => new Date(text).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.id !== currentUser.id && (
            <Popconfirm
              title="确定要删除这个用户吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  // 统计信息
  const totalUsers = users.length
  const adminUsers = users.filter(u => u.role === 'admin').length
  const regularUsers = users.filter(u => u.role === 'user').length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">用户管理</h1>
        
        {/* 统计信息 */}
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Card>
              <div className="text-center">
                <TeamOutlined className="text-2xl text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                <p className="text-gray-500">总用户数</p>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div className="text-center">
                <UserOutlined className="text-2xl text-red-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{adminUsers}</p>
                <p className="text-gray-500">管理员</p>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div className="text-center">
                <UserOutlined className="text-2xl text-green-500 mb-2" />
                <p className="text-2xl font-bold text-gray-800">{regularUsers}</p>
                <p className="text-gray-500">普通用户</p>
              </div>
            </Card>
          </Col>
        </Row>

        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="mb-4"
        >
          新建用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
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
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Select.Option value="user">普通用户</Select.Option>
                  <Select.Option value="admin">管理员</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="部门"
              >
                <Input placeholder="请输入部门" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="职位"
              >
                <Input placeholder="请输入职位" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="电话"
              >
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
          </Row>

          {!editingUser && (
            <Form.Item>
              <div className="text-sm text-gray-500">
                默认密码：123456，用户首次登录后可自行修改
              </div>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
} 