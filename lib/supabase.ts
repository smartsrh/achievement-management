import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 成果类型映射
export const ACHIEVEMENT_CATEGORIES = {
  journal_paper: '期刊论文',
  conference_paper: '会议论文', 
  book: '学术专著',
  patent: '专利',
  conference_report: '会议报告',
  standard: '标准',
  software_copyright: '软件著作权',
  research_award: '科研奖励',
  talent_training: '人才培养',
  academic_conference: '举办学术会议',
  tech_transfer: '成果技术转移',
  other_research: '其他重要研究成果'
} as const

export type AchievementCategory = keyof typeof ACHIEVEMENT_CATEGORIES

// 用户类型定义
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  department?: string
  title?: string
  created_at?: string
  updated_at?: string
}

// 成果作者类型定义
export interface AchievementAuthor {
  id: string
  achievement_id: string
  user_id?: string
  author_name: string
  author_order: number
  author_type: 'first' | 'co_first' | 'corresponding' | 'co_corresponding' | 'other'
}

// 基础成果类型定义
export interface BaseAchievement {
  id: string
  title: string
  category: AchievementCategory
  abstract?: string
  keywords?: string
  doi?: string
  full_text_link?: string
  funding_info?: string
  notes?: string
  user_id: string
  created_at: string
  updated_at: string
}

// 期刊论文详细信息
export interface JournalPaper {
  id: string
  achievement_id: string
  journal_name: string
  language?: 'chinese' | 'foreign'
  status?: 'published' | 'online'
  publish_date?: string
  article_number?: string
  indexed_by?: string[]
  citation_count?: number
  volume?: string
  issue?: string
  pages?: string
  impact_factor?: number
  journal_level?: '1区' | '2区' | '3区' | '4区' | 'SCI' | 'EI' | 'other'
}

// 会议论文详细信息
export interface ConferencePaper {
  id: string
  achievement_id: string
  paper_type?: 'invited' | 'group' | 'poster'
  language?: 'chinese' | 'foreign'
  conference_name: string
  organizer?: string
  conference_start_date?: string
  conference_end_date?: string
  publish_date?: string
  pages?: string
  location?: string
  article_number?: string
  indexed_by?: string[]
  citation_count?: number
}

// 学术专著详细信息
export interface Book {
  id: string
  achievement_id: string
  series_name?: string
  language?: 'chinese' | 'foreign'
  publication_status?: 'published' | 'pending'
  isbn?: string
  editor?: string
  country?: string
  city?: string
  pages?: string
  word_count?: number
  publisher: string
  publish_date?: string
}

// 专利详细信息
export interface Patent {
  id: string
  achievement_id: string
  patent_country?: 'china' | 'usa' | 'europe' | 'wipo' | 'japan' | 'other'
  application_number: string
  publication_number?: string
  ipc_number?: string
  cpc_number?: string
  issuing_authority?: string
  patent_type?: 'invention' | 'utility' | 'design'
  status?: 'applied' | 'granted'
  application_date?: string
  effective_start_date?: string
  effective_end_date?: string
  patent_holder?: string
  commercialization_status?: 'transfer' | 'license' | 'investment' | 'other' | 'none'
  transaction_amount?: number
}

// 会议报告详细信息
export interface ConferenceReport {
  id: string
  achievement_id: string
  report_type?: 'invited' | 'group' | 'poster'
  conference_type?: 'international' | 'domestic'
  conference_name: string
  location?: string
  country?: string
  start_date?: string
  end_date?: string
}

// 标准详细信息
export interface Standard {
  id: string
  achievement_id: string
  standard_type?: 'international' | 'national_mandatory' | 'national_recommended' | 'industry_mandatory' | 'industry_recommended' | 'local' | 'enterprise'
  standard_number: string
  standard_category?: string
  responsible_unit?: string
  publishing_organization?: string
  publish_date?: string
}

// 软件著作权详细信息
export interface SoftwareCopyright {
  id: string
  achievement_id: string
  registration_number: string
  acquisition_method?: 'original' | 'inherited'
  rights_scope?: 'full' | 'partial'
  rights_description?: string
  completion_date?: string
}

// 科研奖励详细信息
export interface ResearchAward {
  id: string
  achievement_id: string
  award_type: string
  award_level: string
  awarding_organization: string
  award_date?: string
  country?: string
  certificate_number?: string
}

