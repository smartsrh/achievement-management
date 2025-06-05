'use client'
import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  message,
  Space,
  Tag,
  Popconfirm,
  Drawer
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  DownloadOutlined 
} from '@ant-design/icons'
import { supabase, ACHIEVEMENT_CATEGORIES } from '../../lib/supabase'
import dayjs from 'dayjs'
import DynamicAchievementForm from './DynamicAchievementForm'

interface Achievement {
  id: string
  title: string
  category: string
  abstract?: string
  keywords?: string
  doi?: string
  full_text_link?: string
  funding_info?: string
  notes?: string
  created_at: string
  updated_at: string
  
  // 作者信息
  authors?: any[]
  
  // 详情信息 - 根据类型动态包含
  details?: any
}

interface AchievementManagerProps {
  category: string
  onBack: () => void
}

const AchievementManager: React.FC<AchievementManagerProps> = ({ category, onBack }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Achievement | null>(null)
  const [viewingRecord, setViewingRecord] = useState<Achievement | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchAchievements()
  }, [category])

  const fetchAchievements = async () => {
    setLoading(true)
    try {
      // 首先获取主表数据
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (achievementsError) throw achievementsError

      // 获取作者信息
      const achievementIds = achievementsData?.map((item: any) => item.id) || []
      const { data: authorsData, error: authorsError } = await supabase
        .from('achievement_authors')
        .select('*')
        .in('achievement_id', achievementIds)
        .order('author_order')

      if (authorsError) throw authorsError

      // 根据类型获取详情数据
      let detailsData: any[] = []
      if (achievementIds.length > 0) {
        const detailsTable = getDetailsTableName(category)
        if (detailsTable) {
          const { data, error } = await supabase
            .from(detailsTable)
            .select('*')
            .in('achievement_id', achievementIds)
          
          if (!error) {
            detailsData = data || []
          }
        }
      }

      // 组合数据
      const formattedData = achievementsData?.map((achievement: any) => {
        const authors = authorsData?.filter((author: any) => author.achievement_id === achievement.id) || []
        const details = detailsData?.find((detail: any) => detail.achievement_id === achievement.id)
        
        return {
          ...achievement,
          authors,
          details
        }
      }) || []

      setAchievements(formattedData)
      message.success(`成功加载 ${formattedData.length} 条${ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES]}记录`)
    } catch (error) {
      console.error('获取成果列表失败:', error)
      message.error('获取数据失败，请检查网络连接和数据库配置')
    } finally {
      setLoading(false)
    }
  }

  const getDetailsTableName = (category: string): string | null => {
    const tableMap: Record<string, string> = {
      'journal_paper': 'journal_papers',
      'conference_paper': 'conference_papers',
      'book': 'books',
      'patent': 'patents',
      'conference_report': 'conference_reports',
      'standard': 'standards',
      'software_copyright': 'software_copyrights',
      'research_award': 'research_awards',
      'talent_training': 'talent_training',
      'academic_conference': 'academic_conferences',
      'tech_transfer': 'tech_transfers',
      'other_research': 'other_research'
    }
    return tableMap[category] || null
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({
      authors: [{ author_name: '', author_order: 1, author_type: 'other' }]
    })
    setModalVisible(true)
  }

  const handleEdit = (record: Achievement) => {
    setEditingRecord(record)
    
    // 准备表单数据
    const formData = {
      ...record,
      ...record.details,
      authors: record.authors?.map(author => ({
        author_name: author.author_name,
        author_order: author.author_order,
        author_type: author.author_type
      })) || [{ author_name: '', author_order: 1, author_type: 'other' }]
    }

    // 处理日期字段
    const dateFields = getDateFieldsForCategory(category)
    dateFields.forEach(field => {
      if (formData[field]) {
        formData[field] = dayjs(formData[field])
      }
    })

    form.setFieldsValue(formData)
    setModalVisible(true)
  }

  const getDateFieldsForCategory = (category: string): string[] => {
    const dateFieldsMap: Record<string, string[]> = {
      'journal_paper': ['publish_date'],
      'conference_paper': ['publish_date', 'conference_start_date', 'conference_end_date'],
      'patent': ['application_date', 'effective_start_date', 'effective_end_date'],
      'conference_report': ['start_date', 'end_date'],
      // 可以继续添加其他类型...
    }
    return dateFieldsMap[category] || []
  }

  const handleView = (record: Achievement) => {
    setViewingRecord(record)
    setDrawerVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      // Supabase 级联删除会自动处理相关表的数据
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id)

      if (error) throw error

      message.success('删除成功')
      fetchAchievements()
    } catch (error) {
      console.error('删除失败:', error)
      message.error('删除失败，请重试')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const { authors, ...mainData } = values
      
      // 准备主表数据
      const achievementData = {
        title: mainData.title,
        category: category,
        abstract: mainData.abstract,
        keywords: mainData.keywords,
        doi: mainData.doi,
        full_text_link: mainData.full_text_link,
        funding_info: mainData.funding_info,
        notes: mainData.notes
      }

      // 准备详情表数据
      const detailsData = getDetailsDataForCategory(category, mainData)

      let achievementId: string

      if (editingRecord) {
        // 更新操作
        achievementId = editingRecord.id

        // 更新主表
        const { error: mainError } = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', achievementId)

        if (mainError) throw mainError

        // 更新详情表
        if (detailsData && Object.keys(detailsData).length > 0) {
          const detailsTable = getDetailsTableName(category)
          if (detailsTable) {
            const { error: detailsError } = await supabase
              .from(detailsTable)
              .upsert({ ...detailsData, achievement_id: achievementId })

            if (detailsError) throw detailsError
          }
        }

        // 删除现有作者关联，重新插入
        await supabase
          .from('achievement_authors')
          .delete()
          .eq('achievement_id', achievementId)

      } else {
        // 新增操作
        const { data: newAchievement, error: mainError } = await supabase
          .from('achievements')
          .insert([achievementData])
          .select()
          .single()

        if (mainError) throw mainError
        achievementId = newAchievement.id

        // 插入详情表
        if (detailsData && Object.keys(detailsData).length > 0) {
          const detailsTable = getDetailsTableName(category)
          if (detailsTable) {
            const { error: detailsError } = await supabase
              .from(detailsTable)
              .insert([{ ...detailsData, achievement_id: achievementId }])

            if (detailsError) throw detailsError
          }
        }
      }

      // 插入作者关联
      if (authors && authors.length > 0) {
        const authorsData = authors.map((author: any) => ({
          achievement_id: achievementId,
          author_name: author.author_name,
          author_order: author.author_order || 1,
          author_type: author.author_type || 'other'
        }))

        const { error: authorsError } = await supabase
          .from('achievement_authors')
          .insert(authorsData)

        if (authorsError) throw authorsError
      }

      message.success(editingRecord ? '更新成功' : '添加成功')
      setModalVisible(false)
      form.resetFields()
      fetchAchievements()
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请检查输入数据')
    }
  }

  const getDetailsDataForCategory = (category: string, formData: any) => {
    // 移除通用字段，只保留详情表字段
    const { title, abstract, keywords, doi, full_text_link, funding_info, notes, authors, ...detailsData } = formData
    
    // 处理日期字段
    const dateFields = getDateFieldsForCategory(category)
    dateFields.forEach(field => {
      if (detailsData[field] && dayjs.isDayjs(detailsData[field])) {
        detailsData[field] = detailsData[field].format('YYYY-MM-DD')
      }
    })

    // 处理特定字段类型转换
    if (category === 'journal_paper' || category === 'conference_paper') {
      if (detailsData.indexed_by && Array.isArray(detailsData.indexed_by)) {
        // Checkbox.Group 返回的是数组，数据库需要数组格式
      }
    }

    return detailsData
  }

  const handleExport = () => {
    const csvContent = achievements.map(item => {
      const authors = item.authors?.map(a => a.author_name).join(', ') || ''
      const details = item.details || {}
      return `"${item.title}","${authors}","${details.publish_date || details.application_date || ''}","${item.abstract || ''}","${item.keywords || ''}"`
    }).join('\n')
    
    const header = '标题,作者,日期,摘要,关键词\n'
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES]}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    message.success('数据导出成功')
  }

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'authors',
      key: 'authors',
      width: '25%',
      render: (authors: any[]) => (
        <div>
          {authors?.slice(0, 3).map((author, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 2 }}>
              {author.author_name}
            </Tag>
          )) || []}
          {authors && authors.length > 3 && <Tag color="default">+{authors.length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: '日期',
      dataIndex: 'details',
      key: 'date',
      width: '15%',
      render: (details: any) => {
        const date = details?.publish_date || details?.application_date || details?.start_date
        return date ? dayjs(date).format('YYYY-MM-DD') : '-'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: '15%',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_: any, record: Achievement) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            size="small"
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const categoryName = ACHIEVEMENT_CATEGORIES[category as keyof typeof ACHIEVEMENT_CATEGORIES] || category

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button onClick={onBack} style={{ marginRight: 16 }}>
            ← 返回概览
          </Button>
          <h2 style={{ display: 'inline', margin: 0 }}>
            {categoryName}管理
          </h2>
        </div>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出数据
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加{categoryName}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={achievements}
        rowKey="id"
        loading={loading}
        pagination={{
          total: achievements.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      {/* 添加/编辑模态框 */}
      <Modal
        title={editingRecord ? `编辑${categoryName}` : `添加${categoryName}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={1000}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <DynamicAchievementForm 
            category={category} 
            form={form}
            initialValues={editingRecord}
          />
        </Form>
      </Modal>

      {/* 查看详情抽屉 */}
      <Drawer
        title={`${categoryName}详情`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {viewingRecord && (
          <div>
            <h3>{viewingRecord.title}</h3>
            <p><strong>作者：</strong>{viewingRecord.authors?.map(a => a.author_name).join(', ') || '无'}</p>
            {viewingRecord.abstract && <p><strong>摘要：</strong>{viewingRecord.abstract}</p>}
            {viewingRecord.keywords && <p><strong>关键词：</strong>{viewingRecord.keywords}</p>}
            {viewingRecord.doi && <p><strong>DOI：</strong>{viewingRecord.doi}</p>}
            {viewingRecord.funding_info && <p><strong>基金标注：</strong>{viewingRecord.funding_info}</p>}
            <p><strong>创建时间：</strong>{dayjs(viewingRecord.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
            {viewingRecord.details && (
              <div>
                <h4>详细信息：</h4>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12 }}>
                  {JSON.stringify(viewingRecord.details, null, 2)}
                </pre>
              </div>
            )}
            {viewingRecord.notes && (
              <div>
                <strong>备注：</strong>
                <p style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  {viewingRecord.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AchievementManager 