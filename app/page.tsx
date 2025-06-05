'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Space, message } from 'antd'
import { 
  DashboardOutlined, FileTextOutlined, UserOutlined, 
  SettingOutlined, LogoutOutlined, TeamOutlined,
  TrophyOutlined, BookOutlined, BankOutlined, 
  CalendarOutlined, GiftOutlined, RiseOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import Login from './components/Login'
import UserManagement from './components/UserManagement'
import UserProfile from './components/UserProfile'
import UserDashboard from './components/UserDashboard'
import AchievementList from './components/AchievementList'
import OverallStats from './components/OverallStats'
import { User, ACHIEVEMENT_CATEGORIES, AchievementCategory } from '../lib/supabase'

const { Header, Sider, Content } = Layout

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState('overall-stats')
  const [isClient, setIsClient] = useState(false)
  const [navigationParams, setNavigationParams] = useState<any>(null)

  useEffect(() => {
    // 标记为客户端渲染
    setIsClient(true)
    
    // 检查本地存储的用户信息（仅在客户端）
    if (typeof window !== 'undefined') {
      // 开发模式下清除缓存，确保能看到登录页面
      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem('currentUser')
        return
      }
      
      const savedUser = localStorage.getItem('currentUser')
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser))
        } catch (error) {
          localStorage.removeItem('currentUser')
        }
      }
    }
  }, [])

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
    message.success(`欢迎回来，${user.name}！`)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser')
    }
    setCurrentPage('overall-stats')
    message.success('已退出登录')
  }

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }
  }

  const handleNavigation = (page: string, params?: any) => {
    setCurrentPage(page)
    setNavigationParams(params)
  }

  // 在客户端渲染完成前显示加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  // 成果类型菜单项
  const achievementMenuItems = Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, label]) => ({
    key: `achievement-${key}`,
    icon: getAchievementIcon(key as AchievementCategory),
    label: label,
  }))

  function getAchievementIcon(category: AchievementCategory) {
    const iconMap = {
      journal_paper: <FileTextOutlined />,
      conference_paper: <BookOutlined />,
      book: <BookOutlined />,
      patent: <BankOutlined />,
      conference_report: <TeamOutlined />,
      standard: <GiftOutlined />,
      software_copyright: <FileTextOutlined />,
      research_award: <TrophyOutlined />,
      talent_training: <TeamOutlined />,
      academic_conference: <CalendarOutlined />,
      tech_transfer: <RiseOutlined />,
      other_research: <FileTextOutlined />
    }
    return iconMap[category] || <FileTextOutlined />
  }

  const menuItems = [
    {
      key: 'overall-stats',
      icon: <BarChartOutlined />,
      label: '整体统计',
    },
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '个人主页',
    },
    {
      key: 'achievements',
      icon: <TrophyOutlined />,
      label: '成果管理',
      children: [
        {
          key: 'all-achievements',
          icon: <FileTextOutlined />,
          label: '所有成果',
        },
        ...achievementMenuItems
      ]
    },
    ...(currentUser.role === 'admin' ? [{
      key: 'user-management',
      icon: <TeamOutlined />,
      label: '用户管理',
    }] : []),
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人设置',
    }
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录'
    }
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu clicked:', key) // 调试用
    if (key === 'logout') {
      handleLogout()
    } else if (key === 'profile') {
      setCurrentPage('profile')
    } else {
      // 强制更新当前页面，即使是相同的key
      setCurrentPage('')
      setTimeout(() => setCurrentPage(key), 0)
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'overall-stats':
        return <OverallStats currentUser={currentUser} onNavigate={handleNavigation} />
        
      case 'dashboard':
        return <UserDashboard user={currentUser} onNavigate={handleNavigation} />
      
      case 'user-management':
        return currentUser.role === 'admin' ? 
          <UserManagement currentUser={currentUser} /> : 
          <div className="p-6">无权限访问</div>
      
      case 'profile':
        return <UserProfile user={currentUser} onUserUpdate={handleUserUpdate} />
      
      case 'all-achievements':
        return <AchievementList currentUser={currentUser} navigationParams={navigationParams} />
      
      default:
        // 处理成果类型页面
        if (currentPage.startsWith('achievement-')) {
          const category = currentPage.replace('achievement-', '') as AchievementCategory
          return <AchievementList currentUser={currentUser} category={category} navigationParams={navigationParams} />
        }
        return <OverallStats currentUser={currentUser} onNavigate={handleNavigation} />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        width={250}
      >
        <div className="p-4 text-center border-b">
          <h2 className={`font-bold text-blue-600 ${collapsed ? 'text-sm' : 'text-lg'}`}>
            {collapsed ? '成果' : '科研成果管理系统'}
          </h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="text-lg p-2 hover:bg-gray-100 rounded"
              onClick={() => setCollapsed(!collapsed)}
            >
              ☰
            </button>
          </div>
          
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: handleMenuClick
            }}
            placement="bottomRight"
          >
            <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
              <Avatar icon={<UserOutlined />} className="mr-2" />
              <Space>
                <span className="text-gray-700">{currentUser.name}</span>
                <span className="text-xs text-gray-500">
                  {currentUser.role === 'admin' ? '管理员' : '用户'}
                </span>
              </Space>
            </div>
          </Dropdown>
        </Header>
        
        <Content className="bg-gray-50 min-h-screen">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  )
} 