// 人才培养详细信息
export interface TalentTraining {
  id: string
  achievement_id: string
  training_category?: 'student' | 'academic_leader'
  talent_type?: 'postdoc_out' | 'phd_graduate' | 'master_graduate' | 'postdoc_in' | 'phd_student' | 'master_student'
  trainee_name: string
  report_completion?: 'completed' | 'not_completed'
  report_title?: string
  collaborating_professor?: string
  is_main_participant?: boolean
  work_start_date?: string
  work_end_date?: string
}

// 举办学术会议详细信息
export interface AcademicConference {
  id: string
  achievement_id: string
  conference_type?: 'international' | 'domestic'
  conference_name: string
  start_date?: string
  end_date?: string
  location?: string
  organizer?: string
  responsible_person?: string
  participant_count?: number
}

// 成果技术转移详细信息
export interface TechTransfer {
  id: string
  achievement_id: string
  result_type?: string
  transfer_form?: string
  transaction_amount?: number
  beneficiary?: string
  partner_company?: string
  contract_date?: string
  application_status?: string
  benefit_status?: string
}

// 其他重要研究成果详细信息
export interface OtherResearch {
  id: string
  achievement_id: string
  research_type?: 'database' | 'specimen' | 'equipment' | 'report'
  data_description?: string
  sharing_scope?: string
}

// 完整成果类型定义（包含所有相关信息）
export interface Achievement extends BaseAchievement {
  achievement_authors?: AchievementAuthor[]
  journal_paper?: JournalPaper
  conference_paper?: ConferencePaper
  book?: Book
  patent?: Patent
  conference_report?: ConferenceReport
  standard?: Standard
  software_copyright?: SoftwareCopyright
  research_award?: ResearchAward
  talent_training?: TalentTraining
  academic_conference?: AcademicConference
  tech_transfer?: TechTransfer
  other_research?: OtherResearch
}

// 查询参数类型
export interface AchievementQuery {
  keyword?: string
  author_name?: string
  category?: AchievementCategory
  user_id?: string
  start_date?: string
  end_date?: string
  page?: number
  page_size?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  only_first_or_corresponding?: boolean
  date_filters?: Record<string, { start_date?: string; end_date?: string }>
}

// 查询结果类型
export interface AchievementQueryResult {
  data: Achievement[]
  count: number
  page?: number
  page_size?: number
}

// 获取成果列表
export async function getAchievements(query: AchievementQuery): Promise<AchievementQueryResult> {
  try {
    let supabaseQuery = supabase
      .from('achievements')
      .select('*', { count: 'exact' })

    // 应用筛选条件
    if (query.category) {
      supabaseQuery = supabaseQuery.eq('category', query.category)
    }
    
    if (query.user_id) {
      supabaseQuery = supabaseQuery.eq('user_id', query.user_id)
    }

    if (query.keyword) {
      supabaseQuery = supabaseQuery.ilike('title', `%${query.keyword}%`)
    }

    if (query.start_date) {
      supabaseQuery = supabaseQuery.gte('created_at', query.start_date)
    }

    if (query.end_date) {
      supabaseQuery = supabaseQuery.lte('created_at', query.end_date)
    }

    // 作者名称筛选需要通过子查询实现
    if (query.author_name) {
      let authorQuery = supabase
        .from('achievement_authors')
        .select('achievement_id')
        .eq('author_name', query.author_name)

      // 如果启用了"只查看第一或通讯作者"过滤，且是期刊论文或会议论文
      if (query.only_first_or_corresponding && (query.category === 'journal_paper' || query.category === 'conference_paper')) {
        // 对于期刊论文和会议论文，过滤第一作者或通讯作者
        authorQuery = authorQuery.in('author_type', ['first', 'co_first', 'corresponding', 'co_corresponding'])
      } else if (query.only_first_or_corresponding && query.category && query.category !== 'journal_paper' && query.category !== 'conference_paper') {
        // 对于其他成果类型，过滤排名第一的作者
        authorQuery = authorQuery.eq('author_order', 1)
      }

      const { data: authorAchievements } = await authorQuery
      
      if (authorAchievements && authorAchievements.length > 0) {
        const achievementIds = authorAchievements.map(a => a.achievement_id)
        supabaseQuery = supabaseQuery.in('id', achievementIds)
      } else {
        // 如果没有找到匹配的作者，返回空结果
        return { data: [], count: 0, page: query.page, page_size: query.page_size }
      }
    }

    // 排序
    if (query.sort_by && query.sort_order) {
      supabaseQuery = supabaseQuery.order(query.sort_by, { ascending: query.sort_order === 'asc' })
    } else {
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
    }

    // 分页
    const pageSize = query.page_size || 10
    const page = query.page || 1
    const start = (page - 1) * pageSize
    
    supabaseQuery = supabaseQuery.range(start, start + pageSize - 1)

    const { data: achievements, error, count } = await supabaseQuery

    if (error) {
      console.error('获取成果列表失败:', error)
      throw new Error(error.message || '获取成果列表失败')
    }

    // 手动加载相关数据
    const enrichedAchievements = await Promise.all(
      (achievements || []).map(async (achievement) => {
        // 加载作者信息
        const { data: authors } = await supabase
          .from('achievement_authors')
          .select('*')
          .eq('achievement_id', achievement.id)
          .order('author_order')

        // 根据成果类型加载详细信息
        let categoryData = null
        if (achievement.category) {
          // 映射到正确的表名
          const tableNameMap: Record<string, string> = {
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
          
          const tableName = tableNameMap[achievement.category]
          if (tableName) {
            const { data, error } = await supabase
              .from(tableName)
            .select('*')
            .eq('achievement_id', achievement.id)
            .single()
            
            if (!error && data) {
          categoryData = data
            }
          }
        }

        return {
          ...achievement,
          achievement_authors: authors || [],
          [achievement.category]: categoryData
        }
      })
    )

    return {
      data: enrichedAchievements,
      count: count || 0,
      page,
      page_size: pageSize
    }
  } catch (error) {
    console.error('获取成果列表出错:', error)
    throw error
  }
}

// 获取所有作者列表
export async function getAllAuthors(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('achievement_authors')
      .select('author_name')

    if (error) {
      throw new Error(error.message)
    }

    // 去重并排序
    const authorNames = data?.map(item => item.author_name) || []
    const uniqueAuthors = Array.from(new Set(authorNames))
    return uniqueAuthors.sort()
  } catch (error) {
    console.error('获取作者列表失败:', error)
    throw error
  }
}

