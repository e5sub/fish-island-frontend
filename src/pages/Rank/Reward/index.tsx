import { useState, useEffect, useRef } from "react"
import { Card, Avatar, Statistic, Typography, Divider, Tooltip, Button, Modal, Spin, message } from "antd"
import { CrownOutlined, RiseOutlined, HeartOutlined, GiftOutlined, TrophyOutlined } from "@ant-design/icons"
import { listDonationVoByPageUsingPost } from "@/services/backend/donationRecordsController"
import "./index.css"

const { Title, Text } = Typography

export default function DonationLeaderboard() {
  const [donors, setDonors] = useState<API.DonationRecordsVO[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [totalDonors, setTotalDonors] = useState<number>(0)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20
  const containerRef = useRef<HTMLDivElement>(null)

  // 获取打赏记录数据
  const fetchDonationRecords = async (page: number, isLoadMore = false) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await listDonationVoByPageUsingPost({
        current: page,
        pageSize: pageSize,
        sortField: 'amount',
        sortOrder: 'descend'
      })

      if (response.code === 0 && response.data) {
        const { records, total } = response.data

        if (isLoadMore) {
          setDonors(prev => [...prev, ...(records || [])])
          setTotalDonors(Number(total || 0))

          // 累加总金额
          const newRecordsAmount = (records || []).reduce((sum, record) => sum + (record.amount || 0), 0)
          setTotalAmount(prev => Number((prev + newRecordsAmount).toFixed(2)))
        } else {
          setDonors(records || [])
          setTotalDonors(Number(total || 0))

          // 计算总金额
          const totalAmount = (records || []).reduce((sum, record) => sum + (record.amount || 0), 0)
          setTotalAmount(Number(totalAmount.toFixed(2)))
        }

        // 判断是否还有更多数据
        setHasMore((records || []).length === pageSize)
      } else {
        message.error('获取打赏记录失败')
      }
    } catch (error) {
      console.error('获取打赏记录出错:', error)
      message.error('获取打赏记录出错')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载数据
  useEffect(() => {
    fetchDonationRecords(1)
  }, [])

  // 监听滚动事件，实现下滑加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || loading || !hasMore) return

      const { scrollTop, clientHeight, scrollHeight } = document.documentElement
      const containerBottom = containerRef.current.getBoundingClientRect().bottom

      // 当滚动到距离底部100px时加载更多
      if (window.innerHeight + scrollTop >= scrollHeight - 100) {
        const nextPage = currentPage + 1
        setCurrentPage(nextPage)
        fetchDonationRecords(nextPage, true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, currentPage])

  // 获取前三名的标识
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <CrownOutlined style={{ color: "#FFD700" }} />
      case 1:
        return <CrownOutlined style={{ color: "#C0C0C0" }} />
      case 2:
        return <CrownOutlined style={{ color: "#CD7F32" }} />
      default:
        return null
    }
  }

  // 获取排名标签的颜色类名
  const getRankClass = (index: number) => {
    switch (index) {
      case 0:
        return "gold"
      case 1:
        return "silver"
      case 2:
        return "bronze"
      default:
        return "normal"
    }
  }

  return (
    <div className="leaderboard-container" ref={containerRef}>
      <div className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} className="header-title">
            <TrophyOutlined className="header-icon" />
            打赏榜
          </Title>
          <Button
            type="primary"
            icon={<GiftOutlined />}
            size="large"
            onClick={() => setIsModalVisible(true)}
          >
            打赏支持
          </Button>
        </div>
        <Text type="secondary">感谢每一位支持者的鼓励与厚爱 💝</Text>

        <div className="stats-row">
          <Card bordered={false} className="stats-card stats-card-donors">
            <Statistic
              title={
                <span>
                  <HeartOutlined /> 爱心总数
                </span>
              }
              value={totalDonors}
              suffix="人"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
          <Card bordered={false} className="stats-card stats-card-amount">
            <Statistic
              title={
                <span>
                  <GiftOutlined /> 打赏总额
                </span>
              }
              value={totalAmount}
              prefix="￥"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </div>
      </div>

      <Modal
        title="感谢支持💗"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
      >
        <div style={{ textAlign: 'center' }}>
          <img
            src="/img/391745205618_.pic.jpg"
            alt="打赏二维码"
            style={{ width: '100%', maxWidth: 300 }}
          />
          <p style={{ marginTop: 16, color: '#666' }}> 可以备注下用户名，方便 🐷播加入感谢名单哦~</p>
          <p style={{color: '#666' }}>有疑问或需要帮助请联系站长微信：th1040155</p>
        </div>
      </Modal>

      <div className="divider">
        <Divider />
        <div className="divider-text">
          <RiseOutlined className="divider-icon" />
          排行榜
        </div>
      </div>

      <ul className="donor-list">
        {donors.map((item, index) => (
          <li key={item.id} className="donor-item">
            <div className="donor-card">
              <div className="donor-content">
                <div className="avatar-container">
                  <div className="avatarWithFrame">
                    <Avatar
                      size={64}
                      src={item.donorUser?.userAvatar}
                      className={`avatar ${getRankClass(index)}`}
                    />
                    {/* 检查是否有头像框URL，如果有则显示 */}
                    {item.donorUser && 'avatarFramerUrl' in item.donorUser && item.donorUser.avatarFramerUrl && (
                      <img
                        src={item.donorUser.avatarFramerUrl}
                        className="avatarFrame"
                        alt="avatar-frame"
                      />
                    )}
                  </div>
                  {index < 3 && (
                    <div className={`rank-tag ${getRankClass(index)}`}>
                      {getRankIcon(index)} {index + 1}
                    </div>
                  )}
                </div>

                <div className="donor-info">
                  <div className="donor-header">
                    <Title level={5} className="donor-name">
                      {item.donorUser?.userName || '匿名用户'}{" "}
                      <Text type="secondary" className="donor-emoji">
                        (🚀)
                      </Text>
                    </Title>
                    <Tooltip title="打赏金额">
                      <span className="amount-tag">￥{item.amount}</span>
                    </Tooltip>
                  </div>
                  <Text type="secondary" className="donor-message">
                    "{item.remark || '感谢支持'}"
                  </Text>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin tip="加载中..." />
        </div>
      )}

      {!loading && donors.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          暂无打赏记录
        </div>
      )}

      {!loading && !hasMore && donors.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
          没有更多数据了
        </div>
      )}
    </div>
  )
}
