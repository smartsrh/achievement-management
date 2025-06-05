'use client'
import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Checkbox, 
  Switch,
  Upload,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Typography
} from 'antd'
import { UploadOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

interface DynamicAchievementFormProps {
  category: string
  form: any
  initialValues?: any
}

const DynamicAchievementForm: React.FC<DynamicAchievementFormProps> = ({ 
  category, 
  form, 
  initialValues 
}) => {

  // 通用字段组件
  const renderCommonFields = () => (
    <>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="abstract" label="摘要">
            <TextArea rows={3} placeholder="请输入摘要" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="keywords" label="关键词">
            <Input placeholder="请输入关键词，用逗号分隔" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="doi" label="DOI">
            <Input placeholder="请输入DOI" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="funding_info" label="基金标注">
            <Input placeholder="请输入基金资助信息" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="full_text_link" label="全文链接">
            <Input placeholder="请输入全文链接URL" />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">作者信息</Divider>
      <Form.List name="authors">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Row key={key} gutter={8} align="middle">
                <Col span={8}>
                  <Form.Item
                    {...restField}
                    name={[name, 'author_name']}
                    rules={[{ required: true, message: '请输入作者姓名' }]}
                  >
                    <Input placeholder="作者姓名" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    {...restField}
                    name={[name, 'author_order']}
                    initialValue={key + 1}
                  >
                    <InputNumber min={1} placeholder="顺序" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...restField}
                    name={[name, 'author_type']}
                    initialValue="other"
                  >
                    <Select placeholder="作者类型">
                      <Option value="first">第一作者</Option>
                      <Option value="co_first">共同第一作者</Option>
                      <Option value="corresponding">通讯作者</Option>
                      <Option value="co_corresponding">共同通讯作者</Option>
                      <Option value="other">其他</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={2}>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Col>
              </Row>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加作者
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  )

  // 期刊论文特定字段
  const renderJournalPaperFields = () => (
    <>
      <Divider orientation="left">期刊论文详情</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="journal_name"
            label="期刊名称"
            rules={[{ required: true, message: '请输入期刊名称' }]}
          >
            <Input placeholder="请输入期刊名称" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="language" label="语言">
            <Select placeholder="选择语言">
              <Option value="chinese">中文</Option>
              <Option value="foreign">外文</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择发表状态' }]}
          >
            <Select placeholder="选择状态">
              <Option value="published">正式发表</Option>
              <Option value="online">在线发表</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="publish_date"
            label="发表日期"
            rules={[{ required: true, message: '请选择发表日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="volume" label="卷号">
            <Input placeholder="卷号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="issue" label="期号">
            <Input placeholder="期号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="pages" label="页码">
            <Input placeholder="起止页码，如：123-145" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="impact_factor" label="影响因子">
            <InputNumber min={0} step={0.001} placeholder="影响因子" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="article_number" label="文章号">
            <Input placeholder="文章编号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="indexed_by" label="收录情况">
            <Checkbox.Group>
              <Row>
                <Col span={8}><Checkbox value="SCIE">SCIE</Checkbox></Col>
                <Col span={8}><Checkbox value="SSCI">SSCI</Checkbox></Col>
                <Col span={8}><Checkbox value="EI">EI</Checkbox></Col>
                <Col span={8}><Checkbox value="CSSCI">CSSCI</Checkbox></Col>
                <Col span={8}><Checkbox value="ISTP">ISTP</Checkbox></Col>
                <Col span={8}><Checkbox value="北大中文核心期刊">北大中文核心期刊</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="citation_count" label="引用次数">
            <InputNumber min={0} placeholder="引用次数" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  // 会议论文特定字段
  const renderConferencePaperFields = () => (
    <>
      <Divider orientation="left">会议论文详情</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="paper_type"
            label="论文类别"
            rules={[{ required: true, message: '请选择论文类别' }]}
          >
            <Select placeholder="选择论文类别">
              <Option value="invited">特邀报告</Option>
              <Option value="group">分组报告</Option>
              <Option value="poster">墙报展示</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="language" label="语言">
            <Select placeholder="选择语言">
              <Option value="chinese">中文</Option>
              <Option value="foreign">外文</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="conference_name"
            label="会议名称"
            rules={[{ required: true, message: '请输入会议名称' }]}
          >
            <Input placeholder="请输入会议名称" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="organizer" label="会议组织者">
            <Input placeholder="会议组织者" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="conference_start_date"
            label="会议开始日期"
            rules={[{ required: true, message: '请选择会议开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="conference_end_date"
            label="会议结束日期"
            rules={[{ required: true, message: '请选择会议结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="publish_date"
            label="发表日期"
            rules={[{ required: true, message: '请选择发表日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="pages" label="起止页码">
            <Input placeholder="起止页码，如：123-145" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="location"
            label="会议地址"
            rules={[{ required: true, message: '请输入会议地址' }]}
          >
            <Input placeholder="会议举办地点" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="article_number" label="文章号">
            <Input placeholder="文章编号" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="citation_count" label="引用次数">
            <InputNumber min={0} placeholder="引用次数" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="indexed_by" label="收录情况">
            <Checkbox.Group>
              <Checkbox value="SCIE">SCIE</Checkbox>
              <Checkbox value="SSCI">SSCI</Checkbox>
              <Checkbox value="EI">EI</Checkbox>
              <Checkbox value="ISTP">ISTP</Checkbox>
            </Checkbox.Group>
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  // 专利特定字段
  const renderPatentFields = () => (
    <>
      <Divider orientation="left">专利详情</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="patent_country"
            label="专利国家"
            rules={[{ required: true, message: '请选择专利国家' }]}
          >
            <Select placeholder="选择专利国家">
              <Option value="china">中国专利</Option>
              <Option value="usa">美国专利</Option>
              <Option value="europe">欧洲专利</Option>
              <Option value="wipo">WIPO专利</Option>
              <Option value="japan">日本专利</Option>
              <Option value="other">其他国家专利</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="patent_type"
            label="专利类别"
            rules={[{ required: true, message: '请选择专利类别' }]}
          >
            <Select placeholder="选择专利类别">
              <Option value="invention">发明专利</Option>
              <Option value="utility">实用新型</Option>
              <Option value="design">外观设计</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="status"
            label="专利状态"
            rules={[{ required: true, message: '请选择专利状态' }]}
          >
            <Select placeholder="选择专利状态">
              <Option value="applied">申请</Option>
              <Option value="granted">授权</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="application_number"
            label="申请（专利）号"
            rules={[{ required: true, message: '请输入申请号' }]}
          >
            <Input placeholder="请输入申请号" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="publication_number" label="公开（公告）号">
            <Input placeholder="请输入公告号" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Form.Item name="ipc_number" label="IPC号">
            <Input placeholder="IPC号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="cpc_number" label="CPC号">
            <Input placeholder="CPC号" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="issuing_authority"
            label="发证单位"
            rules={[{ required: true, message: '请输入发证单位' }]}
          >
            <Input placeholder="发证单位" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name="patent_holder" label="专利权人">
            <Input placeholder="专利权人" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="application_date"
            label="申请日期"
            rules={[{ required: true, message: '请选择申请日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="effective_start_date"
            label="生效开始日期"
            rules={[{ required: true, message: '请选择生效开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="effective_end_date" label="生效结束日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="commercialization_status" label="成果转化状态">
            <Select placeholder="选择转化状态">
              <Option value="transfer">转让</Option>
              <Option value="license">许可</Option>
              <Option value="investment">作价投资</Option>
              <Option value="other">其他</Option>
              <Option value="none">无</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="transaction_amount" label="交易金额（万元）">
            <InputNumber min={0} precision={2} placeholder="交易金额" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  // 会议报告特定字段
  const renderConferenceReportFields = () => (
    <>
      <Divider orientation="left">会议报告详情</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="report_type"
            label="报告类型"
            rules={[{ required: true, message: '请选择报告类型' }]}
          >
            <Select placeholder="选择报告类型">
              <Option value="invited">特邀报告</Option>
              <Option value="group">分组报告</Option>
              <Option value="poster">墙报展示</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="conference_type"
            label="会议类型"
            rules={[{ required: true, message: '请选择会议类型' }]}
          >
            <Select placeholder="选择会议类型">
              <Option value="international">国际学术会议</Option>
              <Option value="domestic">国内学术会议</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="conference_name"
            label="会议名称"
            rules={[{ required: true, message: '请输入会议名称' }]}
          >
            <Input placeholder="请输入会议名称" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="location"
            label="会议地址"
            rules={[{ required: true, message: '请输入会议地址' }]}
          >
            <Input placeholder="会议地点" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="country"
            label="国家或地区"
            rules={[{ required: true, message: '请输入国家或地区' }]}
          >
            <Input placeholder="国家或地区" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="start_date"
            label="会议开始日期"
            rules={[{ required: true, message: '请选择会议开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="end_date"
            label="会议结束日期"
            rules={[{ required: true, message: '请选择会议结束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </>
  )

  // 根据类型渲染相应字段
  const renderCategorySpecificFields = () => {
    switch (category) {
      case 'journal_paper':
        return renderJournalPaperFields()
      case 'conference_paper':
        return renderConferencePaperFields()
      case 'patent':
        return renderPatentFields()
      case 'conference_report':
        return renderConferenceReportFields()
      // 可以继续添加其他类型...
      default:
        return null
    }
  }

  return (
    <>
      {renderCommonFields()}
      {renderCategorySpecificFields()}
      
      <Divider orientation="left">附加信息</Divider>
      <Form.Item name="notes" label="备注">
        <TextArea rows={3} placeholder="请输入备注信息" />
      </Form.Item>
    </>
  )
}

export default DynamicAchievementForm 