// 创建新成果
export async function createAchievement(achievementData: any): Promise<Achievement> {
  try {
    // 开始事务
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .insert({
        title: achievementData.title,
        category: achievementData.category,
        abstract: achievementData.abstract,
        keywords: achievementData.keywords,
        doi: achievementData.doi,
        full_text_link: achievementData.full_text_link,
        funding_info: achievementData.funding_info,
        notes: achievementData.notes,
        user_id: achievementData.user_id
      })
      .select()
      .single()

    if (achievementError) {
      throw new Error(achievementError.message)
    }

    // 创建作者记录
    if (achievementData.authors && achievementData.authors.length > 0) {
      const authorsData = achievementData.authors.map((author: any) => ({
        achievement_id: achievement.id,
        author_name: author.name,
        author_order: author.order,
        author_type: author.author_type
      }))

      const { error: authorsError } = await supabase
        .from('achievement_authors')
        .insert(authorsData)

      if (authorsError) {
        console.error('创建作者记录失败:', authorsError)
        // 回滚主记录
        await supabase.from('achievements').delete().eq('id', achievement.id)
        throw new Error(authorsError.message)
      }
    }

    // 创建类型特定的详细信息
    const tableNameMap: Record<string, string> = {
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
    
    const categoryTableName = tableNameMap[achievementData.category]
    if (categoryTableName && achievementData[achievementData.category]) {
      const categoryData = {
        ...achievementData[achievementData.category],
        achievement_id: achievement.id
      }

      const { error: categoryError } = await supabase
        .from(categoryTableName)
        .insert(categoryData)

      if (categoryError) {
        console.error(`创建${categoryTableName}记录失败:`, categoryError)
        // 回滚所有记录
        await supabase.from('achievement_authors').delete().eq('achievement_id', achievement.id)
        await supabase.from('achievements').delete().eq('id', achievement.id)
        throw new Error(categoryError.message)
      }
    }

    return achievement
  } catch (error) {
    console.error('创建成果失败:', error)
    throw error
  }
}

// 更新成果
export async function updateAchievement(achievementId: string, achievementData: any): Promise<Achievement> {
  try {
    // 更新主记录 - 包含所有主表字段
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .update({
        title: achievementData.title,
        category: achievementData.category,
        abstract: achievementData.abstract,
        keywords: achievementData.keywords,
        doi: achievementData.doi,
        full_text_link: achievementData.full_text_link,
        funding_info: achievementData.funding_info,
        notes: achievementData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', achievementId)
      .select()
      .single()

    if (achievementError) {
      throw new Error(achievementError.message)
    }

    // 更新作者记录
    if (achievementData.authors) {
      // 先删除现有作者记录
      await supabase
        .from('achievement_authors')
        .delete()
        .eq('achievement_id', achievementId)

      // 添加新的作者记录
      if (achievementData.authors.length > 0) {
        const authorsData = achievementData.authors.map((author: any) => ({
          achievement_id: achievementId,
          author_name: author.name,
          author_order: author.order,
          author_type: author.author_type
        }))

        const { error: authorsError } = await supabase
          .from('achievement_authors')
          .insert(authorsData)

        if (authorsError) {
          throw new Error(authorsError.message)
        }
      }
    }

    // 更新类型特定的详细信息
    const tableNameMap: Record<string, string> = {
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
    
    const categoryTableName = tableNameMap[achievementData.category]
    // 根据成果类型获取对应的详细数据
    const detailDataKey = achievementData.category
    if (categoryTableName && achievementData[detailDataKey]) {
      const categoryData = {
        ...achievementData[detailDataKey],
        achievement_id: achievementId
      }

      // 先尝试更新，如果不存在则插入
      const { data: existingRecord } = await supabase
        .from(categoryTableName)
        .select('id')
        .eq('achievement_id', achievementId)
        .single()

      if (existingRecord) {
        const { error: updateError } = await supabase
          .from(categoryTableName)
          .update(categoryData)
          .eq('achievement_id', achievementId)

        if (updateError) {
          throw new Error(updateError.message)
        }
      } else {
        const { error: insertError } = await supabase
          .from(categoryTableName)
          .insert(categoryData)

        if (insertError) {
          throw new Error(insertError.message)
        }
      }
    }

    return achievement
  } catch (error) {
    console.error('更新成果失败:', error)
    throw error
  }
}

// 删除成果
export async function deleteAchievement(achievementId: string): Promise<void> {
  try {
    // 删除作者记录
    await supabase
      .from('achievement_authors')
      .delete()
      .eq('achievement_id', achievementId)

    // 获取成果类型
    const { data: achievement } = await supabase
      .from('achievements')
      .select('category')
      .eq('id', achievementId)
      .single()

    if (achievement) {
      // 映射到正确的表名
      const tableNameMap: Record<string, string> = {
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
      
      const tableName = tableNameMap[achievement.category]
      if (tableName) {
      // 删除类型特定的详细信息
      await supabase
          .from(tableName)
        .delete()
        .eq('achievement_id', achievementId)
      }
    }

    // 删除主记录
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', achievementId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('删除成果失败:', error)
    throw error
  }
}

// 用户认证相关函数
// 登录用户
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    // 查询用户
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1)

    if (error) {
      console.error('数据库查询错误:', error)
      throw new Error('登录查询失败：' + error.message)
    }

    if (!users || users.length === 0) {
      throw new Error('用户不存在')
    }

    const user = users[0]

    // 简单的密码验证（在实际应用中应该使用哈希密码）
    if (user.password !== password) {
      throw new Error('密码错误')
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error('用户登录失败:', error)
    throw error
  }
}

// 获取所有用户（管理员功能）
export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, department, title, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    console.error('获取用户列表失败:', error)
    throw error
  }
}

// 创建新用户
export async function createUser(userData: {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  department?: string
  title?: string
}): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: userData.name,
        email: userData.email,
        password: userData.password, // 实际应用中应该哈希密码
        role: userData.role,
        department: userData.department,
        title: userData.title
      })
      .select('id, name, email, role, department, title, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('创建用户失败:', error)
    throw error
  }
}

