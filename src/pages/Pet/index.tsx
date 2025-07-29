import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Avatar, Badge, Tabs, Spin } from 'antd';
import { TrophyOutlined, CrownOutlined, HomeOutlined, BarChartOutlined } from '@ant-design/icons';
import MoyuPet from '@/components/MoyuPet';
import styles from './index.less';
import { getPetRankListUsingGet } from '@/services/backend/petRankController';

const PetPage: React.FC = () => {
  const [rankData, setRankData] = useState<API.PetRankVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [petModalVisible, setPetModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<{id: number, name: string} | null>(null);

  // 获取排行榜数据
  const fetchRankData = async () => {
    setLoading(true);
    try {
      const res = await getPetRankListUsingGet({ limit: 20 });
      if (res.data) {
        setRankData(res.data);
      }
    } catch (error) {
      console.error('获取排行榜数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankData();
  }, []);

  // 处理点击宠物行
  const handlePetRowClick = (record: API.PetRankVO) => {
    setSelectedUser({
      id: record.userId || 0,
      name: record.userName || '未知用户'
    });
    setPetModalVisible(true);
  };

  // 定义排行榜列
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (rank: number) => {
        if (rank === 1) {
          return <div className={styles.rankFirst}>{rank}</div>;
        } else if (rank === 2) {
          return <div className={styles.rankSecond}>{rank}</div>;
        } else if (rank === 3) {
          return <div className={styles.rankThird}>{rank}</div>;
        }
        return <div className={styles.rankNormal}>{rank}</div>;
      }
    },
    {
      title: '宠物',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: API.PetRankVO) => (
        <div className={styles.petInfo}>
          <Avatar src={record.petUrl} size={36} className={styles.petAvatar} />
          <div className={styles.petNameContainer}>
            <div className={styles.petName}>{name}</div>
            <div className={styles.petOwner}>{record.userName}</div>
          </div>
        </div>
      )
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => <div className={styles.levelBadge}>Lv.{level}</div>
    }
  ];

  // 渲染排行榜内容
  const renderRankingContent = () => {
    return (
      <div className={styles.rankingContainer}>
        <div className={styles.rankingTip}>
          点击宠物可查看详细信息
        </div>
        <Spin spinning={loading}>
          <Table 
            dataSource={rankData} 
            columns={columns} 
            rowKey="petId"
            pagination={false}
            className={styles.rankTable}
            onRow={(record) => ({
              onClick: () => handlePetRowClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        </Spin>
      </div>
    );
  };

  return (
    <div className={styles.petPageContainer}>
      <Card className={styles.petTabsCard}>
        <Tabs
          defaultActiveKey="pet"
          items={[
            {
              key: 'pet',
              label: (
                <span>
                  <HomeOutlined /> 我的宠物
                </span>
              ),
              children: (
                <div className={styles.petComponentWrapper}>
                  <MoyuPet isPageComponent={true} />
                </div>
              ),
            },
            {
              key: 'ranking',
              label: (
                <span>
                  <BarChartOutlined /> 排行榜
                </span>
              ),
              children: renderRankingContent(),
            },
          ]}
        />
      </Card>
      
      {/* 查看他人宠物弹窗 */}
      {selectedUser && (
        <MoyuPet 
          visible={petModalVisible} 
          onClose={() => setPetModalVisible(false)}
          otherUserId={selectedUser.id}
          otherUserName={selectedUser.name}
        />
      )}
    </div>
  );
};

export default PetPage;
