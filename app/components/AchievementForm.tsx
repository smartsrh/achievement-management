'use client'

import React, { useState, useEffect } from 'react'
import { 
  Modal, Form, Input, Select, DatePicker, InputNumber, Button, 
  Space, Tag, message, Checkbox, Row, Col, Divider, Alert 
} from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { 
  Achievement, AchievementCategory, ACHIEVEMENT_CATEGORIES,
  createAchievement, updateAchievement, User, AchievementAuthor 
} from '../../lib/supabase'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface AchievementFormProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  category: AchievementCategory
  currentUser: User
  achievement?: Achievement | null // 编辑模式时传入现有成果
}

export default function AchievementForm({
  visible,
  onCancel,
  onSuccess,
  category,
  currentUser,
  achievement
}: AchievementFormProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [awardLevel, setAwardLevel] = useState<string>('')
  const isEdit = !!achievement

  useEffect(() => {
    if (visible) {
      if (isEdit && achievement) {
        // 编辑模式：填充现有数据
        fillFormWithAchievement(achievement)
      } else {
        // 新增模式：重置表单
        form.resetFields()
        form.setFieldsValue({
          category,
          authors: [{ name: currentUser.name, order: 1, is_corresponding: true }]
        })
      }
    }
  }, [visible, achievement, category, currentUser, isEdit])

  const fillFormWithAchievement = (achievement: Achievement) => {
    const formData: any = {
      title: achievement.title,
      category: achievement.category,
      doi: achievement.doi,
      abstract: achievement.abstract,
      keywords: achievement.keywords,
      full_text_link: achievement.full_text_link,
      authors: achievement.achievement_authors?.map((author: AchievementAuthor) => ({
        name: author.author_name,
        order: author.author_order,
        is_first: author.author_type === 'first' || author.author_type === 'co_first',
        is_corresponding: author.author_type === 'corresponding' || author.author_type === 'co_corresponding'
      })) || []
    }

    // 根据成果类型填充特定字段
    switch (achievement.category) {
      case 'journal_paper':
        if (achievement.journal_paper) {
          formData.journal_name = achievement.journal_paper.journal_name
          formData.publish_date = achievement.journal_paper.publish_date ? dayjs(achievement.journal_paper.publish_date) : null
          formData.language = achievement.journal_paper.language
          formData.status = achievement.journal_paper.status
          formData.volume = achievement.journal_paper.volume
          formData.issue = achievement.journal_paper.issue
          formData.pages = achievement.journal_paper.pages
          formData.impact_factor = achievement.journal_paper.impact_factor
          formData.journal_level = achievement.journal_paper.journal_level
          formData.citation_count = achievement.journal_paper.citation_count
          formData.indexed_by = achievement.journal_paper.indexed_by
          formData.article_number = achievement.journal_paper.article_number
        }
        break

      case 'conference_paper':
        if (achievement.conference_paper) {
          formData.conference_name = achievement.conference_paper.conference_name
          formData.conference_start_date = achievement.conference_paper.conference_start_date ? dayjs(achievement.conference_paper.conference_start_date) : null
          formData.conference_end_date = achievement.conference_paper.conference_end_date ? dayjs(achievement.conference_paper.conference_end_date) : null
          formData.location = achievement.conference_paper.location
          formData.paper_type = achievement.conference_paper.paper_type
          formData.language = achievement.conference_paper.language
          formData.pages = achievement.conference_paper.pages
          formData.organizer = achievement.conference_paper.organizer
          formData.publish_date = achievement.conference_paper.publish_date ? dayjs(achievement.conference_paper.publish_date) : null
          formData.article_number = achievement.conference_paper.article_number
          formData.indexed_by = achievement.conference_paper.indexed_by
          formData.citation_count = achievement.conference_paper.citation_count
        }
        break

      case 'book':
        if (achievement.book) {
          formData.publisher = achievement.book.publisher
          formData.publish_date = achievement.book.publish_date ? dayjs(achievement.book.publish_date) : null
          formData.isbn = achievement.book.isbn
          formData.pages = achievement.book.pages
          formData.language = achievement.book.language
          formData.publication_status = achievement.book.publication_status
          formData.series_name = achievement.book.series_name
          formData.editor = achievement.book.editor
          formData.country = achievement.book.country
          formData.city = achievement.book.city
          formData.word_count = achievement.book.word_count
        }
        break

      case 'patent':
        if (achievement.patent) {
          formData.application_number = achievement.patent.application_number
          formData.patent_type = achievement.patent.patent_type
          formData.application_date = achievement.patent.application_date ? dayjs(achievement.patent.application_date) : null
          formData.effective_start_date = achievement.patent.effective_start_date ? dayjs(achievement.patent.effective_start_date) : null
          formData.status = achievement.patent.status
          formData.patent_holder = achievement.patent.patent_holder
          formData.issuing_authority = achievement.patent.issuing_authority
          formData.patent_country = achievement.patent.patent_country
          formData.publication_number = achievement.patent.publication_number
          formData.ipc_number = achievement.patent.ipc_number
          formData.cpc_number = achievement.patent.cpc_number
          formData.effective_end_date = achievement.patent.effective_end_date ? dayjs(achievement.patent.effective_end_date) : null
          formData.commercialization_status = achievement.patent.commercialization_status
          formData.transaction_amount = achievement.patent.transaction_amount
        }
        break

      case 'conference_report':
        if (achievement.conference_report) {
          formData.conference_name = achievement.conference_report.conference_name
          formData.start_date = achievement.conference_report.start_date ? dayjs(achievement.conference_report.start_date) : null
          formData.end_date = achievement.conference_report.end_date ? dayjs(achievement.conference_report.end_date) : null
          formData.location = achievement.conference_report.location
          formData.report_type = achievement.conference_report.report_type
          formData.conference_type = achievement.conference_report.conference_type
          formData.country = achievement.conference_report.country
        }
        break

      case 'standard':
        if (achievement.standard) {
          formData.standard_number = achievement.standard.standard_number
          formData.standard_type = achievement.standard.standard_type
          formData.publish_date = achievement.standard.publish_date ? dayjs(achievement.standard.publish_date) : null
          formData.publishing_organization = achievement.standard.publishing_organization
          formData.standard_category = achievement.standard.standard_category
          formData.responsible_unit = achievement.standard.responsible_unit
        }
        break

      case 'software_copyright':
        if (achievement.software_copyright) {
          formData.registration_number = achievement.software_copyright.registration_number
          formData.completion_date = achievement.software_copyright.completion_date ? dayjs(achievement.software_copyright.completion_date) : null
          formData.acquisition_method = achievement.software_copyright.acquisition_method
          formData.rights_scope = achievement.software_copyright.rights_scope
          formData.rights_description = achievement.software_copyright.rights_description
        }
        break

      case 'research_award':
        if (achievement.research_award) {
          formData.award_type = achievement.research_award.award_type
          formData.award_level = achievement.research_award.award_level
          formData.award_date = achievement.research_award.award_date ? dayjs(achievement.research_award.award_date) : null
          formData.awarding_organization = achievement.research_award.awarding_organization
          formData.country = achievement.research_award.country
          formData.certificate_number = achievement.research_award.certificate_number
          // 设置奖项级别状态
          setAwardLevel(achievement.research_award.award_level || '')
        }
        break

      case 'talent_training':
        if (achievement.talent_training) {
          formData.trainee_name = achievement.talent_training.trainee_name
          formData.talent_type = achievement.talent_training.talent_type
          formData.training_category = achievement.talent_training.training_category
          formData.work_start_date = achievement.talent_training.work_start_date ? dayjs(achievement.talent_training.work_start_date) : null
          formData.work_end_date = achievement.talent_training.work_end_date ? dayjs(achievement.talent_training.work_end_date) : null
          formData.report_completion = achievement.talent_training.report_completion
          formData.report_title = achievement.talent_training.report_title
          formData.collaborating_professor = achievement.talent_training.collaborating_professor
          formData.is_main_participant = achievement.talent_training.is_main_participant
        }
        break

      case 'academic_conference':
        if (achievement.academic_conference) {
          formData.conference_name = achievement.academic_conference.conference_name
          formData.start_date = achievement.academic_conference.start_date ? dayjs(achievement.academic_conference.start_date) : null
          formData.end_date = achievement.academic_conference.end_date ? dayjs(achievement.academic_conference.end_date) : null
          formData.location = achievement.academic_conference.location
          formData.organizer = achievement.academic_conference.organizer
          formData.responsible_person = achievement.academic_conference.responsible_person
          formData.participant_count = achievement.academic_conference.participant_count
          formData.conference_type = achievement.academic_conference.conference_type
        }
        break

      case 'tech_transfer':
        if (achievement.tech_transfer) {
          formData.result_type = achievement.tech_transfer.result_type
          formData.transfer_form = achievement.tech_transfer.transfer_form
          formData.contract_date = achievement.tech_transfer.contract_date ? dayjs(achievement.tech_transfer.contract_date) : null
          formData.transaction_amount = achievement.tech_transfer.transaction_amount
          formData.beneficiary = achievement.tech_transfer.beneficiary
          formData.partner_company = achievement.tech_transfer.partner_company
          formData.application_status = achievement.tech_transfer.application_status
          formData.benefit_status = achievement.tech_transfer.benefit_status
        }
        break

      case 'other_research':
        if (achievement.other_research) {
          formData.research_type = achievement.other_research.research_type
          formData.data_description = achievement.other_research.data_description
          formData.sharing_scope = achievement.other_research.sharing_scope
        }
        break
    }

    form.setFieldsValue(formData)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      // 🧹 自动去掉所有字符串字段的首尾空格
      const trimmedValues = trimAllStringFields(values)
      
      // 智能处理作者类型
      const processedAuthors = trimmedValues.authors?.map((author: any) => {
        // 计算选中的第一作者和通讯作者数量
        const firstAuthors = trimmedValues.authors.filter((a: any) => a.is_first)
        const correspondingAuthors = trimmedValues.authors.filter((a: any) => a.is_corresponding)
        
        let author_type = 'other'
        
        // 根据选择情况设置author_type
        if (author.is_first && author.is_corresponding) {
          // 既是第一作者又是通讯作者
          if (firstAuthors.length > 1 && correspondingAuthors.length > 1) {
            author_type = 'co_first' // 这种情况下优先标记为共同第一作者
          } else if (firstAuthors.length > 1) {
            author_type = 'co_first'
          } else if (correspondingAuthors.length > 1) {
            author_type = 'co_corresponding'
          } else {
            author_type = 'first' // 单独的第一作者优先
          }
        } else if (author.is_first) {
          // 只是第一作者
          author_type = firstAuthors.length > 1 ? 'co_first' : 'first'
        } else if (author.is_corresponding) {
          // 只是通讯作者
          author_type = correspondingAuthors.length > 1 ? 'co_corresponding' : 'corresponding'
        }
        
        return {
          name: author.name,
          order: author.order,
          author_type
        }
      }) || []
      
      // 构建提交数据
      const achievementData: any = {
        title: trimmedValues.title,
        category: trimmedValues.category || category,
        abstract: trimmedValues.abstract,
        keywords: trimmedValues.keywords,
        doi: trimmedValues.doi,
        full_text_link: trimmedValues.full_text_link,
        funding_info: trimmedValues.funding_info,
        notes: trimmedValues.notes,
        user_id: currentUser.id,
        authors: processedAuthors
      }

      // 根据成果类型添加特定字段
      const categoryData = getCategorySpecificData(trimmedValues, category)
      achievementData[getCategoryTableName(category)] = categoryData

      if (isEdit && achievement) {
        await updateAchievement(achievement.id, achievementData)
        message.success('成果更新成功！')
      } else {
        await createAchievement(achievementData)
        message.success('成果添加成功！')
      }
      
      onSuccess()
      onCancel()
    } catch (error: any) {
      if (error?.errorFields) {
        message.error('请检查表单填写是否完整')
      } else {
        message.error(error instanceof Error ? error.message : `成果${isEdit ? '更新' : '添加'}失败`)
      }
    } finally {
      setLoading(false)
    }
  }

  // 🧹 去除所有字符串字段首尾空格的辅助函数
  const trimAllStringFields = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj
    }
    
    // 检查是否是 Day.js 对象，如果是则直接返回，不进行递归处理
    if (dayjs.isDayjs(obj)) {
      return obj
    }
    
    // 检查是否是 Date 对象，如果是则直接返回
    if (obj instanceof Date) {
      return obj
    }
    
    if (typeof obj === 'string') {
      return obj.trim()
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => trimAllStringFields(item))
    }
    
    if (typeof obj === 'object') {
      const trimmedObj: any = {}
      for (const [key, value] of Object.entries(obj)) {
        trimmedObj[key] = trimAllStringFields(value)
      }
      return trimmedObj
    }
    
    return obj
  }

  const getCategoryTableName = (category: AchievementCategory): string => {
    return category
  }

  const getCategorySpecificData = (values: any, category: AchievementCategory) => {
    const formatDate = (date: any) => date ? dayjs(date).format('YYYY-MM-DD') : null

    switch (category) {
      case 'journal_paper':
        return {
          journal_name: values.journal_name,
          publish_date: formatDate(values.publish_date),
          language: values.language,
          status: values.status,
          volume: values.volume,
          issue: values.issue,
          pages: values.pages,
          citation_count: values.citation_count || 0,
          impact_factor: values.impact_factor,
          indexed_by: values.indexed_by || [],
          journal_level: values.journal_level,
          article_number: values.article_number
        }

      case 'conference_paper':
        return {
          conference_name: values.conference_name,
          conference_start_date: formatDate(values.conference_start_date),
          conference_end_date: formatDate(values.conference_end_date),
          location: values.location,
          paper_type: values.paper_type,
          language: values.language,
          pages: values.pages,
          organizer: values.organizer,
          publish_date: formatDate(values.publish_date),
          article_number: values.article_number,
          indexed_by: values.indexed_by || [],
          citation_count: values.citation_count || 0
        }

      case 'book':
        return {
          publisher: values.publisher,
          publish_date: formatDate(values.publish_date),
          isbn: values.isbn,
          pages: values.pages,
          language: values.language,
          publication_status: values.publication_status,
          series_name: values.series_name,
          editor: values.editor,
          country: values.country,
          city: values.city,
          word_count: values.word_count
        }

      case 'patent':
        return {
          patent_country: values.patent_country,
          application_number: values.application_number,
          patent_type: values.patent_type,
          application_date: formatDate(values.application_date),
          effective_start_date: formatDate(values.effective_start_date),
          status: values.status,
          patent_holder: values.patent_holder,
          issuing_authority: values.issuing_authority,
          publication_number: values.publication_number,
          ipc_number: values.ipc_number,
          cpc_number: values.cpc_number,
          effective_end_date: formatDate(values.effective_end_date),
          commercialization_status: values.commercialization_status,
          transaction_amount: values.transaction_amount
        }

      case 'conference_report':
        return {
          conference_name: values.conference_name,
          start_date: formatDate(values.start_date),
          end_date: formatDate(values.end_date),
          location: values.location,
          report_type: values.report_type,
          conference_type: values.conference_type,
          country: values.country
        }

      case 'standard':
        return {
          standard_number: values.standard_number,
          standard_type: values.standard_type,
          publish_date: formatDate(values.publish_date),
          publishing_organization: values.publishing_organization,
          standard_category: values.standard_category,
          responsible_unit: values.responsible_unit
        }

      case 'software_copyright':
        return {
          registration_number: values.registration_number,
          completion_date: formatDate(values.completion_date),
          acquisition_method: values.acquisition_method,
          rights_scope: values.rights_scope,
          rights_description: values.rights_description
        }

      case 'research_award':
        return {
          award_type: values.award_type,
          award_level: values.award_level,
          award_date: formatDate(values.award_date),
          awarding_organization: values.awarding_organization,
          country: values.country,
          certificate_number: values.certificate_number
        }

      case 'talent_training':
        return {
          trainee_name: values.trainee_name,
          talent_type: values.talent_type,
          training_category: values.training_category,
          work_start_date: formatDate(values.work_start_date),
          work_end_date: formatDate(values.work_end_date),
          report_completion: values.report_completion,
          report_title: values.report_title,
          collaborating_professor: values.collaborating_professor,
          is_main_participant: values.is_main_participant
        }

      case 'academic_conference':
        return {
          conference_name: values.conference_name,
          start_date: formatDate(values.start_date),
          end_date: formatDate(values.end_date),
          location: values.location,
          organizer: values.organizer,
          responsible_person: values.responsible_person,
          participant_count: values.participant_count,
          conference_type: values.conference_type
        }

      case 'tech_transfer':
        return {
          result_type: values.result_type,
          transfer_form: values.transfer_form,
          contract_date: formatDate(values.contract_date),
          transaction_amount: values.transaction_amount,
          beneficiary: values.beneficiary,
          partner_company: values.partner_company,
          application_status: values.application_status,
          benefit_status: values.benefit_status
        }

      case 'other_research':
        return {
          research_type: values.research_type,
          data_description: values.data_description,
          sharing_scope: values.sharing_scope
        }

      default:
        return {}
    }
  }

  const renderCategoryFields = (category: AchievementCategory) => {
    switch (category) {
      case 'journal_paper':
        return (
          <>
            <Form.Item name="journal_name" label="期刊名称" rules={[{ required: true, message: '请输入期刊名称' }]}>
              <Input placeholder="请输入期刊名称" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="publish_date" label="发表日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="language" label="语言" rules={[{ required: true }]}>
                  <Select placeholder="选择语言">
                    <Option value="chinese">中文</Option>
                    <Option value="foreign">外文</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="选择状态">
                    <Option value="published">已发表</Option>
                    <Option value="online">在线发表</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="journal_level" label="期刊级别">
                  <Select placeholder="选择期刊级别">
                    <Option value="1区">中科院1区</Option>
                    <Option value="2区">中科院2区</Option>
                    <Option value="3区">中科院3区</Option>
                    <Option value="4区">中科院4区</Option>
                    <Option value="SCI">SCI收录</Option>
                    <Option value="EI">EI收录</Option>
                    <Option value="other">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="volume" label="卷">
                  <Input placeholder="卷号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="issue" label="期">
                  <Input placeholder="期号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="pages" label="页码">
                  <Input placeholder="页码范围" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="citation_count" label="被引次数">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="被引次数"
                    min={0}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="impact_factor" label="影响因子">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="影响因子"
                    min={0}
                    step={0.001}
                    precision={3}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="article_number" label="文章编号">
                  <Input placeholder="文章编号" />
                </Form.Item>
              </Col>
            </Row>

                <Form.Item name="indexed_by" label="收录情况">
                  <Select mode="multiple" placeholder="选择收录数据库">
                    <Option value="SCI">SCI</Option>
                    <Option value="EI">EI</Option>
                    <Option value="ISTP">ISTP</Option>
                    <Option value="CSSCI">CSSCI</Option>
                    <Option value="CSCD">CSCD</Option>
                    <Option value="北大核心">北大核心</Option>
                  </Select>
                </Form.Item>
          </>
        )

      case 'conference_paper':
        return (
          <>
            <Form.Item name="conference_name" label="会议名称" rules={[{ required: true, message: '请输入会议名称' }]}>
              <Input placeholder="请输入会议名称" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="conference_start_date" label="会议开始日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="conference_end_date" label="会议结束日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="location" label="会议地点">
                  <Input placeholder="会议地点" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="paper_type" label="论文类型">
                  <Select placeholder="选择论文类型">
                    <Option value="invited">特邀论文</Option>
                    <Option value="group">分组论文</Option>
                    <Option value="poster">海报论文</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="language" label="语言">
                  <Select placeholder="选择语言">
                    <Option value="chinese">中文</Option>
                    <Option value="foreign">外文</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
            <Form.Item name="pages" label="页码">
              <Input placeholder="页码范围" />
            </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="citation_count" label="被引次数">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="被引次数"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'book':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="publisher" label="出版社" rules={[{ required: true, message: '请输入出版社' }]}>
                  <Input placeholder="请输入出版社" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="publish_date" label="出版日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="isbn" label="ISBN">
                  <Input placeholder="ISBN号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="pages" label="页数">
                  <InputNumber style={{ width: '100%' }} placeholder="页数" min={1} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="language" label="语言">
                  <Select placeholder="选择语言">
                    <Option value="chinese">中文</Option>
                    <Option value="foreign">外文</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="publication_status" label="出版状态">
                  <Select placeholder="选择出版状态">
                    <Option value="published">已出版</Option>
                    <Option value="pending">待出版</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'patent':
        return (
          <>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="patent_country" label="申请国家" rules={[{ required: true, message: '请选择申请国家' }]}>
                  <Select placeholder="选择申请国家">
                    <Option value="china">中国</Option>
                    <Option value="usa">美国</Option>
                    <Option value="europe">欧洲</Option>
                    <Option value="wipo">WIPO</Option>
                    <Option value="japan">日本</Option>
                    <Option value="other">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="application_number" label="申请号" rules={[{ required: true, message: '请输入申请号' }]}>
                  <Input placeholder="专利申请号" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="patent_type" label="专利类型" rules={[{ required: true }]}>
                  <Select placeholder="选择专利类型">
                    <Option value="invention">发明专利</Option>
                    <Option value="utility">实用新型</Option>
                    <Option value="design">外观设计</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="application_date" label="申请日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="effective_start_date" label="有效开始日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="状态">
                  <Select placeholder="选择状态">
                    <Option value="applied">已申请</Option>
                    <Option value="granted">已授权</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="issuing_authority" label="发证机构">
                  <Input placeholder="发证机构" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="patent_holder" label="专利权人">
              <Input placeholder="专利权人" />
            </Form.Item>
          </>
        )

      case 'conference_report':
        return (
          <>
            <Form.Item name="conference_name" label="会议名称" rules={[{ required: true, message: '请输入会议名称' }]}>
              <Input placeholder="请输入会议名称" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="start_date" label="会议日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="end_date" label="会议结束日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="location" label="会议地点">
                  <Input placeholder="会议地点" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="report_type" label="报告类型">
                  <Select placeholder="选择报告类型">
                    <Option value="invited">邀请报告</Option>
                    <Option value="group">分组报告</Option>
                    <Option value="poster">海报展示</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="conference_type" label="会议类型">
                  <Select placeholder="选择会议类型">
                    <Option value="international">国际会议</Option>
                    <Option value="domestic">国内会议</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="country" label="国家/地区">
                  <Input placeholder="会议举办国家或地区" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'standard':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="standard_number" label="标准号" rules={[{ required: true, message: '请输入标准号' }]}>
                  <Input placeholder="标准编号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="standard_type" label="标准类型">
                  <Select placeholder="选择标准类型">
                    <Option value="international">国际标准</Option>
                    <Option value="national_mandatory">国家标准(强制)</Option>
                    <Option value="national_recommended">国家标准(推荐)</Option>
                    <Option value="industry_mandatory">行业标准(强制)</Option>
                    <Option value="industry_recommended">行业标准(推荐)</Option>
                    <Option value="local">地方标准</Option>
                    <Option value="group">团体标准</Option>
                    <Option value="enterprise">企业标准</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="publish_date" label="发布日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="publishing_organization" label="发布机构">
                  <Input placeholder="发布机构" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'software_copyright':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="registration_number" label="登记号" rules={[{ required: true, message: '请输入登记号' }]}>
                  <Input placeholder="软件著作权登记号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="completion_date" label="完成日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="acquisition_method" label="获取方式">
                  <Select placeholder="选择获取方式">
                    <Option value="original">原始取得</Option>
                    <Option value="inherited">继受取得</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="rights_scope" label="权利范围">
                  <Select placeholder="选择权利范围">
                    <Option value="full">全部权利</Option>
                    <Option value="partial">部分权利</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="rights_description" label="权利描述">
              <TextArea 
                placeholder="请详细描述软件著作权权利"
                rows={4}
              />
            </Form.Item>
          </>
        )

      case 'research_award':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="award_level" label="奖项级别" rules={[{ required: true, message: '请选择奖项级别' }]}>
                  <Select 
                    placeholder="选择奖项级别"
                    onChange={(value) => {
                      setAwardLevel(value)
                      form.setFieldsValue({ award_type: undefined })
                    }}
                  >
                    <Option value="national">国家级</Option>
                    <Option value="provincial">省部级</Option>
                    <Option value="municipal">市级</Option>
                    <Option value="other">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="award_date" label="获奖日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item 
              name="award_type" 
              label="奖项类型"
              rules={[{ required: true, message: '请选择或输入奖项类型' }]}
            >
              <Select
                placeholder={
                  (() => {
                    if (awardLevel === 'national') return '选择国家级奖项或自行输入'
                    if (awardLevel === 'provincial') return '选择省部级奖项或自行输入'
                    return '请输入奖项类型'
                  })()
                }
                showSearch
                allowClear
                filterOption={(input, option) =>
                  (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {(awardLevel === 'national' || awardLevel === 'provincial') && (
                      <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0', color: '#888', fontSize: '12px' }}>
                        💡 如有其他不在列表中的奖项可自行输入
                      </div>
                    )}
                  </>
                )}
                onSearch={(value) => {
                  // 允许自定义输入
                  if (value && !form.getFieldValue('award_type')) {
                    form.setFieldsValue({ award_type: value })
                  }
                }}
              >
                {(() => {
                  if (awardLevel === 'national') {
                    return [
                      <Option key="national_top" value="国家最高科学技术奖">国家最高科学技术奖</Option>,
                      <Option key="natural_1" value="国家自然科学奖（一等奖）">国家自然科学奖（一等奖）</Option>,
                      <Option key="natural_2" value="国家自然科学奖（二等奖）">国家自然科学奖（二等奖）</Option>,
                      <Option key="natural_3" value="国家自然科学奖（三等奖）">国家自然科学奖（三等奖）</Option>,
                      <Option key="invention_1" value="国家技术发明奖（一等奖）">国家技术发明奖（一等奖）</Option>,
                      <Option key="invention_2" value="国家技术发明奖（二等奖）">国家技术发明奖（二等奖）</Option>,
                      <Option key="invention_3" value="国家技术发明奖（三等奖）">国家技术发明奖（三等奖）</Option>,
                      <Option key="progress_1" value="国家科学技术进步奖（一等奖）">国家科学技术进步奖（一等奖）</Option>,
                      <Option key="progress_2" value="国家科学技术进步奖（二等奖）">国家科学技术进步奖（二等奖）</Option>,
                      <Option key="progress_3" value="国家科学技术进步奖（三等奖）">国家科学技术进步奖（三等奖）</Option>,
                      <Option key="cooperation" value="中华人民共和国国际科学技术合作奖">中华人民共和国国际科学技术合作奖</Option>,
                      <Option key="innovation" value="全国创新争先奖">全国创新争先奖</Option>
                    ]
                  }
                  
                  if (awardLevel === 'provincial') {
                    return [
                      <Option key="provincial_outstanding" value="省科学技术杰出贡献奖">省科学技术杰出贡献奖</Option>,
                      <Option key="provincial_natural_1" value="省自然科学奖（一等奖）">省自然科学奖（一等奖）</Option>,
                      <Option key="provincial_natural_2" value="省自然科学奖（二等奖）">省自然科学奖（二等奖）</Option>,
                      <Option key="provincial_natural_3" value="省自然科学奖（三等奖）">省自然科学奖（三等奖）</Option>,
                      <Option key="provincial_invention_1" value="省技术发明奖（一等奖）">省技术发明奖（一等奖）</Option>,
                      <Option key="provincial_invention_2" value="省技术发明奖（二等奖）">省技术发明奖（二等奖）</Option>,
                      <Option key="provincial_invention_3" value="省技术发明奖（三等奖）">省技术发明奖（三等奖）</Option>,
                      <Option key="provincial_progress_1" value="省科学技术进步奖（一等奖）">省科学技术进步奖（一等奖）</Option>,
                      <Option key="provincial_progress_2" value="省科学技术进步奖（二等奖）">省科学技术进步奖（二等奖）</Option>,
                      <Option key="provincial_progress_3" value="省科学技术进步奖（三等奖）">省科学技术进步奖（三等奖）</Option>,
                      <Option key="provincial_cooperation" value="省科学技术合作奖">省科学技术合作奖</Option>
                    ]
                  }
                  
                  // 市级和其他级别不提供预设选项，直接输入
                  return []
                })()}
              </Select>
            </Form.Item>

            <Form.Item name="awarding_organization" label="颁奖机构">
              <Input placeholder="颁奖机构" />
            </Form.Item>

            <Form.Item name="country" label="国家/地区">
              <Input placeholder="国家/地区" />
            </Form.Item>

            <Form.Item name="certificate_number" label="证书编号">
              <Input placeholder="证书编号" />
            </Form.Item>
          </>
        )

      case 'talent_training':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="trainee_name" label="学生姓名" rules={[{ required: true, message: '请输入学生姓名' }]}>
                  <Input placeholder="学生姓名" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="talent_type" label="培养层次">
                  <Select placeholder="选择培养层次">
                    <Option value="postdoc_out">出站博士后</Option>
                    <Option value="phd_graduate">博士毕业生</Option>
                    <Option value="master_graduate">硕士毕业生</Option>
                    <Option value="postdoc_in">在站博士后</Option>
                    <Option value="phd_student">博士在读</Option>
                    <Option value="master_student">硕士在读</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="training_category" label="培养类别">
                  <Select placeholder="选择培养类别">
                    <Option value="student">学生</Option>
                    <Option value="academic_leader">学术带头人</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="work_start_date" label="开始日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="work_end_date" label="结束日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="report_completion" label="报告完成情况">
                  <Select placeholder="选择报告完成情况">
                    <Option value="completed">已完成</Option>
                    <Option value="not_completed">未完成</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="report_title" label="报告题目">
              <Input placeholder="报告题目" />
            </Form.Item>
          </>
        )

      case 'academic_conference':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  name="conference_type" 
                  label="会议类型"
                  rules={[{ required: true, message: '请选择会议类型' }]}
                >
                  <Select placeholder="选择会议类型">
                    <Option value="international">国际会议</Option>
                    <Option value="domestic">国内会议</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="conference_name" label="会议名称" rules={[{ required: true, message: '请输入会议名称' }]}>
                  <Input placeholder="请输入会议名称" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="start_date" label="会议日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="end_date" label="会议结束日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="location" label="会议地点">
                  <Input placeholder="会议地点" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="organizer" label="主办方">
                  <Input placeholder="主办方" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="responsible_person" label="负责人">
                  <Input placeholder="负责人" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="participant_count" label="参会人数">
                  <InputNumber style={{ width: '100%' }} placeholder="参会人数" min={1} />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'tech_transfer':
        return (
          <>
            <Form.Item name="result_type" label="转让结果类型">
              <Select placeholder="选择转让结果类型">
                <Option value="exclusive">独占许可</Option>
                <Option value="non_exclusive">非独占许可</Option>
                <Option value="assignment">转让</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="transfer_form" label="转让形式">
                  <Input placeholder="转让形式" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contract_date" label="合同日期">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="transaction_amount" label="转让金额（万元）">
                  <InputNumber 
                    style={{ width: '100%' }} 
                    placeholder="转让金额"
                    min={0}
                    step={0.01}
                    precision={2}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="beneficiary" label="受让方">
                  <Input placeholder="受让方名称" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )

      case 'other_research':
        return (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="research_type" label="成果类型" rules={[{ required: true, message: '请输入成果类型' }]}>
                  <Input placeholder="成果类型" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="data_description" label="数据描述">
                  <TextArea 
                    placeholder="请详细描述研究数据"
                    rows={4}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="sharing_scope" label="共享范围">
              <Input placeholder="共享范围" />
            </Form.Item>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Modal
      title={`${isEdit ? '编辑' : '添加'}${ACHIEVEMENT_CATEGORIES[category]}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        {/* 隐藏的category字段，确保数据完整性 */}
        <Form.Item name="category" hidden>
          <Input />
        </Form.Item>
        
        <Form.Item name="title" label="成果标题" rules={[{ required: true, message: '请输入成果标题' }]}>
          <Input placeholder="请输入成果标题" />
        </Form.Item>

        <Divider orientation="left">作者信息</Divider>
        <Alert
          message="请核实姓名准确且完整，此为筛选统计的唯一索引"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form.List name="authors">
          {(fields, { add, remove }) => {
            // 计算下一个排序号的函数
            const getNextOrder = () => {
              const currentAuthors = form.getFieldValue('authors') || []
              if (currentAuthors.length === 0) {
                return 1
              }
              // 找到当前最大的排序号
              const maxOrder = Math.max(...currentAuthors.map((author: any) => author?.order || 0))
              return maxOrder + 1
            }

            return (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={6}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入作者姓名' }]}
                      >
                        <Input placeholder="作者姓名" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'order']}
                        rules={[{ required: true, message: '请输入排序' }]}
                      >
                        <InputNumber placeholder="排序" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    {(category === 'journal_paper' || category === 'conference_paper') && (
                      <>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, 'is_first']}
                            valuePropName="checked"
                          >
                            <Checkbox>第一作者</Checkbox>
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'is_corresponding']}
                        valuePropName="checked"
                      >
                        <Checkbox>通讯作者</Checkbox>
                      </Form.Item>
                    </Col>
                      </>
                    )}
                    {(category !== 'journal_paper' && category !== 'conference_paper') && (
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'is_corresponding']}
                          valuePropName="checked"
                        >
                          <Checkbox>通讯作者</Checkbox>
                        </Form.Item>
                      </Col>
                    )}
                    <Col span={4}>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ order: getNextOrder() })}
                    block
                    icon={<PlusOutlined />}
                  >
                    添加作者
                  </Button>
                </Form.Item>
              </>
            )
          }}
        </Form.List>

        <Divider orientation="left">基本信息</Divider>
        <Form.Item name="doi" label="DOI">
          <Input placeholder="请输入DOI号" />
        </Form.Item>

        <Form.Item name="abstract" label="摘要">
          <TextArea 
            placeholder="请输入成果摘要"
            rows={3}
          />
        </Form.Item>

        <Form.Item name="keywords" label="关键词">
          <Input placeholder="请输入关键词，多个关键词用逗号分隔" />
        </Form.Item>

        <Form.Item name="full_text_link" label="全文链接">
          <Input placeholder="请输入全文链接URL" />
        </Form.Item>

        <Divider orientation="left">详细信息</Divider>
        {renderCategoryFields(category)}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? '更新' : '添加'}
            </Button>
            <Button onClick={onCancel}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
} 