// 更新用户信息
export async function updateUser(userId: string, userData: Partial<{
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
  department: string
  title: string
}>): Promise<User> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, name, email, role, department, title, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('更新用户失败:', error)
    throw error
  }
}

// 删除用户
export async function deleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('删除用户失败:', error)
    throw error
  }
}

// 获取统计数据
export async function getStatistics(userId?: string): Promise<{
  totalAchievements: number
  userAchievements: number
  categoryStats: Record<AchievementCategory, number>
  monthlyStats: Array<{ month: string; count: number }>
}> {
  try {
    // 获取总成果数量
    const { count: totalAchievements, error: totalError } = await supabase
      .from('achievements')
      .select('id', { count: 'exact' })

    if (totalError) {
      console.error('获取总成果数量失败:', totalError)
    }

    // 获取用户成果数量
    let userAchievements = 0
    if (userId) {
      const { count, error: userError } = await supabase
        .from('achievements')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
      
      if (userError) {
        console.error('获取用户成果数量失败:', userError)
      } else {
        userAchievements = count || 0
      }
    }

    // 获取各类型成果统计
    const categoryStats: Record<AchievementCategory, number> = {} as any
    for (const category of Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementCategory[]) {
      try {
        const { count, error } = await supabase
          .from('achievements')
          .select('id', { count: 'exact' })
          .eq('category', category)
        
        if (error) {
          console.error(`获取${category}类型成果统计失败:`, error)
          categoryStats[category] = 0
        } else {
          categoryStats[category] = count || 0
        }
      } catch (err) {
        console.error(`获取${category}统计异常:`, err)
        categoryStats[category] = 0
      }
    }

    // 获取月度统计（最近12个月）
    let monthlyStats: Array<{ month: string; count: number }> = []
    try {
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('achievements')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

      if (monthlyError) {
        console.error('获取月度统计失败:', monthlyError)
      }

      monthlyStats = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const month = date.toISOString().slice(0, 7) // YYYY-MM格式
        const count = monthlyData?.filter(item => 
          item.created_at.startsWith(month)
        ).length || 0
        return {
          month: date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' }),
          count
        }
      }).reverse()
    } catch (err) {
      console.error('获取月度统计异常:', err)
      monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}月`,
        count: 0
      }))
    }

    return {
      totalAchievements: totalAchievements || 0,
      userAchievements,
      categoryStats,
      monthlyStats
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    // 返回默认值而不是抛出错误
    const defaultCategoryStats: Record<AchievementCategory, number> = {} as any
    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(key => {
      defaultCategoryStats[key as AchievementCategory] = 0
    })

    return {
      totalAchievements: 0,
      userAchievements: 0,
      categoryStats: defaultCategoryStats,
      monthlyStats: Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}月`,
        count: 0
      }))
    }
  }
}

