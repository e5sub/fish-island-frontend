import React, { useEffect, useState } from 'react';
import { Card, Badge, Avatar, Button, Tooltip, Spin, Empty, List, message, Space, Modal, Form, Input, InputNumber } from 'antd';
import { 
  TeamOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  RightOutlined, 
  UserOutlined, 
  PlayCircleOutlined,
  StopOutlined,
  PlusCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { 
  getActiveRoomUsingGet, 
  voteUsingPost, 
  joinRoomUsingPost, 
  startGameUsingPost,
  endGameUsingPost,
  createRoomUsingPost
} from '@/services/backend/undercoverGameController';
import { history, useModel } from '@umijs/max';
import styles from './index.less';

interface RoomInfoCardProps {
  visible: boolean;
  onClose: () => void;
}

interface CreateRoomFormValues {
  maxPlayers: number;
  civilianWord: string;
  undercoverWord: string;
  duration: number;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ visible, onClose }) => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [roomInfo, setRoomInfo] = useState<API.UndercoverRoomVO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [votingLoading, setVotingLoading] = useState<boolean>(false);
  const [joiningRoom, setJoiningRoom] = useState<boolean>(false);
  const [startingGame, setStartingGame] = useState<boolean>(false);
  const [endingGame, setEndingGame] = useState<boolean>(false);
  const [creatingRoom, setCreatingRoom] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();

  const fetchRoomInfo = async () => {
    if (!visible) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getActiveRoomUsingGet();
      if (response.code === 0 && response.data) {
        setRoomInfo(response.data);
      } else {
        setRoomInfo(null);
        setError('暂无活跃房间');
      }
    } catch (error) {
      console.error('获取房间信息失败:', error);
      setError('获取房间信息失败');
      setRoomInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchRoomInfo();
    }
  }, [visible]);

  const handleJoinRoom = async () => {
    if (roomInfo?.roomId) {
      try {
        setJoiningRoom(true);
        const response = await joinRoomUsingPost({
          roomId: roomInfo.roomId
        });
        
        if (response.code === 0 && response.data) {
          message.success('加入房间成功');
          fetchRoomInfo(); // 刷新房间信息
        } else {
          message.error(response.message || '加入房间失败');
        }
      } catch (error) {
        console.error('加入房间失败:', error);
        message.error('加入房间失败，请重试');
      } finally {
        setJoiningRoom(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchRoomInfo();
  };

  // 处理投票
  const handleVote = async (targetUserId: number) => {
    if (!roomInfo?.roomId) return;

    try {
      setVotingFor(targetUserId);
      setVotingLoading(true);

      const response = await voteUsingPost({
        roomId: roomInfo.roomId,
        targetId: targetUserId
      });

      if (response.code === 0 && response.data) {
        message.success('投票成功');
        fetchRoomInfo(); // 刷新房间信息
      } else {
        message.error(response.message || '投票失败');
      }
    } catch (error) {
      console.error('投票失败:', error);
      message.error('投票失败，请重试');
    } finally {
      setVotingLoading(false);
      setVotingFor(null);
    }
  };

  // 处理开始游戏
  const handleStartGame = async () => {
    if (!roomInfo?.roomId) return;

    try {
      setStartingGame(true);
      const response = await startGameUsingPost({
        roomId: roomInfo.roomId
      });

      if (response.code === 0 && response.data) {
        message.success('游戏已开始');
        fetchRoomInfo(); // 刷新房间信息
      } else {
        message.error(response.message || '开始游戏失败');
      }
    } catch (error) {
      console.error('开始游戏失败:', error);
      message.error('开始游戏失败，请重试');
    } finally {
      setStartingGame(false);
    }
  };

  // 处理结束游戏
  const handleEndGame = async () => {
    if (!roomInfo?.roomId) return;

    try {
      setEndingGame(true);
      const response = await endGameUsingPost({
        roomId: roomInfo.roomId
      });

      if (response.code === 0 && response.data) {
        message.success('游戏已结束');
        fetchRoomInfo(); // 刷新房间信息
      } else {
        message.error(response.message || '结束游戏失败');
      }
    } catch (error) {
      console.error('结束游戏失败:', error);
      message.error('结束游戏失败，请重试');
    } finally {
      setEndingGame(false);
    }
  };

  // 显示创建房间模态框
  const showCreateModal = () => {
    form.resetFields();
    form.setFieldsValue({
      maxPlayers: 8,
      civilianWord: '',
      undercoverWord: '',
      duration: 600
    });
    setIsCreateModalVisible(true);
  };

  // 处理创建房间
  const handleCreateRoom = async (values: CreateRoomFormValues) => {
    try {
      setCreatingRoom(true);
      const response = await createRoomUsingPost({
        maxPlayers: values.maxPlayers,
        civilianWord: values.civilianWord,
        undercoverWord: values.undercoverWord,
        duration: values.duration
      });

      if (response.code === 0 && response.data) {
        message.success('创建房间成功');
        setIsCreateModalVisible(false);
        fetchRoomInfo(); // 刷新房间信息
      } else {
        message.error(response.message || '创建房间失败');
      }
    } catch (error) {
      console.error('创建房间失败:', error);
      message.error('创建房间失败，请重试');
    } finally {
      setCreatingRoom(false);
    }
  };

  // 获取房间状态的文字和颜色
  const getRoomStatusInfo = (status?: string) => {
    switch (status) {
      case 'WAITING':
        return { text: '等待中', color: '#52c41a', badgeStatus: 'success' as const };
      case 'PLAYING':
        return { text: '游戏中', color: '#1890ff', badgeStatus: 'processing' as const };
      case 'ENDED':
        return { text: '已结束', color: '#d9d9d9', badgeStatus: 'default' as const };
      default:
        return { text: '未知状态', color: '#faad14', badgeStatus: 'warning' as const };
    }
  };

  const statusInfo = getRoomStatusInfo(roomInfo?.status);

  // 判断当前用户是否可以投票
  const canVote = roomInfo?.status === 'PLAYING' && currentUser?.id;

  // 判断当前用户是否是管理员
  const isAdmin = currentUser?.userRole === 'admin';

  // 渲染管理员操作按钮
  const renderAdminButtons = () => {
    if (!isAdmin) return null;

    // 如果没有房间，显示创建房间按钮
    if (!roomInfo) {
      return (
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={showCreateModal}
          loading={creatingRoom}
          disabled={creatingRoom}
          className={styles.adminButton}
        >
          创建房间
        </Button>
      );
    }

    // 根据房间状态显示不同的操作按钮
    switch (roomInfo.status) {
      case 'WAITING':
        return (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handleStartGame}
            loading={startingGame}
            disabled={startingGame}
            className={styles.adminButton}
          >
            开始游戏
          </Button>
        );
      case 'PLAYING':
        return (
          <Button
            type="primary"
            danger
            icon={<StopOutlined />}
            onClick={handleEndGame}
            loading={endingGame}
            disabled={endingGame}
            className={styles.adminButton}
          >
            结束游戏
          </Button>
        );
      case 'ENDED':
        return (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={showCreateModal}
            loading={creatingRoom}
            disabled={creatingRoom}
            className={styles.adminButton}
          >
            创建新房间
          </Button>
        );
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.roomInfoCardContainer}>
      <Card
        title={
          <div className={styles.cardTitle}>
            <span>谁是卧底房间</span>
            <Badge
              status={roomInfo ? statusInfo.badgeStatus : 'default'}
              text={roomInfo ? statusInfo.text : '无活跃房间'}
              className={styles.statusBadge}
            />
          </div>
        }
        extra={
          <Button type="text" onClick={onClose} icon={<RightOutlined />} />
        }
        className={styles.roomInfoCard}
      >
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin tip="加载中..." />
          </div>
        ) : error ? (
          <div>
            <Empty
              description={error}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            {/* 在错误状态下，如果是管理员，也显示管理员操作按钮 */}
            {isAdmin && (
              <div className={styles.adminActionsCenter}>
                {renderAdminButtons()}
              </div>
            )}
          </div>
        ) : roomInfo ? (
          <div className={styles.roomContent}>
            <div className={styles.roomHeader}>
              <h3 className={styles.roomName}>谁是卧底</h3>
            </div>

            <div className={styles.infoItem}>
              <TeamOutlined className={styles.infoIcon} />
              <span>玩家数量: {roomInfo.participants?.length || 0}/{roomInfo.maxPlayers || 0}</span>
            </div>

            <div className={styles.infoItem}>
              <ClockCircleOutlined className={styles.infoIcon} />
              <span style={{ color: statusInfo.color }}>状态: {statusInfo.text}</span>
            </div>

            {/* 显示当前玩家的词语，仅在游戏进行中显示 */}
            {roomInfo.word && roomInfo.status === 'PLAYING' && (
              <div className={styles.infoItem}>
                <TrophyOutlined className={styles.infoIcon} />
                <span>你的词语: <strong>{roomInfo.word}</strong></span>
              </div>
            )}

            {/* 玩家列表 */}
            {roomInfo.participants && roomInfo.participants.length > 0 && (
              <div className={styles.playersList}>
                <h4 className={styles.playersTitle}>参与玩家</h4>
                <List
                  size="small"
                  dataSource={roomInfo.participants}
                  renderItem={(player) => (
                    <List.Item className={styles.playerItem}>
                      <div className={styles.playerInfo}>
                        <Avatar
                          size="small"
                          src={player.userAvatar}
                          icon={<UserOutlined />}
                        />
                        <span className={styles.playerName}>{player.userName}</span>
                      </div>
                      <div className={styles.playerActions}>
                        {player.voteCount !== undefined && (
                          <div className={styles.voteCount}>
                            <Tooltip title="获得的票数">
                              <Badge
                                count={player.voteCount}
                                showZero={true}
                                style={{ backgroundColor: player.isEliminated ? '#ff4d4f' : '#1890ff' }}
                              />
                            </Tooltip>
                          </div>
                        )}
                        {canVote &&
                         player.userId !== undefined &&
                         currentUser?.id !== undefined &&
                         player.userId !== currentUser.id &&
                         !player.isEliminated &&
                         roomInfo.status === 'PLAYING' && (
                          <Button
                            size="small"
                            type="primary"
                            danger
                            onClick={() => player.userId !== undefined && handleVote(player.userId)}
                            loading={votingLoading && votingFor === player.userId}
                          >
                            投票
                          </Button>
                        )}
                        {player.isEliminated && (
                          <span className={styles.eliminatedTag}>已出局</span>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* 底部操作区域，将管理员操作和普通操作分开布局 */}
            <div className={styles.actionContainer}>
              {/* 管理员操作区 */}
              {isAdmin && (
                <div className={styles.adminActionsSection}>
                  <h4 className={styles.sectionTitle}>管理员操作</h4>
                  <div className={styles.adminActions}>
                    {renderAdminButtons()}
                  </div>
                </div>
              )}
              
              {/* 普通操作区 */}
              <div className={styles.userActionsSection}>
                <h4 className={styles.sectionTitle}>玩家操作</h4>
                <div className={styles.userActions}>
                  {roomInfo.status === 'WAITING' && (
                    <Button
                      type="primary"
                      onClick={handleJoinRoom}
                      disabled={joiningRoom}
                      loading={joiningRoom}
                      className={styles.actionButton}
                    >
                      {joiningRoom ? '加入中...' : '加入房间'}
                    </Button>
                  )}
                  <Button 
                    onClick={handleRefresh}
                    icon={<ReloadOutlined />}
                    className={styles.actionButton}
                  >
                    刷新
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Empty
              description="暂无活跃房间"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            {/* 在无房间状态下，如果是管理员，显示管理员操作按钮 */}
            {isAdmin && (
              <div className={styles.adminActionsCenter}>
                {renderAdminButtons()}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 创建房间模态框 */}
      <Modal
        title="创建谁是卧底房间"
        open={isCreateModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsCreateModalVisible(false)}
        confirmLoading={creatingRoom}
        okText="创建"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRoom}
          initialValues={{
            maxPlayers: 8,
            civilianWord: '',
            undercoverWord: '',
            duration: 600
          }}
        >
          <Form.Item
            name="maxPlayers"
            label="最大玩家数"
            rules={[
              { required: true, message: '请输入最大玩家数' },
              { type: 'number', min: 3, message: '玩家数至少为3人' },
              { type: 'number', max: 20, message: '玩家数最多为20人' }
            ]}
          >
            <InputNumber min={3} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="civilianWord"
            label="平民词"
            rules={[{ required: true, message: '请输入平民词' }]}
          >
            <Input placeholder="例如：苹果" />
          </Form.Item>

          <Form.Item
            name="undercoverWord"
            label="卧底词"
            rules={[{ required: true, message: '请输入卧底词' }]}
          >
            <Input placeholder="例如：梨" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="游戏时长(秒)"
            rules={[
              { required: true, message: '请输入游戏时长' },
              { type: 'number', min: 60, message: '游戏时长至少为60秒' }
            ]}
          >
            <InputNumber min={60} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomInfoCard;
