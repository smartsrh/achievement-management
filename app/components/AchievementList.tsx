'use client'

import React, { useState, useEffect } from 'react'
import { 
  Table, Card, Form, Input, Select, DatePicker, Button, Space, 
  Tag, Tooltip, Modal, Descriptions, message, Row, Col, Divider,
  Popconfirm, Checkbox
} from 'antd'
import { 
  SearchOutlined, FilterOutlined, EyeOutlined, 
  ReloadOutlined, DownloadOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined, CalendarOutlined
} from '@ant-design/icons'
import { 
  getAchievements, getAllAuthors, Achievement, AchievementQuery,
  ACHIEVEMENT_CATEGORIES, AchievementCategory, User, deleteAchievement 
} from '../../lib/supabase'
import AchievementForm from './AchievementForm'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface AchievementListProps {
  currentUser: User
  category?: AchievementCategory
  showUserFilter?: boolean
  navigationParams?: any
}

// 添加日期过滤器状态接口
interface DateFilter {
  start_date?: string
  end_date?: string
}

export default function AchievementList({ 
  currentUser, 
  category, 
  showUserFilter = true,
  navigationParams 
}: AchievementListProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [query, setQuery] = useState<AchievementQuery>({
    category,
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_order: 'desc'
  })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [searchForm] = Form.useForm()
  
  // 新增状态用于表单模态框
  const [formModalVisible, setFormModalVisible] = useState(false)
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null)
  const [onlyFirstOrCorresponding, setOnlyFirstOrCorresponding] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState<string>('')

  // 添加日期过滤器状态
  const [dateFilters, setDateFilters] = useState<Record<string, DateFilter>>({})

  useEffect(() => {
    // 当category属性改变时，更新查询条件
    setQuery(prev => ({
      ...prev,
      category,
      page: 1 // 重置到第一页
    }))
    setPagination(prev => ({
      ...prev,
      current: 1 // 同时重置分页状态
    }))
  }, [category])

  useEffect(() => {
    // 当navigationParams改变时，应用搜索参数
    if (navigationParams) {
      setQuery(prev => ({
        ...prev,
        ...navigationParams,
        category,
        page: 1
      }))
      
      setPagination(prev => ({
        ...prev,
        current: 1 // 重置分页状态
      }))
      
      // 同时更新搜索表单
      if (navigationParams.author_name) {
        searchForm.setFieldsValue({
          author_name: navigationParams.author_name
        })
      }
    }
  }, [navigationParams, category])

  useEffect(() => {
    loadAchievements()
    loadAuthors()
  }, [])

  useEffect(() => {
    loadAchievements()
  }, [query])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      console.log('Loading achievements with query:', query) // 调试日志
      const result = await getAchievements(query)
      console.log('Achievement result:', result) // 调试日志
      setAchievements(result.data)
      setPagination({
        current: result.page || 1,
        pageSize: result.page_size || 10,
        total: result.count
      })
      console.log('Updated pagination:', {
        current: result.page || 1,
        pageSize: result.page_size || 10,
        total: result.count
      }) // 调试日志
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取成果列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAuthors = async () => {
    try {
      const authorList = await getAllAuthors()
      setAuthors(authorList)
    } catch (error) {
      console.error('获取作者列表失败:', error)
    }
  }

  const handleSearch = (values: any) => {
    const newQuery: AchievementQuery = {
      ...query,
      keyword: values.keyword || undefined,
      author_name: values.author_name || undefined,
      category: values.category || category,
      user_id: showUserFilter ? values.user_id : undefined,
      // 移除通用的start_date和end_date，改为使用dateFilters
      page: 1,
      // 只有在选择了作者且勾选了复选框时才添加过滤参数
      only_first_or_corresponding: values.author_name && onlyFirstOrCorresponding,
      // 添加日期过滤器到查询
      date_filters: Object.keys(dateFilters).length > 0 ? dateFilters : undefined
    }
    setQuery(newQuery)
    setPagination(prev => ({
      ...prev,
      current: 1 // 重置分页状态
    }))
  }

  const handleReset = () => {
    searchForm.resetFields()
    setOnlyFirstOrCorresponding(false)
    setSelectedAuthor('')
    setDateFilters({}) // 重置日期过滤器
    const resetQuery: AchievementQuery = {
      category,
      page: 1,
      page_size: 10,
      sort_by: 'created_at',
      sort_order: 'desc' as 'desc'
    }
    setQuery(resetQuery)
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0
    })
  }

  // 添加日期过滤器处理函数
  const handleDateFilterChange = (fieldKey: string, dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      const newDateFilters = {
        ...dateFilters,
        [fieldKey]: {
          start_date: dates[0].format('YYYY-MM-DD'),
          end_date: dates[1].format('YYYY-MM-DD')
        }
      }
      setDateFilters(newDateFilters)
      
      // 自动应用过滤器
      const newQuery: AchievementQuery = {
        ...query,
        page: 1,
        date_filters: newDateFilters
      }
      setQuery(newQuery)
      setPagination(prev => ({ ...prev, current: 1 }))
    } else {
      // 清除过滤器
      const newDateFilters = { ...dateFilters }
      delete newDateFilters[fieldKey]
      setDateFilters(newDateFilters)
      
      const newQuery: AchievementQuery = {
        ...query,
        page: 1,
        date_filters: Object.keys(newDateFilters).length > 0 ? newDateFilters : undefined
      }
      setQuery(newQuery)
      setPagination(prev => ({ ...prev, current: 1 }))
    }
  }

  // 创建日期过滤器组件
  const createDateFilter = (fieldKey: string, placeholder: string = '选择日期范围') => ({
    filterDropdown: ({ confirm, clearFilters }: any) => (
      <div style={{ padding: 8, width: 280 }}>
        <RangePicker
          value={dateFilters[fieldKey] ? [
            dayjs(dateFilters[fieldKey].start_date),
            dayjs(dateFilters[fieldKey].end_date)
          ] : [null, null]}
          onChange={(dates) => {
            handleDateFilterChange(fieldKey, dates)
            confirm()
          }}
          placeholder={['开始日期', '结束日期']}
          style={{ width: '100%', marginBottom: 8 }}
          allowClear
        />
        <div style={{ textAlign: 'center' }}>
          <Button
            type="link"
            size="small"
            onClick={() => {
              handleDateFilterChange(fieldKey, null)
              clearFilters()
            }}
          >
            清除
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <CalendarOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    filtered: !!dateFilters[fieldKey]
  })

  // 创建状态过滤器（用于专利状态等）
  const createStatusFilter = (statusOptions: { value: string; label: string; color?: string }[]) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div style={{ padding: 8, width: 200 }}>
        <Select
          style={{ width: '100%', marginBottom: 8 }}
          placeholder="选择状态"
          allowClear
          value={selectedKeys[0]}
          onChange={(value) => {
            setSelectedKeys(value ? [value] : [])
          }}
        >
          {statusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              <Tag color={option.color || 'default'}>{option.label}</Tag>
            </Option>
          ))}
        </Select>
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 70 }}
            >
              确定
            </Button>
            <Button
              onClick={() => {
                clearFilters()
                confirm()
              }}
              size="small"
              style={{ width: 70 }}
            >
              重置
            </Button>
          </Space>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Button
            size="small"
            type="link"
            onClick={() => {
              setSelectedKeys(['granted'])
              confirm()
            }}
          >
            只看已授权
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: Achievement) => {
      const status = record.patent?.status
      return status === value
    },
  })

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    console.log('Table change event:', { pagination, filters, sorter }) // 调试日志
    
    // 只处理分页，不处理排序（排序由antd的Table组件内部处理）
    const newQuery = {
      ...query,
      page: pagination.current,
      page_size: pagination.pageSize
    }

    // 注释掉后端排序逻辑，改为前端排序
    // if (sorter.field && sorter.order) {
    //   newQuery.sort_by = sorter.field
    //   newQuery.sort_order = sorter.order === 'ascend' ? 'asc' : 'desc'
    // }

    console.log('Setting new query:', newQuery) // 调试日志
    setQuery(newQuery)
  }

  const showDetail = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setDetailModalVisible(true)
  }

  // 添加成果
  const handleAdd = () => {
    setEditingAchievement(null)
    setFormModalVisible(true)
  }

  // 编辑成果
  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    setFormModalVisible(true)
  }

  // 删除成果
  const handleDelete = async (achievement: Achievement) => {
    try {
      await deleteAchievement(achievement.id)
      message.success('成果删除成功！')
      loadAchievements() // 刷新列表
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败')
    }
  }

  // 表单提交成功后的回调
  const handleFormSuccess = () => {
    loadAchievements() // 刷新列表
    setFormModalVisible(false)
    setEditingAchievement(null)
  }

  // 导出CSV功能
  const handleExportCSV = async () => {
    try {
      setExportLoading(true)
      
      // 获取所有符合查询条件的数据（不分页）
      const exportQuery: AchievementQuery = {
        ...query,
        page: 1,
        page_size: 10000, // 设置一个很大的数量来获取所有数据
      }
      
      const result = await getAchievements(exportQuery)
      const allAchievements = result.data
      
      if (!allAchievements || allAchievements.length === 0) {
        message.warning('当前查询结果为空，无法导出')
        return
      }
      
      // 生成CSV内容
      const csvContent = generateCSVContent(allAchievements)
      
      // 下载CSV文件
      downloadCSV(csvContent, getExportFileName())
      
      message.success(`成功导出 ${allAchievements.length} 条记录`)
      
    } catch (error) {
      console.error('导出CSV失败:', error)
      message.error('导出失败，请重试')
    } finally {
      setExportLoading(false)
    }
  }

  // 生成CSV内容
  const generateCSVContent = (data: Achievement[]): string => {
    if (!data || data.length === 0) return ''
    
    // 根据成果类型生成不同的列头
    const headers = getCSVHeaders()
    
    // 生成CSV行数据
    const rows = data.map(achievement => {
      return getCSVRowData(achievement)
    })
    
    // 组合CSV内容
    const csvLines = [headers, ...rows]
    return csvLines.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`) // 处理CSV特殊字符
        .join(',')
    ).join('\n')
  }

  // 获取CSV列头
  const getCSVHeaders = (): string[] => {
    const baseHeaders = [
      '成果标题',
      '成果类型',
      '作者',
      '第一作者',
      '通讯作者',
      'DOI',
      '关键词',
      '摘要',
      '全文链接',
      '创建时间'
    ]
    
    // 根据成果类型添加特定列头
    if (category) {
      return [...baseHeaders, ...getCategorySpecificHeaders(category)]
    } else {
      // 通用导出时包含所有可能的字段
      return [
        ...baseHeaders,
        '期刊名称', '发表日期', '期刊级别', '影响因子', '收录情况',
        '会议名称', '会议日期', '会议地点', '论文类型',
        '出版社', '出版日期', 'ISBN', '页数',
        '申请号', '专利类型', '申请日期', '专利状态', '申请国家',
        '会议报告类型', '报告日期', '报告地点',
        '标准号', '标准类型', '发布机构',
        '登记号', '完成日期', '取得方式',
        '奖项类型', '奖项级别', '获奖日期', '颁奖机构',
        '培养对象', '培养类型', '开始日期', '结束日期',
        '举办会议类型', '参会人数', '负责人',
        '转让方', '交易金额', '合同日期',
        '研究类型', '数据描述'
      ]
    }
  }

  // 获取特定成果类型的列头
  const getCategorySpecificHeaders = (category: AchievementCategory): string[] => {
    switch (category) {
      case 'journal_paper':
        return ['期刊名称', '发表日期', '期刊级别', '影响因子', '卷', '期', '页码', '被引次数', '收录情况', '状态', '语言']
      
      case 'conference_paper':
        return ['会议名称', '会议开始日期', '会议结束日期', '会议地点', '论文类型', '语言', '页码', '主办方', '被引次数']
      
      case 'book':
        return ['出版社', '出版日期', 'ISBN', '页数', '语言', '出版状态', '丛书名', '编辑', '国家', '城市', '字数']
      
      case 'patent':
        return ['申请国家', '申请号', '公开号', 'IPC分类号', 'CPC分类号', '专利类型', '申请日期', '生效开始日期', '生效结束日期', '专利状态', '专利权人', '发证机构', '产业化状态', '交易金额']
      
      case 'conference_report':
        return ['会议名称', '开始日期', '结束日期', '地点', '报告类型', '会议类型', '国家/地区']
      
      case 'standard':
        return ['标准号', '标准类型', '发布日期', '发布机构', '标准类别', '负责单位']
      
      case 'software_copyright':
        return ['登记号', '完成日期', '取得方式', '权利范围', '权利描述']
      
      case 'research_award':
        return ['奖项类型', '奖项级别', '获奖日期', '颁奖机构', '国家/地区', '证书编号']
      
      case 'talent_training':
        return ['培养对象', '培养类型', '培养类别', '开始日期', '结束日期', '报告完成情况', '报告题目', '合作导师', '是否主要参与者']
      
      case 'academic_conference':
        return ['会议类型', '会议名称', '开始日期', '结束日期', '地点', '主办方', '负责人', '参会人数']
      
      case 'tech_transfer':
        return ['结果类型', '转让形式', '合同日期', '交易金额', '受让方', '合作伙伴', '申请状态', '受益状态']
      
      case 'other_research':
        return ['研究类型', '数据描述', '共享范围']
      
      default:
        return []
    }
  }

  // 获取CSV行数据
  const getCSVRowData = (achievement: Achievement): string[] => {
    const authors = achievement.achievement_authors?.sort((a, b) => a.author_order - b.author_order) || []
    const authorNames = authors.map(a => a.author_name).join('; ')
    
    // 获取第一作者
    const firstAuthors = authors.filter(a => a.author_type === 'first' || a.author_type === 'co_first')
    const firstAuthorNames = firstAuthors.map(a => a.author_name).join('; ')
    
    // 获取通讯作者
    const correspondingAuthors = authors.filter(a => a.author_type === 'corresponding' || a.author_type === 'co_corresponding')
    const correspondingAuthorNames = correspondingAuthors.map(a => a.author_name).join('; ')
    
    const baseData = [
      achievement.title || '',
      ACHIEVEMENT_CATEGORIES[achievement.category] || '',
      authorNames,
      firstAuthorNames,
      correspondingAuthorNames,
      achievement.doi || '',
      achievement.keywords || '',
      achievement.abstract || '',
      achievement.full_text_link || '',
      dayjs(achievement.created_at).format('YYYY-MM-DD HH:mm:ss')
    ]
    
    // 添加特定类型的数据
    if (category) {
      return [...baseData, ...getCategorySpecificData(achievement, category)]
    } else {
      // 通用导出时填充所有可能的字段
      return [...baseData, ...getAllCategoryData(achievement)]
    }
  }

  // 获取特定成果类型的数据
  const getCategorySpecificData = (achievement: Achievement, category: AchievementCategory): string[] => {
    switch (category) {
      case 'journal_paper':
        const jp = achievement.journal_paper
        return [
          jp?.journal_name || '',
          jp?.publish_date || '',
          jp?.journal_level || '',
          jp?.impact_factor?.toString() || '',
          jp?.volume || '',
          jp?.issue || '',
          jp?.pages || '',
          jp?.citation_count?.toString() || '',
          jp?.indexed_by?.join('; ') || '',
          jp?.status === 'published' ? '已发表' : jp?.status === 'online' ? '在线发表' : '',
          jp?.language === 'chinese' ? '中文' : jp?.language === 'foreign' ? '外文' : ''
        ]
      
      case 'conference_paper':
        const cp = achievement.conference_paper
        return [
          cp?.conference_name || '',
          cp?.conference_start_date || '',
          cp?.conference_end_date || '',
          cp?.location || '',
          cp?.paper_type || '',
          cp?.language === 'chinese' ? '中文' : cp?.language === 'foreign' ? '外文' : '',
          cp?.pages || '',
          cp?.organizer || '',
          cp?.citation_count?.toString() || ''
        ]
      
      case 'book':
        const book = achievement.book
        return [
          book?.publisher || '',
          book?.publish_date || '',
          book?.isbn || '',
          book?.pages || '',
          book?.language === 'chinese' ? '中文' : book?.language === 'foreign' ? '外文' : '',
          book?.publication_status === 'published' ? '已出版' : book?.publication_status === 'pending' ? '待出版' : '',
          book?.series_name || '',
          book?.editor || '',
          book?.country || '',
          book?.city || '',
          book?.word_count?.toString() || ''
        ]
      
      case 'patent':
        const patent = achievement.patent
        return [
          patent?.patent_country || '',
          patent?.application_number || '',
          patent?.publication_number || '',
          patent?.ipc_number || '',
          patent?.cpc_number || '',
          patent?.patent_type || '',
          patent?.application_date || '',
          patent?.effective_start_date || '',
          patent?.effective_end_date || '',
          patent?.status === 'granted' ? '已授权' : patent?.status === 'applied' ? '已申请' : '',
          patent?.patent_holder || '',
          patent?.issuing_authority || '',
          patent?.commercialization_status || '',
          patent?.transaction_amount?.toString() || ''
        ]
      
      case 'conference_report':
        const cr = achievement.conference_report
        return [
          cr?.conference_name || '',
          cr?.start_date || '',
          cr?.end_date || '',
          cr?.location || '',
          cr?.report_type === 'invited' ? '邀请报告' : cr?.report_type === 'group' ? '分组报告' : cr?.report_type === 'poster' ? '海报展示' : '',
          cr?.conference_type === 'international' ? '国际会议' : cr?.conference_type === 'domestic' ? '国内会议' : '',
          cr?.country || ''
        ]
      
      case 'standard':
        const std = achievement.standard
        return [
          std?.standard_number || '',
          getStandardTypeText(std?.standard_type),
          std?.publish_date || '',
          std?.publishing_organization || '',
          std?.standard_category || '',
          std?.responsible_unit || ''
        ]
      
      case 'software_copyright':
        const sc = achievement.software_copyright
        return [
          sc?.registration_number || '',
          sc?.completion_date || '',
          sc?.acquisition_method === 'original' ? '原始取得' : sc?.acquisition_method === 'inherited' ? '继受取得' : '',
          sc?.rights_scope === 'full' ? '全部权利' : sc?.rights_scope === 'partial' ? '部分权利' : '',
          sc?.rights_description || ''
        ]
      
      case 'research_award':
        const ra = achievement.research_award
        return [
          ra?.award_type || '',
          ra?.award_level || '',
          ra?.award_date || '',
          ra?.awarding_organization || '',
          ra?.country || '',
          ra?.certificate_number || ''
        ]
      
      case 'talent_training':
        const tt = achievement.talent_training
        return [
          tt?.trainee_name || '',
          tt?.talent_type || '',
          tt?.training_category || '',
          tt?.work_start_date || '',
          tt?.work_end_date || '',
          tt?.report_completion === 'completed' ? '已完成' : tt?.report_completion === 'not_completed' ? '未完成' : '',
          tt?.report_title || '',
          tt?.collaborating_professor || '',
          tt?.is_main_participant ? '是' : '否'
        ]
      
      case 'academic_conference':
        const ac = achievement.academic_conference
        return [
          ac?.conference_type === 'international' ? '国际会议' : ac?.conference_type === 'domestic' ? '国内会议' : '',
          ac?.conference_name || '',
          ac?.start_date || '',
          ac?.end_date || '',
          ac?.location || '',
          ac?.organizer || '',
          ac?.responsible_person || '',
          ac?.participant_count?.toString() || ''
        ]
      
      case 'tech_transfer':
        const tt2 = achievement.tech_transfer
        return [
          tt2?.result_type || '',
          tt2?.transfer_form || '',
          tt2?.contract_date || '',
          tt2?.transaction_amount?.toString() || '',
          tt2?.beneficiary || '',
          tt2?.partner_company || '',
          tt2?.application_status || '',
          tt2?.benefit_status || ''
        ]
      
      case 'other_research':
        const or = achievement.other_research
        return [
          or?.research_type || '',
          or?.data_description || '',
          or?.sharing_scope || ''
        ]
      
      default:
        return []
    }
  }

  // 获取所有类型的数据（用于通用导出）
  const getAllCategoryData = (achievement: Achievement): string[] => {
    // 为通用导出填充所有可能的字段，未匹配的用空字符串
    const jp = achievement.journal_paper
    const cp = achievement.conference_paper
    const book = achievement.book
    const patent = achievement.patent
    const cr = achievement.conference_report
    const std = achievement.standard
    const sc = achievement.software_copyright
    const ra = achievement.research_award
    const tt = achievement.talent_training
    const ac = achievement.academic_conference
    const tt2 = achievement.tech_transfer
    const or = achievement.other_research
    
    return [
      // 期刊论文字段
      jp?.journal_name || '',
      jp?.publish_date || '',
      jp?.journal_level || '',
      jp?.impact_factor?.toString() || '',
      jp?.indexed_by?.join('; ') || '',
      
      // 会议论文字段
      cp?.conference_name || '',
      cp?.conference_start_date || '',
      cp?.location || '',
      cp?.paper_type || '',
      
      // 学术专著字段
      book?.publisher || '',
      book?.publish_date || '',
      book?.isbn || '',
      book?.pages || '',
      
      // 专利字段
      patent?.application_number || '',
      patent?.patent_type || '',
      patent?.application_date || '',
      patent?.status || '',
      patent?.patent_country || '',
      
      // 会议报告字段
      cr?.report_type || '',
      cr?.start_date || '',
      cr?.location || '',
      
      // 标准字段
      std?.standard_number || '',
      std?.standard_type || '',
      std?.publishing_organization || '',
      
      // 软件著作权字段
      sc?.registration_number || '',
      sc?.completion_date || '',
      sc?.acquisition_method || '',
      
      // 科研奖励字段
      ra?.award_type || '',
      ra?.award_level || '',
      ra?.award_date || '',
      ra?.awarding_organization || '',
      
      // 人才培养字段
      tt?.trainee_name || '',
      tt?.talent_type || '',
      tt?.work_start_date || '',
      tt?.work_end_date || '',
      
      // 举办学术会议字段
      ac?.conference_type || '',
      ac?.participant_count?.toString() || '',
      ac?.responsible_person || '',
      
      // 技术转移字段
      tt2?.beneficiary || '',
      tt2?.transaction_amount?.toString() || '',
      tt2?.contract_date || '-',
      tt2?.transfer_form || '-',
      
      // 其他研究字段
      or?.research_type || '',
      or?.data_description || ''
    ]
  }

  // 下载CSV文件
  const downloadCSV = (csvContent: string, filename: string) => {
    // 添加BOM标记以支持中文显示
    const BOM = '\uFEFF'
    const csvWithBOM = BOM + csvContent
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // 获取导出文件名
  const getExportFileName = (): string => {
    const timestamp = dayjs().format('YYYYMMDD_HHmmss')
    const categoryName = category ? ACHIEVEMENT_CATEGORIES[category] : '全部成果'
    return `${categoryName}_${timestamp}.csv`
  }

  // 根据成果类型渲染关键信息
  const renderKeyInfo = (record: Achievement) => {
    switch (record.category) {
      case 'journal_paper':
        const journal = record.journal_paper
        return journal ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">期刊:</span> {journal.journal_name}</div>
            {journal.publish_date && (
              <div><span className="font-medium">发表:</span> {journal.publish_date}</div>
            )}
            {journal.journal_level && (
              <div>
                <span className="font-medium">级别:</span> 
                <Tag color={
                  journal.journal_level === '1区' ? 'red' : 
                  journal.journal_level === '2区' ? 'orange' : 
                  journal.journal_level === '3区' ? 'blue' : 
                  journal.journal_level === '4区' ? 'green' : 
                  journal.journal_level === 'SCI' ? 'purple' : 
                  journal.journal_level === 'EI' ? 'cyan' : 'default'
                } className="ml-1 text-xs">
                  {journal.journal_level}
                </Tag>
              </div>
            )}
            {journal.indexed_by && journal.indexed_by.length > 0 && (
              <div>
                <span className="font-medium">收录:</span> 
                {journal.indexed_by.slice(0, 2).map((index, i) => (
                  <Tag key={i} color="blue" className="ml-1 text-xs">{index}</Tag>
                ))}
                {journal.indexed_by.length > 2 && <span className="text-gray-400">...</span>}
              </div>
            )}
            {journal.status && (
              <div>
                <Tag color={journal.status === 'published' ? 'green' : 'orange'} className="text-xs">
                  {journal.status === 'published' ? '已发表' : '在线发表'}
                </Tag>
              </div>
            )}
          </div>
        ) : null

      case 'conference_paper':
        const conference = record.conference_paper
        return conference ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">会议:</span> {conference.conference_name}</div>
            {conference.conference_start_date && (
              <div><span className="font-medium">日期:</span> {conference.conference_start_date}</div>
            )}
            {conference.location && (
              <div><span className="font-medium">地点:</span> {conference.location}</div>
            )}
            <div>
              {conference.paper_type && (
                <Tag color="green" className="text-xs">{conference.paper_type}</Tag>
              )}
              {conference.language && (
                <Tag color="blue" className="ml-1 text-xs">
                  {conference.language === 'chinese' ? '中文' : '外文'}
                </Tag>
              )}
            </div>
          </div>
        ) : null

      case 'book':
        const book = record.book
        return book ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">出版社:</span> {book.publisher}</div>
            {book.publish_date && (
              <div><span className="font-medium">出版:</span> {book.publish_date}</div>
            )}
            {book.isbn && (
              <div><span className="font-medium">ISBN:</span> {book.isbn}</div>
            )}
            <div>
              {book.language && (
                <Tag color="purple" className="text-xs">
                  {book.language === 'chinese' ? '中文' : '外文'}
                </Tag>
              )}
              {book.publication_status && (
                <Tag color="green" className="ml-1 text-xs">
                  {book.publication_status === 'published' ? '已出版' : '待出版'}
                </Tag>
              )}
            </div>
          </div>
        ) : null

      case 'patent':
        const patent = record.patent
        return patent ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">申请号:</span> {patent.application_number}</div>
            {patent.application_date && (
              <div><span className="font-medium">申请日期:</span> {patent.application_date}</div>
            )}
            <div>
              <Tag color={patent.status === 'granted' ? 'green' : 'orange'} className="text-xs">
                {patent.status === 'granted' ? '已授权' : '已申请'}
              </Tag>
              <Tag color="cyan" className="ml-1 text-xs">{patent.patent_type}</Tag>
              {patent.patent_country && (
                <Tag color="purple" className="ml-1 text-xs">{patent.patent_country}</Tag>
              )}
            </div>
          </div>
        ) : null

      case 'conference_report':
        const report = record.conference_report
        return report ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">会议:</span> {report.conference_name}</div>
            {report.start_date && (
              <div><span className="font-medium">日期:</span> {report.start_date}</div>
            )}
            {report.location && (
              <div><span className="font-medium">地点:</span> {report.location}</div>
            )}
            <div>
              {report.report_type && (
                <Tag color="orange" className="text-xs">{report.report_type}</Tag>
              )}
              {report.conference_type && (
                <Tag color="blue" className="ml-1 text-xs">
                  {report.conference_type === 'international' ? '国际会议' : '国内会议'}
                </Tag>
              )}
            </div>
          </div>
        ) : null

      case 'research_award':
        const award = record.research_award
        return award ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">奖项:</span> {award.award_type}</div>
            {award.award_date && (
              <div><span className="font-medium">获奖日期:</span> {award.award_date}</div>
            )}
            <div><span className="font-medium">颁奖机构:</span> {award.awarding_organization}</div>
            <div>
              <Tag color="gold" className="text-xs">{award.award_level}</Tag>
            </div>
          </div>
        ) : null

      case 'software_copyright':
        const software = record.software_copyright
        return software ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">登记号:</span> {software.registration_number}</div>
            {software.completion_date && (
              <div><span className="font-medium">完成日期:</span> {software.completion_date}</div>
            )}
            <div>
              {software.acquisition_method && (
                <Tag color="blue" className="text-xs">
                  {software.acquisition_method === 'original' ? '原始取得' : '继受取得'}
                </Tag>
              )}
              {software.rights_scope && (
                <Tag color="green" className="ml-1 text-xs">
                  {software.rights_scope === 'full' ? '全部权利' : '部分权利'}
                </Tag>
              )}
            </div>
          </div>
        ) : null

      case 'standard':
        const standard = record.standard
        return standard ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">标准号:</span> {standard.standard_number}</div>
            {standard.publish_date && (
              <div><span className="font-medium">发布日期:</span> {standard.publish_date}</div>
            )}
            {standard.publishing_organization && (
              <div><span className="font-medium">发布机构:</span> {standard.publishing_organization}</div>
            )}
            <div>
              <Tag color={getStandardTypeColor(standard.standard_type)} className="text-xs">
                {getStandardTypeText(standard.standard_type)}
              </Tag>
            </div>
          </div>
        ) : null

      case 'talent_training':
        const training = record.talent_training
        return training ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">培养对象:</span> {training.trainee_name}</div>
            {training.work_start_date && training.work_end_date && (
              <div><span className="font-medium">培养期间:</span> {training.work_start_date} - {training.work_end_date}</div>
            )}
            <div>
              <Tag color="blue" className="text-xs">{training.talent_type}</Tag>
              {training.training_category && (
                <Tag color="green" className="ml-1 text-xs">
                  {training.training_category === 'student' ? '学生' : '学术带头人'}
                </Tag>
              )}
            </div>
          </div>
        ) : null

      case 'academic_conference':
        const academicConf = record.academic_conference
        return academicConf ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">会议名称:</span> {academicConf.conference_name}</div>
            {academicConf.start_date && (
              <div><span className="font-medium">举办日期:</span> {academicConf.start_date}</div>
            )}
            {academicConf.location && (
              <div><span className="font-medium">举办地点:</span> {academicConf.location}</div>
            )}
            <div>
              <Tag color="orange" className="text-xs">
                {academicConf.conference_type === 'international' ? '国际会议' : '国内会议'}
              </Tag>
              {academicConf.participant_count && (
                <Tag color="blue" className="ml-1 text-xs">{academicConf.participant_count}人参会</Tag>
              )}
            </div>
          </div>
        ) : null

      case 'tech_transfer':
        const tech = record.tech_transfer
        return tech ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            {tech.result_type && (
              <div><span className="font-medium">成果类型:</span> {tech.result_type}</div>
            )}
            {tech.contract_date && (
              <div><span className="font-medium">合同日期:</span> {tech.contract_date}</div>
            )}
            {tech.transaction_amount && (
              <div><span className="font-medium">交易金额:</span> ¥{tech.transaction_amount.toLocaleString()}</div>
            )}
            {tech.partner_company && (
              <div><span className="font-medium">合作企业:</span> {tech.partner_company}</div>
            )}
          </div>
        ) : null

      case 'other_research':
        const other = record.other_research
        return other ? (
          <div className="text-xs text-gray-600 mt-1 space-y-1">
            <div><span className="font-medium">研究类型:</span> {other.research_type}</div>
            {other.data_description && (
              <div><span className="font-medium">数据描述:</span> {other.data_description.substring(0, 50)}...</div>
            )}
            {other.sharing_scope && (
              <div><span className="font-medium">共享范围:</span> {other.sharing_scope}</div>
            )}
          </div>
        ) : null

      default:
        return (
          <div className="text-xs text-gray-500 mt-1">
            {ACHIEVEMENT_CATEGORIES[record.category]}
          </div>
        )
    }
  }

  // 渲染作者信息，突出显示第一作者和通讯作者
  const renderAuthors = (record: Achievement) => {
    const authors = record.achievement_authors || []
    const sortedAuthors = authors.sort((a, b) => a.author_order - b.author_order)
    
    // 只有期刊论文和会议论文需要特殊标识第一作者和通讯作者
    const needsAuthorMarking = record.category === 'journal_paper' || record.category === 'conference_paper'
    
    return (
      <div className="space-y-1">
        {sortedAuthors.slice(0, 4).map((author, index) => {
          if (!needsAuthorMarking) {
            // 其他类型成果，简单显示作者姓名
            return (
              <Tag 
                key={author.id}
                color="default"
                className="mb-1 text-xs"
                style={{ fontSize: '11px' }}
              >
                {index + 1}. {author.author_name}
              </Tag>
            )
          }

          // 期刊论文和会议论文的特殊处理 - 严格按照数据库字段判断
          const isCorresponding = author.author_type === 'corresponding' || author.author_type === 'co_corresponding'
          const isFirst = author.author_type === 'first' || author.author_type === 'co_first'
          
          let tagColor = 'default'
          let authorName = author.author_name
          
          if (isFirst && isCorresponding) {
            tagColor = 'purple'
            authorName = `${author.author_name}¹*`
          } else if (isFirst) {
            tagColor = 'blue'
            authorName = `${author.author_name}¹`
          } else if (isCorresponding) {
            tagColor = 'green'
            authorName = `${author.author_name}*`
          }
          
          return (
            <Tag 
              key={author.id}
              color={tagColor}
              className="mb-1 text-xs"
              style={{ fontSize: '11px' }}
            >
              {index + 1}. {authorName}
            </Tag>
          )
        })}
        {authors.length > 4 && (
          <Tag color="default" className="text-xs">
            +{authors.length - 4}位作者
          </Tag>
        )}
      </div>
    )
  }

  // 详情模态框中的详细信息渲染函数
  const renderDetailInfo = (achievement: Achievement) => {
    switch (achievement.category) {
      case 'journal_paper':
        const journal = achievement.journal_paper
        return journal ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="期刊名称">{journal.journal_name}</Descriptions.Item>
            <Descriptions.Item label="发表日期">{journal.publish_date}</Descriptions.Item>
            <Descriptions.Item label="DOI">{achievement.doi || '-'}</Descriptions.Item>
            <Descriptions.Item label="语言">{journal.language === 'chinese' ? '中文' : '外文'}</Descriptions.Item>
            <Descriptions.Item label="状态">{journal.status === 'published' ? '已发表' : '在线发表'}</Descriptions.Item>
            <Descriptions.Item label="卷期页码">{`${journal.volume || ''} (${journal.issue || ''}) ${journal.pages || ''}`}</Descriptions.Item>
            <Descriptions.Item label="被引次数">{journal.citation_count}</Descriptions.Item>
            <Descriptions.Item label="影响因子">{journal.impact_factor}</Descriptions.Item>
            <Descriptions.Item label="期刊级别">
              {journal.journal_level && (
                <Tag color={
                  journal.journal_level === '1区' ? 'red' : 
                  journal.journal_level === '2区' ? 'orange' : 
                  journal.journal_level === '3区' ? 'blue' : 
                  journal.journal_level === '4区' ? 'green' : 
                  journal.journal_level === 'SCI' ? 'purple' : 
                  journal.journal_level === 'EI' ? 'cyan' : 'default'
                }>
                  {journal.journal_level}
                </Tag>
              )}
            </Descriptions.Item>
            {journal.indexed_by && (
              <Descriptions.Item label="收录情况" span={2}>
                {journal.indexed_by.map((index, i) => (
                  <Tag key={i} color="blue">{index}</Tag>
                ))}
              </Descriptions.Item>
            )}
            {achievement.abstract && (
              <Descriptions.Item label="摘要" span={2}>
                {achievement.abstract}
              </Descriptions.Item>
            )}
            {achievement.keywords && (
              <Descriptions.Item label="关键词" span={2}>
                {achievement.keywords}
              </Descriptions.Item>
            )}
            {achievement.full_text_link && (
              <Descriptions.Item label="全文链接" span={2}>
                <a href={achievement.full_text_link} target="_blank" rel="noopener noreferrer">
                  {achievement.full_text_link}
                </a>
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : null

      case 'conference_paper':
        const conference = achievement.conference_paper
        return conference ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="会议名称">{conference.conference_name}</Descriptions.Item>
            <Descriptions.Item label="会议开始日期">{conference.conference_start_date}</Descriptions.Item>
            <Descriptions.Item label="会议结束日期">{conference.conference_end_date}</Descriptions.Item>
            <Descriptions.Item label="会议地点">{conference.location}</Descriptions.Item>
            <Descriptions.Item label="论文类型">{conference.paper_type}</Descriptions.Item>
            <Descriptions.Item label="语言">{conference.language === 'chinese' ? '中文' : '外文'}</Descriptions.Item>
            <Descriptions.Item label="页码">{conference.pages}</Descriptions.Item>
            <Descriptions.Item label="文章号">{conference.article_number}</Descriptions.Item>
            <Descriptions.Item label="主办方">{conference.organizer}</Descriptions.Item>
            <Descriptions.Item label="发表日期">{conference.publish_date}</Descriptions.Item>
            <Descriptions.Item label="被引次数">{conference.citation_count}</Descriptions.Item>
            {conference.indexed_by && (
              <Descriptions.Item label="收录情况" span={2}>
                {conference.indexed_by.map((index, i) => (
                  <Tag key={i} color="blue">{index}</Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : null

      case 'book':
        const book = achievement.book
        return book ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="出版社">{book.publisher}</Descriptions.Item>
            <Descriptions.Item label="出版日期">{book.publish_date}</Descriptions.Item>
            <Descriptions.Item label="ISBN">{book.isbn}</Descriptions.Item>
            <Descriptions.Item label="页数">{book.pages}</Descriptions.Item>
            <Descriptions.Item label="字数">{book.word_count}</Descriptions.Item>
            <Descriptions.Item label="语言">{book.language === 'chinese' ? '中文' : '外文'}</Descriptions.Item>
            <Descriptions.Item label="出版状态">{book.publication_status === 'published' ? '已出版' : '待出版'}</Descriptions.Item>
            <Descriptions.Item label="丛书名称">{book.series_name}</Descriptions.Item>
            <Descriptions.Item label="编辑">{book.editor}</Descriptions.Item>
            <Descriptions.Item label="出版国家">{book.country}</Descriptions.Item>
            <Descriptions.Item label="出版城市">{book.city}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'patent':
        const patent = achievement.patent
        return patent ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="申请号">{patent.application_number}</Descriptions.Item>
            <Descriptions.Item label="专利类型">{patent.patent_type}</Descriptions.Item>
            <Descriptions.Item label="申请日期">{patent.application_date}</Descriptions.Item>
            <Descriptions.Item label="状态">{patent.status === 'granted' ? '已授权' : '已申请'}</Descriptions.Item>
            <Descriptions.Item label="专利权人">{patent.patent_holder}</Descriptions.Item>
            <Descriptions.Item label="发证机构">{patent.issuing_authority}</Descriptions.Item>
            <Descriptions.Item label="申请国家">{patent.patent_country}</Descriptions.Item>
            <Descriptions.Item label="公开号">{patent.publication_number}</Descriptions.Item>
            <Descriptions.Item label="IPC分类号">{patent.ipc_number}</Descriptions.Item>
            <Descriptions.Item label="CPC分类号">{patent.cpc_number}</Descriptions.Item>
            <Descriptions.Item label="生效开始日期">{patent.effective_start_date}</Descriptions.Item>
            <Descriptions.Item label="生效结束日期">{patent.effective_end_date}</Descriptions.Item>
            <Descriptions.Item label="产业化状态">{patent.commercialization_status}</Descriptions.Item>
            <Descriptions.Item label="交易金额">{patent.transaction_amount ? `¥${patent.transaction_amount.toLocaleString()}` : '-'}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'conference_report':
        const report = achievement.conference_report
        return report ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="会议名称">{report.conference_name}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{report.start_date}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{report.end_date}</Descriptions.Item>
            <Descriptions.Item label="会议地点">{report.location}</Descriptions.Item>
            <Descriptions.Item label="会议国家">{report.country}</Descriptions.Item>
            <Descriptions.Item label="报告类型">{report.report_type}</Descriptions.Item>
            <Descriptions.Item label="会议类型">{report.conference_type === 'international' ? '国际会议' : '国内会议'}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'standard':
        const standard = achievement.standard
        return standard ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="标准号">{standard.standard_number}</Descriptions.Item>
            <Descriptions.Item label="标准类型">{getStandardTypeText(standard.standard_type)}</Descriptions.Item>
            <Descriptions.Item label="发布日期">{standard.publish_date}</Descriptions.Item>
            <Descriptions.Item label="发布机构">{standard.publishing_organization}</Descriptions.Item>
            <Descriptions.Item label="标准类别">{standard.standard_category}</Descriptions.Item>
            <Descriptions.Item label="责任单位">{standard.responsible_unit}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'software_copyright':
        const software = achievement.software_copyright
        return software ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="登记号">{software.registration_number}</Descriptions.Item>
            <Descriptions.Item label="完成日期">{software.completion_date}</Descriptions.Item>
            <Descriptions.Item label="取得方式">{software.acquisition_method === 'original' ? '原始取得' : '继受取得'}</Descriptions.Item>
            <Descriptions.Item label="权利范围">{software.rights_scope === 'full' ? '全部权利' : '部分权利'}</Descriptions.Item>
            <Descriptions.Item label="权利描述" span={2}>{software.rights_description}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'research_award':
        const award = achievement.research_award
        return award ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="奖项名称">{award.award_type}</Descriptions.Item>
            <Descriptions.Item label="奖励级别">{award.award_level}</Descriptions.Item>
            <Descriptions.Item label="获奖日期">{award.award_date}</Descriptions.Item>
            <Descriptions.Item label="颁奖机构">{award.awarding_organization}</Descriptions.Item>
            <Descriptions.Item label="获奖国家">{award.country}</Descriptions.Item>
            <Descriptions.Item label="证书编号">{award.certificate_number}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'talent_training':
        const training = achievement.talent_training
        return training ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="培养对象">{training.trainee_name}</Descriptions.Item>
            <Descriptions.Item label="人才类型">{training.talent_type}</Descriptions.Item>
            <Descriptions.Item label="培养类别">{training.training_category === 'student' ? '学生' : '学术带头人'}</Descriptions.Item>
            <Descriptions.Item label="工作开始日期">{training.work_start_date}</Descriptions.Item>
            <Descriptions.Item label="工作结束日期">{training.work_end_date}</Descriptions.Item>
            <Descriptions.Item label="报告完成情况">{training.report_completion === 'completed' ? '已完成' : '未完成'}</Descriptions.Item>
            <Descriptions.Item label="是否主要参与者">{training.is_main_participant ? '是' : '否'}</Descriptions.Item>
            <Descriptions.Item label="合作教授">{training.collaborating_professor}</Descriptions.Item>
            <Descriptions.Item label="报告标题" span={2}>{training.report_title}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'academic_conference':
        const academicConf = achievement.academic_conference
        return academicConf ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="会议名称">{academicConf.conference_name}</Descriptions.Item>
            <Descriptions.Item label="会议类型">{academicConf.conference_type === 'international' ? '国际会议' : '国内会议'}</Descriptions.Item>
            <Descriptions.Item label="开始日期">{academicConf.start_date}</Descriptions.Item>
            <Descriptions.Item label="结束日期">{academicConf.end_date}</Descriptions.Item>
            <Descriptions.Item label="举办地点">{academicConf.location}</Descriptions.Item>
            <Descriptions.Item label="主办方">{academicConf.organizer}</Descriptions.Item>
            <Descriptions.Item label="负责人">{academicConf.responsible_person}</Descriptions.Item>
            <Descriptions.Item label="参会人数">{academicConf.participant_count}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'tech_transfer':
        const tech = achievement.tech_transfer
        return tech ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="成果类型">{tech.result_type}</Descriptions.Item>
            <Descriptions.Item label="转移形式">{tech.transfer_form}</Descriptions.Item>
            <Descriptions.Item label="交易金额">{tech.transaction_amount ? `¥${tech.transaction_amount.toLocaleString()}` : '-'}</Descriptions.Item>
            <Descriptions.Item label="受益方">{tech.beneficiary}</Descriptions.Item>
            <Descriptions.Item label="合作企业">{tech.partner_company}</Descriptions.Item>
            <Descriptions.Item label="合同日期">{tech.contract_date}</Descriptions.Item>
            <Descriptions.Item label="应用状态" span={2}>{tech.application_status}</Descriptions.Item>
            <Descriptions.Item label="效益状况" span={2}>{tech.benefit_status}</Descriptions.Item>
          </Descriptions>
        ) : null

      case 'other_research':
        const other = achievement.other_research
        return other ? (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="研究类型">{other.research_type}</Descriptions.Item>
            <Descriptions.Item label="共享范围">{other.sharing_scope}</Descriptions.Item>
            <Descriptions.Item label="数据描述" span={2}>{other.data_description}</Descriptions.Item>
          </Descriptions>
        ) : null

      default:
        return <p>暂无详细信息</p>
    }
  }

  // 获取成果类型对应的量词
  const getQuantifier = (category?: AchievementCategory) => {
    const quantifiers: Record<AchievementCategory, string> = {
      journal_paper: '篇',
      conference_paper: '篇',
      book: '部',
      patent: '项',
      conference_report: '次',
      standard: '项',
      software_copyright: '件',
      research_award: '项',
      talent_training: '项',
      academic_conference: '次',
      tech_transfer: '项',
      other_research: '项'
    }
    return category ? quantifiers[category] : '项'
  }

  // 根据成果类型获取表格列配置
  const getTableColumns = (category?: AchievementCategory) => {
    const baseActionColumn = {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (record: Achievement) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>
          {(currentUser.role === 'admin' || record.user_id === currentUser.id) && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Popconfirm
                  title="确定要删除这个成果吗？"
                  description="删除后无法恢复，请谨慎操作。"
                  onConfirm={() => handleDelete(record)}
                  okText="删除"
                  cancelText="取消"
                  okType="danger"
                >
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </Tooltip>
            </>
          )}
        </Space>
      )
    }

    if (!category) {
      // 通用列表（所有成果类型）
      return [
        {
          title: '成果标题',
          dataIndex: 'title',
          key: 'title',
          width: 300,
          sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
          render: (text: string, record: Achievement) => (
            <div>
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800 mb-1"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
              <Tag color="blue" className="text-xs">
                {ACHIEVEMENT_CATEGORIES[record.category]}
              </Tag>
            </div>
          )
        },
        {
          title: '作者',
          key: 'authors',
          width: 200,
          render: (record: Achievement) => renderAuthors(record)
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          width: 120,
          sorter: (a: Achievement, b: Achievement) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
          ...createDateFilter('created_at', '选择创建时间范围')
        },
        baseActionColumn
      ]
    }

    switch (category) {
      case 'journal_paper':
        return [
          {
            title: '论文标题',
            dataIndex: 'title',
            key: 'title',
            width: 280,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '作者',
            key: 'authors',
            width: 180,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '期刊名称',
            key: 'journal_name',
            width: 200,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.journal_paper?.journal_name || ''
              const nameB = b.journal_paper?.journal_name || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => record.journal_paper?.journal_name || '-'
          },
          {
            title: '期刊级别',
            key: 'journal_level',
            width: 100,
            sorter: (a: Achievement, b: Achievement) => {
              const levelA = a.journal_paper?.journal_level || ''
              const levelB = b.journal_paper?.journal_level || ''
              // 自定义级别排序：1区 > 2区 > 3区 > 4区 > SCI > EI > other
              const levelOrder: Record<string, number> = {
                '1区': 1, '2区': 2, '3区': 3, '4区': 4, 'SCI': 5, 'EI': 6, 'other': 7
              }
              return (levelOrder[levelA] || 8) - (levelOrder[levelB] || 8)
            },
            render: (record: Achievement) => {
              const level = record.journal_paper?.journal_level
              return level ? (
                <Tag color={
                  level === '1区' ? 'red' : 
                  level === '2区' ? 'orange' : 
                  level === '3区' ? 'blue' : 
                  level === '4区' ? 'green' : 
                  level === 'SCI' ? 'purple' : 
                  level === 'EI' ? 'cyan' : 'default'
                }>
                  {level}
                </Tag>
              ) : '-'
            }
          },
          {
            title: '发表日期',
            key: 'publish_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.journal_paper?.publish_date || ''
              const dateB = b.journal_paper?.publish_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.journal_paper?.publish_date || '-',
            ...createDateFilter('journal_publish_date', '选择发表日期范围')
          },
          {
            title: '状态',
            key: 'status',
            width: 100,
            render: (record: Achievement) => {
              const status = record.journal_paper?.status
              return status ? (
                <Tag color={status === 'published' ? 'green' : 'orange'}>
                  {status === 'published' ? '已发表' : '在线发表'}
                </Tag>
              ) : '-'
            }
          },
          {
            title: '收录情况',
            key: 'indexed_by',
            width: 150,
            render: (record: Achievement) => {
              const indexed = record.journal_paper?.indexed_by
              return indexed && indexed.length > 0 ? (
                <div>
                  {indexed.slice(0, 2).map((index, i) => (
                    <Tag key={i} color="blue" className="text-xs mb-1">{index}</Tag>
                  ))}
                  {indexed.length > 2 && <span className="text-gray-400">+{indexed.length - 2}</span>}
                </div>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'conference_paper':
        return [
          {
            title: '论文标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '作者',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '会议名称',
            key: 'conference_name',
            width: 200,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.conference_paper?.conference_name || ''
              const nameB = b.conference_paper?.conference_name || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => record.conference_paper?.conference_name || '-'
          },
          {
            title: '会议日期',
            key: 'conference_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.conference_paper?.conference_start_date || ''
              const dateB = b.conference_paper?.conference_start_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.conference_paper?.conference_start_date || '-',
            ...createDateFilter('conference_start_date', '选择会议日期范围')
          },
          {
            title: '地点',
            key: 'location',
            width: 120,
            render: (record: Achievement) => record.conference_paper?.location || '-'
          },
          {
            title: '论文类型',
            key: 'paper_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.conference_paper?.paper_type
              return type ? <Tag color="green">{type}</Tag> : '-'
            }
          },
          {
            title: '语言',
            key: 'language',
            width: 80,
            render: (record: Achievement) => {
              const lang = record.conference_paper?.language
              return lang ? <Tag color="blue">{lang === 'chinese' ? '中文' : '外文'}</Tag> : '-'
            }
          },
          baseActionColumn
        ]

      case 'book':
        return [
          {
            title: '专著标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '作者',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '出版社',
            key: 'publisher',
            width: 180,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.book?.publisher || ''
              const nameB = b.book?.publisher || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => record.book?.publisher || '-'
          },
          {
            title: '出版日期',
            key: 'publish_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.book?.publish_date || ''
              const dateB = b.book?.publish_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.book?.publish_date || '-',
            ...createDateFilter('book_publish_date', '选择出版日期范围')
          },
          {
            title: 'ISBN',
            key: 'isbn',
            width: 150,
            render: (record: Achievement) => record.book?.isbn || '-'
          },
          {
            title: '语言',
            key: 'language',
            width: 80,
            render: (record: Achievement) => {
              const lang = record.book?.language
              return lang ? <Tag color="purple">{lang === 'chinese' ? '中文' : '外文'}</Tag> : '-'
            }
          },
          {
            title: '状态',
            key: 'status',
            width: 100,
            render: (record: Achievement) => {
              const status = record.book?.publication_status
              return status ? (
                <Tag color={status === 'published' ? 'green' : 'orange'}>
                  {status === 'published' ? '已出版' : '待出版'}
                </Tag>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'patent':
        return [
          {
            title: '专利标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '发明人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '申请号',
            key: 'application_number',
            width: 150,
            sorter: (a: Achievement, b: Achievement) => {
              const numA = a.patent?.application_number || ''
              const numB = b.patent?.application_number || ''
              return numA.localeCompare(numB)
            },
            render: (record: Achievement) => record.patent?.application_number || '-'
          },
          {
            title: '申请日期',
            key: 'application_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.patent?.application_date || ''
              const dateB = b.patent?.application_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.patent?.application_date || '-',
            ...createDateFilter('patent_application_date', '选择申请日期范围')
          },
          {
            title: '专利类型',
            key: 'patent_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.patent?.patent_type
              return type ? <Tag color="cyan">{type}</Tag> : '-'
            }
          },
          {
            title: '状态',
            key: 'status',
            width: 100,
            render: (record: Achievement) => {
              const status = record.patent?.status
              return status ? (
                <Tag color={status === 'granted' ? 'green' : 'orange'}>
                  {status === 'granted' ? '已授权' : '已申请'}
                </Tag>
              ) : '-'
            },
            ...createStatusFilter([
              { value: 'granted', label: '已授权', color: 'green' },
              { value: 'applied', label: '已申请', color: 'orange' }
            ])
          },
          {
            title: '申请国家',
            key: 'patent_country',
            width: 100,
            render: (record: Achievement) => {
              const country = record.patent?.patent_country
              return country ? <Tag color="purple">{country}</Tag> : '-'
            }
          },
          baseActionColumn
        ]

      case 'conference_report':
        return [
          {
            title: '报告标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '报告人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '会议名称',
            key: 'conference_name',
            width: 200,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.conference_report?.conference_name || ''
              const nameB = b.conference_report?.conference_name || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => record.conference_report?.conference_name || '-'
          },
          {
            title: '报告日期',
            key: 'start_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.conference_report?.start_date || ''
              const dateB = b.conference_report?.start_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.conference_report?.start_date || '-',
            ...createDateFilter('conference_report_start_date', '选择报告日期范围')
          },
          {
            title: '地点',
            key: 'location',
            width: 120,
            render: (record: Achievement) => record.conference_report?.location || '-'
          },
          {
            title: '报告类型',
            key: 'report_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.conference_report?.report_type
              if (!type) return '-'
              
              const typeMap = {
                'invited': '邀请报告',
                'group': '分组报告', 
                'poster': '海报展示'
              }
              
              return <Tag color="orange">{typeMap[type] || type}</Tag>
            }
          },
          {
            title: '会议类型',
            key: 'conference_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.conference_report?.conference_type
              return type ? (
                <Tag color="blue">
                  {type === 'international' ? '国际会议' : '国内会议'}
                </Tag>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'research_award':
        return [
          {
            title: '奖项名称',
            key: 'award_type',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => {
              const typeA = a.research_award?.award_type || ''
              const typeB = b.research_award?.award_type || ''
              return typeA.localeCompare(typeB)
            },
            render: (record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {record.research_award?.award_type || record.title}
              </div>
            )
          },
          {
            title: '获奖人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '奖励级别',
            key: 'award_level',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const levelA = a.research_award?.award_level || ''
              const levelB = b.research_award?.award_level || ''
              return levelA.localeCompare(levelB)
            },
            render: (record: Achievement) => {
              const level = record.research_award?.award_level
              return level ? <Tag color="gold">{level}</Tag> : '-'
            }
          },
          {
            title: '获奖日期',
            key: 'award_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.research_award?.award_date || ''
              const dateB = b.research_award?.award_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.research_award?.award_date || '-',
            ...createDateFilter('award_date', '选择获奖日期范围')
          },
          {
            title: '颁奖机构',
            key: 'awarding_organization',
            width: 200,
            render: (record: Achievement) => record.research_award?.awarding_organization || '-'
          },
          {
            title: '获奖国家',
            key: 'country',
            width: 100,
            render: (record: Achievement) => record.research_award?.country || '-'
          },
          baseActionColumn
        ]

      case 'software_copyright':
        return [
          {
            title: '软件名称',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '著作权人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '登记号',
            key: 'registration_number',
            width: 150,
            sorter: (a: Achievement, b: Achievement) => {
              const numA = a.software_copyright?.registration_number || ''
              const numB = b.software_copyright?.registration_number || ''
              return numA.localeCompare(numB)
            },
            render: (record: Achievement) => record.software_copyright?.registration_number || '-'
          },
          {
            title: '完成日期',
            key: 'completion_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.software_copyright?.completion_date || ''
              const dateB = b.software_copyright?.completion_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.software_copyright?.completion_date || '-',
            ...createDateFilter('software_completion_date', '选择完成日期范围')
          },
          {
            title: '取得方式',
            key: 'acquisition_method',
            width: 100,
            render: (record: Achievement) => {
              const method = record.software_copyright?.acquisition_method
              return method ? (
                <Tag color="blue">
                  {method === 'original' ? '原始取得' : '继受取得'}
                </Tag>
              ) : '-'
            }
          },
          {
            title: '权利范围',
            key: 'rights_scope',
            width: 100,
            render: (record: Achievement) => {
              const scope = record.software_copyright?.rights_scope
              return scope ? (
                <Tag color="green">
                  {scope === 'full' ? '全部权利' : '部分权利'}
                </Tag>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'standard':
        return [
          {
            title: '标准标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '起草人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '标准号',
            key: 'standard_number',
            width: 150,
            sorter: (a: Achievement, b: Achievement) => {
              const numA = a.standard?.standard_number || ''
              const numB = b.standard?.standard_number || ''
              return numA.localeCompare(numB)
            },
            render: (record: Achievement) => record.standard?.standard_number || '-'
          },
          {
            title: '发布日期',
            key: 'publish_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.standard?.publish_date || ''
              const dateB = b.standard?.publish_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.standard?.publish_date || '-',
            ...createDateFilter('standard_publish_date', '选择发布日期范围')
          },
          {
            title: '标准类型',
            key: 'standard_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.standard?.standard_type
              return type ? (
                <Tag color={getStandardTypeColor(type)}>
                  {getStandardTypeText(type)}
                </Tag>
              ) : '-'
            }
          },
          {
            title: '发布机构',
            key: 'publishing_organization',
            width: 180,
            render: (record: Achievement) => record.standard?.publishing_organization || '-'
          },
          baseActionColumn
        ]

      case 'talent_training':
        return [
          {
            title: '培养成果标题',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '培养对象',
            key: 'trainee_name',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.talent_training?.trainee_name || ''
              const nameB = b.talent_training?.trainee_name || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => record.talent_training?.trainee_name || '-'
          },
          {
            title: '导师',
            key: 'authors',
            width: 120,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '培养类型',
            key: 'talent_type',
            width: 120,
            render: (record: Achievement) => {
              const type = record.talent_training?.talent_type
              return type ? <Tag color="blue">{type}</Tag> : '-'
            }
          },
          {
            title: '开始日期',
            key: 'work_start_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.talent_training?.work_start_date || ''
              const dateB = b.talent_training?.work_start_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.talent_training?.work_start_date || '-',
            ...createDateFilter('talent_work_start_date', '选择开始日期范围')
          },
          {
            title: '结束日期',
            key: 'work_end_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.talent_training?.work_end_date || ''
              const dateB = b.talent_training?.work_end_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.talent_training?.work_end_date || '-',
            ...createDateFilter('talent_work_end_date', '选择结束日期范围')
          },
          {
            title: '完成状态',
            key: 'report_completion',
            width: 100,
            render: (record: Achievement) => {
              const status = record.talent_training?.report_completion
              return status ? (
                <Tag color={status === 'completed' ? 'green' : 'orange'}>
                  {status === 'completed' ? '已完成' : '未完成'}
                </Tag>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'academic_conference':
        return [
          {
            title: '会议名称',
            key: 'conference_name',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => {
              const nameA = a.academic_conference?.conference_name || ''
              const nameB = b.academic_conference?.conference_name || ''
              return nameA.localeCompare(nameB)
            },
            render: (record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {record.academic_conference?.conference_name || record.title}
              </div>
            )
          },
          {
            title: '负责人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '举办日期',
            key: 'start_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.academic_conference?.start_date || ''
              const dateB = b.academic_conference?.start_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.academic_conference?.start_date || '-',
            ...createDateFilter('academic_conference_start_date', '选择举办日期范围')
          },
          {
            title: '地点',
            key: 'location',
            width: 150,
            render: (record: Achievement) => record.academic_conference?.location || '-'
          },
          {
            title: '会议规模',
            key: 'participant_count',
            width: 100,
            sorter: (a: Achievement, b: Achievement) => {
              const countA = a.academic_conference?.participant_count || 0
              const countB = b.academic_conference?.participant_count || 0
              return countA - countB
            },
            render: (record: Achievement) => {
              const count = record.academic_conference?.participant_count
              return count ? <Tag color="blue">{count}人</Tag> : '-'
            }
          },
          {
            title: '会议类型',
            key: 'conference_type',
            width: 100,
            render: (record: Achievement) => {
              const type = record.academic_conference?.conference_type
              return type ? (
                <Tag color="orange">
                  {type === 'international' ? '国际会议' : '国内会议'}
                </Tag>
              ) : '-'
            }
          },
          baseActionColumn
        ]

      case 'tech_transfer':
        return [
          {
            title: '成果名称',
            dataIndex: 'title',
            key: 'title',
            width: 220,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '转移方',
            key: 'authors',
            width: 120,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '受让方',
            key: 'partner_company',
            width: 150,
            render: (record: Achievement) => record.tech_transfer?.partner_company || '-'
          },
          {
            title: '转移日期',
            key: 'contract_date',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const dateA = a.tech_transfer?.contract_date || ''
              const dateB = b.tech_transfer?.contract_date || ''
              return dateA.localeCompare(dateB)
            },
            render: (record: Achievement) => record.tech_transfer?.contract_date || '-',
            ...createDateFilter('tech_transfer_contract_date', '选择转移日期范围')
          },
          {
            title: '交易金额',
            key: 'transaction_amount',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => {
              const amountA = a.tech_transfer?.transaction_amount || 0
              const amountB = b.tech_transfer?.transaction_amount || 0
              return amountA - amountB
            },
            render: (record: Achievement) => {
              const amount = record.tech_transfer?.transaction_amount
              return amount ? (
                <Tag color="green">¥{amount.toLocaleString()}</Tag>
              ) : '-'
            }
          },
          {
            title: '转移形式',
            key: 'transfer_form',
            width: 100,
            render: (record: Achievement) => record.tech_transfer?.transfer_form || '-'
          },
          baseActionColumn
        ]

      case 'other_research':
        return [
          {
            title: '成果名称',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '负责人',
            key: 'authors',
            width: 150,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '研究类型',
            key: 'research_type',
            width: 120,
            render: (record: Achievement) => {
              const type = record.other_research?.research_type
              return type ? <Tag color="cyan">{type}</Tag> : '-'
            }
          },
          {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
            ...createDateFilter('created_at', '选择创建时间范围')
          },
          {
            title: '共享范围',
            key: 'sharing_scope',
            width: 150,
            render: (record: Achievement) => record.other_research?.sharing_scope || '-'
          },
          baseActionColumn
        ]

      default:
        return [
          {
            title: '成果标题',
            dataIndex: 'title',
            key: 'title',
            width: 300,
            sorter: (a: Achievement, b: Achievement) => a.title.localeCompare(b.title),
            render: (text: string, record: Achievement) => (
              <div className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                   onClick={() => showDetail(record)}>
                {text}
              </div>
            )
          },
          {
            title: '作者',
            key: 'authors',
            width: 200,
            render: (record: Achievement) => renderAuthors(record)
          },
          {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            sorter: (a: Achievement, b: Achievement) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
            ...createDateFilter('created_at', '选择创建时间范围')
          },
          baseActionColumn
        ]
    }
  }

  const columns = getTableColumns(category)
  
  // 生成页面标题，包含数量统计
  const getPageTitle = () => {
    if (category) {
      const quantifier = getQuantifier(category)
      const categoryName = ACHIEVEMENT_CATEGORIES[category]
      return `${categoryName}（共${pagination.total}${quantifier}）`
    }
    return `所有成果（共${pagination.total}项）`
  }

  const pageTitle = getPageTitle()

  // 处理作者选择变化
  const handleAuthorChange = (value: string) => {
    setSelectedAuthor(value || '')
    // 如果清空作者选择，也清空第一或通讯作者的复选框
    if (!value) {
      setOnlyFirstOrCorresponding(false)
    }
  }

  // 检查是否应该显示"只查看第一或通讯作者"选项
  const shouldShowFirstOrCorrespondingOption = () => {
    return selectedAuthor && (category === 'journal_paper' || category === 'conference_paper')
  }

  // 检查是否应该显示过滤选项
  const shouldShowFilterOption = () => {
    return selectedAuthor && category // 只要选择了作者且有具体的成果类型就显示
  }

  // 获取过滤选项的文字
  const getFilterOptionText = () => {
    if (category === 'journal_paper' || category === 'conference_paper') {
      return '只查看第一或通讯作者'
    } else {
      return '只查看排第一的成果'
    }
  }

  // 监听搜索表单的作者字段变化
  useEffect(() => {
    const currentAuthor = searchForm.getFieldValue('author_name')
    setSelectedAuthor(currentAuthor || '')
    if (!currentAuthor) {
      setOnlyFirstOrCorresponding(false)
    }
  }, [searchForm])

  // 标准类型映射函数
  const getStandardTypeText = (type?: string) => {
    const typeMap: Record<string, string> = {
      'international': '国际标准',
      'national_mandatory': '国家标准(强制)',
      'national_recommended': '国家标准(推荐)',
      'industry_mandatory': '行业标准(强制)',
      'industry_recommended': '行业标准(推荐)',
      'local': '地方标准',
      'group': '团体标准',
      'enterprise': '企业标准'
    }
    return typeMap[type || ''] || type || '未知类型'
  }

  // 标准类型对应的颜色
  const getStandardTypeColor = (type?: string) => {
    const colorMap: Record<string, string> = {
      'international': 'red',
      'national_mandatory': 'orange',
      'national_recommended': 'blue',
      'industry_mandatory': 'green',
      'industry_recommended': 'cyan',
      'local': 'purple',
      'group': 'gold',
      'enterprise': 'magenta'
    }
    return colorMap[type || ''] || 'default'
  }

  // 应用日期过滤器到成果数据
  const applyDateFilters = (data: Achievement[]): Achievement[] => {
    if (!dateFilters || Object.keys(dateFilters).length === 0) {
      return data
    }

    return data.filter(achievement => {
      for (const [filterKey, filter] of Object.entries(dateFilters)) {
        if (!filter.start_date || !filter.end_date) continue

        let dateValue: string | undefined

        // 根据过滤器键获取对应的日期值
        switch (filterKey) {
          case 'journal_publish_date':
            dateValue = achievement.journal_paper?.publish_date
            break
          case 'conference_start_date':
            dateValue = achievement.conference_paper?.conference_start_date
            break
          case 'book_publish_date':
            dateValue = achievement.book?.publish_date
            break
          case 'patent_application_date':
            dateValue = achievement.patent?.application_date
            break
          case 'conference_report_start_date':
            dateValue = achievement.conference_report?.start_date
            break
          case 'conference_report_end_date':
            dateValue = achievement.conference_report?.end_date
            break
          case 'standard_publish_date':
            dateValue = achievement.standard?.publish_date
            break
          case 'software_completion_date':
            dateValue = achievement.software_copyright?.completion_date
            break
          case 'award_date':
            dateValue = achievement.research_award?.award_date
            break
          case 'talent_work_start_date':
            dateValue = achievement.talent_training?.work_start_date
            break
          case 'talent_work_end_date':
            dateValue = achievement.talent_training?.work_end_date
            break
          case 'academic_conference_start_date':
            dateValue = achievement.academic_conference?.start_date
            break
          case 'academic_conference_end_date':
            dateValue = achievement.academic_conference?.end_date
            break
          case 'tech_transfer_contract_date':
            dateValue = achievement.tech_transfer?.contract_date
            break
          case 'created_at':
            dateValue = achievement.created_at.split('T')[0] // 将时间戳转换为YYYY-MM-DD格式
            break
          default:
            continue
        }

        if (!dateValue) {
          return false // 如果日期字段为空，则不符合过滤条件
        }

        // 检查日期是否在范围内
        if (dateValue < filter.start_date || dateValue > filter.end_date) {
          return false
        }
      }
      return true
    })
  }

  // 获取过滤后的成果数据
  const filteredAchievements = applyDateFilters(achievements)

  return (
    <div className="p-6">
      <Card>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {pageTitle}
            </h2>
            {category && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                添加{ACHIEVEMENT_CATEGORIES[category]}
              </Button>
            )}
          </div>

          {/* 搜索表单 */}
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            className="mb-4"
          >
            <Form.Item name="keyword">
              <Input 
                placeholder="搜索标题关键词" 
                style={{ width: 200 }}
                allowClear
              />
            </Form.Item>
            
            <Form.Item name="author_name">
              <Select
                placeholder="选择作者"
                style={{ width: 150 }}
                allowClear
                showSearch
                onChange={handleAuthorChange}
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {authors.map(author => (
                  <Option key={author} value={author}>{author}</Option>
                ))}
              </Select>
            </Form.Item>

            {/* 为所有成果类型显示过滤选项，文字根据类型调整 */}
            {shouldShowFilterOption() && (
              <Form.Item>
                <Checkbox
                  checked={onlyFirstOrCorresponding}
                  onChange={(e) => setOnlyFirstOrCorresponding(e.target.checked)}
                >
                  {getFilterOptionText()}
                </Checkbox>
              </Form.Item>
            )}

            {!category && (
              <Form.Item name="category">
                <Select placeholder="成果类型" style={{ width: 150 }} allowClear>
                  {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, label]) => (
                    <Option key={key} value={key}>{label}</Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset} icon={<FilterOutlined />}>
                  重置
                </Button>
                <Button onClick={loadAchievements} icon={<ReloadOutlined />}>
                  刷新
                </Button>
                <Button 
                  onClick={handleExportCSV} 
                  icon={<DownloadOutlined />}
                  loading={exportLoading}
                  disabled={pagination.total === 0}
                >
                  导出CSV
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAchievements}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total: filteredAchievements.length, // 使用过滤后的数据长度
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
        />

        {/* 详情模态框 */}
        <Modal
          title="成果详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedAchievement && (
            <div>
              <Descriptions column={1} size="middle" className="mb-6">
                <Descriptions.Item label="标题">
                  <span className="font-medium">{selectedAchievement.title}</span>
                </Descriptions.Item>
                <Descriptions.Item label="成果类型">
                  <Tag color="blue">{ACHIEVEMENT_CATEGORIES[selectedAchievement.category]}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {dayjs(selectedAchievement.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="作者信息">
                  <div>
                    {selectedAchievement.achievement_authors
                      ?.sort((a, b) => a.author_order - b.author_order)
                      ?.map((author, index) => {
                        const needsAuthorMarking = selectedAchievement.category === 'journal_paper' || selectedAchievement.category === 'conference_paper'
                        
                        if (!needsAuthorMarking) {
                          return (
                        <Tag 
                          key={author.id}
                              color="default"
                          className="mb-1"
                        >
                          {author.author_order}. {author.author_name}
                        </Tag>
                          )
                        }

                        // 严格按照数据库字段判断作者类型
                        const isCorresponding = author.author_type === 'corresponding' || author.author_type === 'co_corresponding'
                        const isFirst = author.author_type === 'first' || author.author_type === 'co_first'
                        
                        let tagColor = 'default'
                        let authorName = author.author_name
                        
                        if (isFirst && isCorresponding) {
                          tagColor = 'purple'
                          authorName = `${author.author_name}¹*`
                        } else if (isFirst) {
                          tagColor = 'blue'
                          authorName = `${author.author_name}¹`
                        } else if (isCorresponding) {
                          tagColor = 'green'
                          authorName = `${author.author_name}*`
                        }
                        
                        return (
                          <Tag 
                            key={author.id}
                            color={tagColor}
                            className="mb-1"
                          >
                            {author.author_order}. {authorName}
                          </Tag>
                        )
                      })}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">详细信息</Divider>
              {renderDetailInfo(selectedAchievement)}
            </div>
          )}
        </Modal>

        {/* 添加/编辑表单模态框 */}
        {category && (
          <AchievementForm
            visible={formModalVisible}
            onCancel={() => {
              setFormModalVisible(false)
              setEditingAchievement(null)
            }}
            onSuccess={handleFormSuccess}
            category={category}
            currentUser={currentUser}
            achievement={editingAchievement}
          />
        )}
      </Card>
    </div>
  )
} 