// 修改密码
export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  try {
    // 验证旧密码
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single()

    if (userError) {
      throw new Error('用户不存在')
    }

    if (user.password !== oldPassword) {
      throw new Error('原密码错误')
    }

    // 更新密码
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId)

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    throw error
  }
}

// 获取用户成果统计
export async function getUserAchievementStats(userId: string, onlyFirstOrCorresponding: boolean = false): Promise<{
  totalCount: number
  categoryStats: Record<AchievementCategory, number>
  recentAchievements: Achievement[]
  monthlyTrend: Array<{ month: string; count: number }>
}> {
  try {
    let achievementIds: string[] = []

    if (onlyFirstOrCorresponding) {
      // 获取用户信息，需要用到用户名进行匹配
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single()
      
      const userName = userData?.name
      
      if (!userName) {
        throw new Error('无法找到用户信息')
      }

      console.log('过滤条件：只统计第一或通讯作者，用户名:', userName)

      // 分成果类型查询：期刊论文和会议论文需要特殊处理
      const journalAndConferenceIds: string[] = []
      const otherTypesIds: string[] = []

      // 1. 期刊论文和会议论文：统计第一作者或通讯作者
      const { data: journalConferenceAuthors } = await supabase
        .from('achievement_authors')
        .select('achievement_id, achievements!inner(category)')
        .eq('author_name', userName)
        .in('author_type', ['first', 'co_first', 'corresponding', 'co_corresponding'])
        .in('achievements.category', ['journal_paper', 'conference_paper'])

      journalAndConferenceIds.push(...(journalConferenceAuthors?.map(r => r.achievement_id) || []))

      // 2. 其他成果类型：统计author_order为1的作者
      const { data: otherTypeAuthors } = await supabase
        .from('achievement_authors')
        .select('achievement_id, achievements!inner(category)')
        .eq('author_name', userName)
        .eq('author_order', 1)
        .not('achievements.category', 'in', '(journal_paper,conference_paper)')

      otherTypesIds.push(...(otherTypeAuthors?.map(r => r.achievement_id) || []))

      // 合并所有符合条件的成果ID
      achievementIds = Array.from(new Set([...journalAndConferenceIds, ...otherTypesIds]))
      
      console.log('符合条件的成果ID数量:', achievementIds.length)
      console.log('期刊/会议论文成果ID:', journalAndConferenceIds.length)
      console.log('其他类型成果ID:', otherTypesIds.length)
    } else {
      // 统计用户参与的所有成果（作为作者）
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single()
      
      const userName = userData?.name
      
      if (!userName) {
        throw new Error('无法找到用户信息')
      }

      console.log('统计用户参与的所有成果，用户名:', userName)

      // 查找该用户作为作者参与的所有成果
      const { data: userAuthors } = await supabase
        .from('achievement_authors')
        .select('achievement_id')
        .eq('author_name', userName)

      achievementIds = userAuthors?.map(r => r.achievement_id) || []
      
      // 去重
      achievementIds = Array.from(new Set(achievementIds))
      
      console.log('用户参与的成果总数:', achievementIds.length)
    }

    // 获取总数
    const totalCount = achievementIds.length

    // 获取分类统计
    const categoryStats: Record<AchievementCategory, number> = {} as any
    if (achievementIds.length > 0) {
      for (const category of Object.keys(ACHIEVEMENT_CATEGORIES) as AchievementCategory[]) {
        const { count } = await supabase
          .from('achievements')
          .select('id', { count: 'exact' })
          .eq('category', category)
          .in('id', achievementIds)
        categoryStats[category] = count || 0
      }
    } else {
      // 初始化为0
      Object.keys(ACHIEVEMENT_CATEGORIES).forEach(key => {
        categoryStats[key as AchievementCategory] = 0
      })
    }

    // 获取最近成果（不使用关系查询）
    let recentAchievements: Achievement[] = []
    if (achievementIds.length > 0) {
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .in('id', achievementIds)
        .order('created_at', { ascending: false })
        .limit(5)

      // 手动加载相关数据
      recentAchievements = await Promise.all(
        (achievements || []).map(async (achievement) => {
          // 加载作者信息
          const { data: authors } = await supabase
            .from('achievement_authors')
            .select('*')
            .eq('achievement_id', achievement.id)
            .order('author_order')

          // 根据成果类型加载详细信息
          let categoryData = null
          if (achievement.category) {
            // 映射到正确的表名
            const tableNameMap: Record<string, string> = {
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
            
            const tableName = tableNameMap[achievement.category]
            if (tableName) {
              const { data } = await supabase
                .from(tableName)
                .select('*')
                .eq('achievement_id', achievement.id)
                .single()
              categoryData = data
            }
          }

          return {
            ...achievement,
            achievement_authors: authors || [],
            [achievement.category]: categoryData
          }
        })
      )
    } else {
      // 如果没有符合条件的成果，返回空数组
      recentAchievements = []
    }

    // 获取月度趋势
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toISOString().slice(0, 7)
      
      const count = recentAchievements?.filter(item => 
        item.created_at.startsWith(month)
      ).length || 0
      
      return {
        month: date.toLocaleDateString('zh-CN', { month: 'short' }),
        count
      }
    }).reverse()

    console.log('最终统计结果:', {
      totalCount,
      categoryStats,
      recentCount: recentAchievements.length
    })

    return {
      totalCount,
      categoryStats,
      recentAchievements: recentAchievements || [],
      monthlyTrend
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    
    // 返回默认值
    const defaultCategoryStats: Record<AchievementCategory, number> = {} as any
    Object.keys(ACHIEVEMENT_CATEGORIES).forEach(key => {
      defaultCategoryStats[key as AchievementCategory] = 0
    })

    return {
      totalCount: 0,
      categoryStats: defaultCategoryStats,
      recentAchievements: [],
      monthlyTrend: Array.from({ length: 6 }, (_, i) => ({
        month: `${i + 1}月`,
        count: 0
      }))
    }
  }
}

// 获取所有成果（管理员功能）
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // 手动加载相关数据
    const enrichedAchievements = await Promise.all(
      (achievements || []).map(async (achievement) => {
        // 加载作者信息
        const { data: authors } = await supabase
          .from('achievement_authors')
          .select('*')
          .eq('achievement_id', achievement.id)
          .order('author_order')

        // 根据成果类型加载详细信息
        let categoryData = null
        if (achievement.category) {
          // 映射到正确的表名
          const tableNameMap: Record<string, string> = {
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
          
          const tableName = tableNameMap[achievement.category]
          if (tableName) {
            const { data, error } = await supabase
              .from(tableName)
            .select('*')
            .eq('achievement_id', achievement.id)
            .single()
            
            if (!error && data) {
          categoryData = data
            }
          }
        }

        return {
          ...achievement,
          achievement_authors: authors || [],
          [achievement.category]: categoryData
        }
      })
    )

    return enrichedAchievements
  } catch (error) {
    console.error('获取成果列表失败:', error)
    return []
  }
} 