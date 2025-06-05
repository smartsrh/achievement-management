'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Switch, message, Spin } from 'antd'
import { 
  TrophyOutlined, FileTextOutlined, BookOutlined, TeamOutlined,
  BankOutlined, CalendarOutlined, RiseOutlined, GiftOutlined
} from '@ant-design/icons'
import { getUserAchievementStats, getAchievements, ACHIEVEMENT_CATEGORIES, User, AchievementCategory } from '../../lib/supabase'

interface UserDashboardProps {
  user: User
  onNavigate?: (page: string, params?: any) => void
}

export default function UserDashboard({ user, onNavigate }: UserDashboardProps) {
  const [stats, setStats] = useState<any>({})
  const [recentAchievements, setRecentAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyFirstOrCorresponding, setOnlyFirstOrCorresponding] = useState(false)

  useEffect(() => {
    loadStats()
  }, [onlyFirstOrCorresponding])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // 获取用户成果统计
      const userStats = await getUserAchievementStats(user.id, onlyFirstOrCorresponding)
      console.log('用户统计数据:', userStats) // 调试日志
      setStats(userStats)
      
      // 获取最近成果
      const recentData = await getAchievements({
        user_id: user.id, // 修改：使用user_id而不是author_name
        page: 1,
        page_size: 5,
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      setRecentAchievements(recentData.data)
      
    } catch (error) {
      message.error('加载统计数据失败')
      console.error('Error loading user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: AchievementCategory) => {
    if (onNavigate) {
      onNavigate(`achievement-${category}`, { user_id: user.id }) // 修改：使用user_id
    }
  }

  const getTypeIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
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

  // 生成图表数据 - 修复字段映射
  const chartData = stats.monthlyTrend ? stats.monthlyTrend.map((item: any) => ({
    month: item.month,
    count: item.count
  })) : []

  // 计算今年成果数量
  const currentYear = new Date().getFullYear()
  const thisYearCount = recentAchievements.filter(achievement => 
    new Date(achievement.created_at).getFullYear() === currentYear
  ).length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">个人成果统计</h1>
        <p className="text-gray-600">您的科研成果概览与统计分析</p>
        
        {/* 统计开关 */}
        <div className="mt-4 flex items-center space-x-4">
          <Switch
            checked={onlyFirstOrCorresponding}
            onChange={setOnlyFirstOrCorresponding}
            loading={loading}
          />
          <span className="text-gray-700">只统计第一或通讯作者</span>
          <span className="text-xs text-gray-500">
            关闭时统计所有参与的成果，开启时只统计第一作者、通讯作者及共同第一/通讯作者的成果
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* 总体统计 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="成果总数"
                  value={stats.totalCount || 0}
                  prefix={<TrophyOutlined className="text-blue-600" />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="今年成果"
                  value={thisYearCount}
                  prefix={<CalendarOutlined className="text-green-600" />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="期刊论文"
                  value={stats.categoryStats?.journal_paper || 0}
                  prefix={<FileTextOutlined className="text-purple-600" />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="发明专利"
                  value={stats.categoryStats?.patent || 0}
                  prefix={<BankOutlined className="text-orange-600" />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          {/* 成果类型分布和趋势图 */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={12}>
              <Card title="成果类型分布" className="h-full">
                <Row gutter={[8, 8]}>
                  {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, label]) => {
                    const count = stats.categoryStats?.[key] || 0
                    return (
                      <Col xs={12} sm={8} key={key}>
                        <div 
                          className="text-center p-3 border rounded cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          onClick={() => handleCategoryClick(key as AchievementCategory)}
                          title={`点击查看${label}详情`}
                        >
                          <div className="text-lg font-semibold text-blue-600 mb-1">
                            {count}
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={label}>
                            {label}
                          </div>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </Card>
            </Col>
            
            <Col xs={24} lg={12}>
              <Card title="最近6个月趋势" className="h-full">
                {chartData.length > 0 ? (
                  <div className="space-y-2">
                    {chartData.map((item: any) => (
                      <div key={item.month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{item.month}</span>
                        <span className="text-blue-600 font-semibold">{item.count} 个成果</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    最近6个月暂无数据
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* 最近成果 */}
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="最近成果" className="h-full">
                {recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement, index) => (
                      <div key={achievement.id} className="flex items-start space-x-3 p-3 border rounded hover:bg-gray-50">
                        <div className="flex-shrink-0 text-blue-600">
                          {getTypeIcon(achievement.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate" title={achievement.title}>
                            {achievement.title}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {ACHIEVEMENT_CATEGORIES[achievement.category as AchievementCategory]} • 
                            {new Date(achievement.created_at).toLocaleDateString('zh-CN')}
                          </div>
                          {achievement.abstract && (
                            <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {achievement.abstract.substring(0, 80)}...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    暂无成果数据
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  )
} 