'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from 'antd'
import { 
  TrophyOutlined, FileTextOutlined, BookOutlined, TeamOutlined,
  BankOutlined, CalendarOutlined, RiseOutlined
} from '@ant-design/icons'
import { getAllAchievements, getAllUsers, ACHIEVEMENT_CATEGORIES, Achievement, AchievementCategory, getStatistics, getAchievements, AchievementQuery } from '../../lib/supabase'

interface OverallStatsProps {
  currentUser: any
  onNavigate?: (page: string) => void
}

export default function OverallStats({ currentUser, onNavigate }: OverallStatsProps) {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([])
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    loadOverallStats()
  }, [])

  const loadOverallStats = async () => {
    try {
      setLoading(true)
      
      // 使用更简单的统计查询
      const statistics = await getStatistics()
      console.log('整体统计数据:', statistics) // 调试日志
      
      // 获取用户数量
      const users = await getAllUsers()
      setUserCount(users.length)
      
      // 设置统计数据 - 修复字段映射
      const categoryStats: Record<string, number> = {}
      Object.entries(statistics.categoryStats).forEach(([key, value]) => {
        categoryStats[key] = value as number
      })
      setStats(categoryStats)
      
      // 获取最近的成果（通过简单查询）
      const recentQuery: AchievementQuery = {
        page: 1,
        page_size: 15,
        sort_by: 'created_at',
        sort_order: 'desc'
      }
      const recentData = await getAchievements(recentQuery)
      setRecentAchievements(recentData.data)
      
    } catch (error) {
      message.error('加载统计数据失败：' + (error instanceof Error ? error.message : '未知错误'))
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      journal_paper: <FileTextOutlined />,
      conference_paper: <BookOutlined />,
      book: <BookOutlined />,
      patent: <BankOutlined />,
      conference_report: <TeamOutlined />,
      standard: <FileTextOutlined />,
      software_copyright: <FileTextOutlined />,
      research_award: <TrophyOutlined />,
      talent_training: <TeamOutlined />,
      academic_conference: <CalendarOutlined />,
      tech_transfer: <RiseOutlined />,
      other_research: <FileTextOutlined />
    }
    return iconMap[category] || <FileTextOutlined />
  }

  const getTypeColor = (category: string) => {
    const colorMap: Record<string, string> = {
      journal_paper: 'blue',
      conference_paper: 'green',
      book: 'purple',
      patent: 'orange',
      conference_report: 'cyan',
      standard: 'red',
      software_copyright: 'magenta',
      research_award: 'gold',
      talent_training: 'lime',
      academic_conference: 'geekblue',
      tech_transfer: 'volcano',
      other_research: 'default'
    }
    return colorMap[category] || 'default'
  }

  const columns = [
    {
      title: '成果标题',
      dataIndex: 'title',
      key: 'title',
      width: '40%',
      render: (text: string) => (
        <div className="truncate" title={text}>
          {text}
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'category',
      key: 'category',
      width: '20%',
      render: (category: AchievementCategory) => (
        <Tag color={getTypeColor(category)} icon={getTypeIcon(category)}>
          {ACHIEVEMENT_CATEGORIES[category] || category}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '20%',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at', 
      key: 'updated_at',
      width: '20%',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN')
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  const totalAchievements = Object.values(stats).reduce((sum: number, count: number) => sum + count, 0)

  const handleCategoryClick = (category: AchievementCategory) => {
    if (onNavigate) {
      onNavigate(`achievement-${category}`)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">单位整体成果统计</h1>
        <p className="text-gray-600">全单位科研成果概览与统计分析</p>
      </div>

      {/* 总体统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="成果总数"
              value={totalAchievements}
              prefix={<TrophyOutlined className="text-blue-600" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="研究人员"
              value={userCount}
              prefix={<TeamOutlined className="text-green-600" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="期刊论文"
              value={stats.journal_paper || 0}
              prefix={<FileTextOutlined className="text-purple-600" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="发明专利"
              value={stats.patent || 0}
              prefix={<BankOutlined className="text-orange-600" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 各类型成果统计 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="成果类型分布" className="h-full">
            <Row gutter={[8, 8]}>
              {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, label]) => (
                <Col xs={12} sm={8} key={key}>
                  <div 
                    className="text-center p-2 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => handleCategoryClick(key as AchievementCategory)}
                    title={`点击查看${label}详情`}
                  >
                    <div className="text-lg font-semibold text-blue-600">
                      {stats[key] || 0}
                    </div>
                    <div className="text-xs text-gray-600 truncate" title={label}>
                      {label}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="最新成果" className="h-full">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentAchievements.slice(0, 8).map((achievement) => (
                <div key={achievement.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex-1 truncate">
                    <div className="text-sm font-medium truncate" title={achievement.title}>
                      {achievement.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <Tag color={getTypeColor(achievement.category as AchievementCategory)}>
                    {ACHIEVEMENT_CATEGORIES[achievement.category as AchievementCategory]}
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近成果详细列表 */}
      <Card title="最近成果详情" className="mb-6">
        <Table
          columns={columns}
          dataSource={recentAchievements}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  )
} 