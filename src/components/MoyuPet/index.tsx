import React, { useState, useEffect } from 'react';
import { Modal, Tabs, Button, Progress, Card, Avatar, Row, Col, Input, Form, message, Tooltip, Popover, Spin } from 'antd';
import {
  HeartOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  GiftOutlined,
  ShoppingOutlined,
  TrophyOutlined,
  SkinOutlined,
  SmileOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import styles from './index.less';
import { getPetDetailUsingGet, createPetUsingPost, feedPetUsingPost, patPetUsingPost, updatePetNameUsingPost, getOtherUserPetUsingGet } from '@/services/backend/fishPetController';
import { listPetSkinsUsingGet, exchangePetSkinUsingPost, setPetSkinUsingPost } from '@/services/backend/petSkinController';

export interface PetInfo {
  id: string;
  name: string;
  level: number;
  exp: number;
  maxExp: number;
  hunger: number;
  maxHunger: number;
  mood: number;
  maxMood: number;
  avatar: string;
  skills: PetSkill[];
  items: PetItem[];
  achievements: PetAchievement[];
}

interface PetSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  icon: string;
}

interface PetItem {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
  type: 'food' | 'toy' | 'special';
}

interface PetAchievement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  icon: string;
  progress: number;
  maxProgress: number;
}

interface MoyuPetProps {
  visible: boolean;
  onClose: () => void;
  otherUserId?: number; // 添加查看其他用户宠物的ID
  otherUserName?: string; // 其他用户的名称
}

// 宠物规则说明组件
const PetRules = () => (
  <div className={styles.petRules}>
    <h3>宠物系统规则</h3>
    <div className={styles.ruleSection}>
      <h4>经验与等级</h4>
      <ul>
        <li>宠物每小时自动获得1点经验值</li>
        <li>每积累100点经验值可升一级</li>
        <li>如果饥饿度和心情值都为0，宠物将不会获得经验值</li>
      </ul>
    </div>
    <div className={styles.ruleSection}>
      <h4>互动操作</h4>
      <ul>
        <li>喂食：增加20点饥饿度和5点心情值，消耗5积分</li>
        <li>抚摸：增加15点心情值，消耗3积分</li>
        <li>互动操作有1分钟冷却时间</li>
        <li>修改名称：消耗100积分</li>
      </ul>
    </div>
    <div className={styles.ruleSection}>
      <h4>积分获取</h4>
      <ul>
        <li>宠物每天自动产出积分，积分数量等于宠物等级</li>
        <li>每天最高可获得10积分</li>
        <li>如果饥饿度和心情值都为0，宠物将不会产出积分</li>
      </ul>
    </div>
    <div className={styles.ruleSection}>
      <h4>皮肤系统</h4>
      <ul>
        <li>可以在商店中使用积分购买不同的宠物皮肤</li>
        <li>已购买的皮肤会显示在皮肤馆中，可以随时切换使用</li>
        <li>皮肤一旦购买成功，永久拥有</li>
      </ul>
    </div>
  </div>
);

// 商店 Tab 组件
interface ShopTabsProps {
  renderSkinsList: (showAll: boolean) => React.ReactNode;
}

const ShopTabs: React.FC<ShopTabsProps> = ({ renderSkinsList }) => {
  return (
    <Tabs
      defaultActiveKey="skin"
      items={[
        {
          key: 'skin',
          label: (
            <span>
              <SkinOutlined /> 皮肤商店
            </span>
          ),
          children: renderSkinsList(true),
        },
        {
          key: 'props',
          label: (
            <span>
              <GiftOutlined /> 道具商店
            </span>
          ),
          children: (
            <div className={styles.shopEmpty}>
              <div className={styles.emptyIcon}>🛒</div>
              <div className={styles.emptyText}>更多道具即将上架，敬请期待！</div>
            </div>
          ),
        },
      ]}
    />
  );
};

const MoyuPet: React.FC<MoyuPetProps> = ({ visible, onClose, otherUserId, otherUserName }) => {
  const [pet, setPet] = useState<API.PetVO | API.OtherUserPetVO | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedLoading, setFeedLoading] = useState(false);
  const [patLoading, setPatLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isOtherUserEmptyPet, setIsOtherUserEmptyPet] = useState(false); // 添加状态来跟踪是否是其他用户的空宠物状态
  const isOtherUser = !!otherUserId; // 是否查看其他用户的宠物
  const [skins, setSkins] = useState<API.PetSkinVO[]>([]);
  const [skinLoading, setSkinLoading] = useState(false);
  const [exchangeLoading, setExchangeLoading] = useState<number | null>(null);
  const [setCurrentSkinLoading, setSetCurrentSkinLoading] = useState<number | null>(null);

  // 获取宠物数据
  const fetchPetData = async () => {
    setLoading(true);
    try {
      if (isOtherUser && otherUserId) {
        // 获取其他用户的宠物信息
        const res = await getOtherUserPetUsingGet({ otherUserId });
        if (res.code === 0 && res.data) {
          setPet(res.data);
          setIsOtherUserEmptyPet(false);
        } else {
          // 显示空宠物界面而不是关闭
          setPet(null);
          setIsCreating(false);
          setIsOtherUserEmptyPet(true);
        }
      } else {
        // 获取当前用户的宠物信息
        const res = await getPetDetailUsingGet();
        if (res.code === 0 && res.data) {
          setPet(res.data);
          setIsOtherUserEmptyPet(false); // 确保重置其他用户空宠物状态
          setIsCreating(false); // 确保不显示创建表单
        } else if (res.code === 0 && !res.data) {
          // 如果没有宠物，显示创建宠物表单
          setPet(null);
          setIsCreating(true);
          setIsOtherUserEmptyPet(false); // 确保重置其他用户空宠物状态
        }
      }
    } catch (error) {
      console.error('获取宠物信息失败', error);
      message.error('获取宠物信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建宠物
  const handleCreatePet = async () => {
    if (!petName.trim()) {
      message.warning('请输入宠物名称');
      return;
    }

    setLoading(true);
    try {
      const res = await createPetUsingPost({
        name: petName
      });

      if (res.code === 0 && res.data) {
        message.success('创建宠物成功');
        setIsCreating(false);
        fetchPetData(); // 重新获取宠物数据
      } else {
        message.error(res.message || '创建宠物失败');
      }
    } catch (error) {
      console.error('创建宠物失败', error);
      message.error('创建宠物失败');
    } finally {
      setLoading(false);
    }
  };

  // 喂食宠物
  const handleFeed = async () => {
    if (!pet?.petId) return;

    setFeedLoading(true);
    try {
      const res = await feedPetUsingPost({ petId: pet.petId });
      if (res.code === 0 && res.data) {
        message.success('喂食成功');
        setPet(res.data);
      } else {
        message.error(res.message || '喂食失败');
      }
    } catch (error) {
      console.error('喂食失败', error);
      message.error('喂食失败，可能处于冷却时间');
    } finally {
      setFeedLoading(false);
    }
  };

  // 抚摸宠物
  const handlePat = async () => {
    if (!pet?.petId) return;

    setPatLoading(true);
    try {
      const res = await patPetUsingPost({ petId: pet.petId });
      if (res.code === 0 && res.data) {
        message.success('抚摸成功');
        setPet(res.data);
      } else {
        message.error(res.message || '抚摸失败');
      }
    } catch (error) {
      console.error('抚摸失败', error);
      message.error('抚摸失败，可能处于冷却时间');
    } finally {
      setPatLoading(false);
    }
  };

  // 修改宠物名称
  const handleRename = async () => {
    if (!pet?.petId || !newName.trim()) {
      message.warning('请输入新的宠物名称');
      return;
    }

    // 确认是否修改名称
    Modal.confirm({
      title: '确认修改宠物名称',
      content: '修改宠物名称将消耗100积分，确定要继续吗？',
      okText: '确认修改',
      cancelText: '取消',
      onOk: async () => {
        setRenameLoading(true);
        try {
          const res = await updatePetNameUsingPost({
            petId: pet.petId,
            name: newName
          });

          if (res.code === 0 && res.data) {
            message.success('修改名称成功');
            setPet({...pet, name: newName});
            setIsRenaming(false);
            setNewName('');
          } else {
            message.error(res.message || '修改名称失败');
          }
        } catch (error) {
          console.error('修改名称失败', error);
          message.error('修改名称失败，可能是积分不足');
        } finally {
          setRenameLoading(false);
        }
      }
    });
  };

  // 获取宠物皮肤列表
  const fetchPetSkins = async () => {
    if (isOtherUser) return; // 如果是查看其他用户的宠物，不需要获取皮肤列表
    
    setSkinLoading(true);
    try {
      const res = await listPetSkinsUsingGet({
        current: 1,
        pageSize: 100,
      });
      
      if (res.code === 0 && res.data?.records) {
        // 添加原皮卡片，ID为-1
        const originalSkin: API.PetSkinVO = {
          skinId: -1,
          name: '原皮',
          description: '最初的样子，朴素而自然',
          url: 'https://api.oss.cqbo.com/moyu/pet/超级玛丽马里奥 (73)_爱给网_aigei_com.png', // 使用默认图片，可以根据实际情况调整
          points: 0,
          owned: true, // 默认拥有
        };
        
        // 将原皮添加到皮肤列表的开头
        setSkins([originalSkin, ...res.data.records]);
      } else {
        message.error(res.message || '获取皮肤列表失败');
      }
    } catch (error) {
      console.error('获取皮肤列表失败', error);
      message.error('获取皮肤列表失败');
    } finally {
      setSkinLoading(false);
    }
  };

  // 兑换皮肤
  const handleExchangeSkin = async (skinId: number) => {
    // 添加二次确认
    Modal.confirm({
      title: '确认购买皮肤',
      content: `确定要花费 ${skins.find(skin => skin.skinId === skinId)?.points || 0} 积分购买该皮肤吗？`,
      okText: '确认购买',
      cancelText: '取消',
      onOk: async () => {
        setExchangeLoading(skinId);
        try {
          const res = await exchangePetSkinUsingPost({
            skinId
          });
          
          if (res.code === 0 && res.data) {
            message.success('购买皮肤成功');
            // 更新皮肤列表中的owned状态
            setSkins(skins.map(skin => 
              skin.skinId === skinId ? { ...skin, owned: true } : skin
            ));
            // 重新获取宠物信息，更新皮肤列表
            fetchPetData();
          } else {
            message.error(res.message || '购买皮肤失败');
          }
        } catch (error) {
          console.error('购买皮肤失败', error);
          message.error('购买皮肤失败，可能是积分不足');
        } finally {
          setExchangeLoading(null);
        }
      }
    });
  };

  // 设置当前皮肤
  const handleSetCurrentSkin = async (skinId: number) => {
    if (!pet?.petId) return;
    
    setSetCurrentSkinLoading(skinId);
    try {
      // 如果是原皮(ID为-1)，需要特殊处理
      if (skinId === -1) {
        // 这里假设后端API支持传入-1作为原皮ID
        // 如果后端不支持，可能需要修改后端代码或使用其他方式处理
        const res = await setPetSkinUsingPost({
          skinId: -1
        });
        
        if (res.code === 0 && res.data) {
          message.success('设置原皮成功');
          setPet(res.data);
        } else {
          message.error(res.message || '设置原皮失败');
        }
      } else {
        // 正常皮肤处理
        const res = await setPetSkinUsingPost({
          skinId
        });
        
        if (res.code === 0 && res.data) {
          message.success('设置皮肤成功');
          setPet(res.data);
        } else {
          message.error(res.message || '设置皮肤失败');
        }
      }
    } catch (error) {
      console.error('设置皮肤失败', error);
      message.error('设置皮肤失败');
    } finally {
      setSetCurrentSkinLoading(null);
    }
  };

  useEffect(() => {
    if (visible) {
      // 重置状态，避免显示上一次的结果
      setPet(null);
      setIsCreating(false);
      setIsOtherUserEmptyPet(false);
      fetchPetData();
      fetchPetSkins(); // 获取皮肤列表
    }
  }, [visible, otherUserId]);

  // 创建宠物表单
  if (isCreating) {
    return (
      <Modal
        title="创建你的摸鱼宠物"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <Form layout="vertical">
            <Form.Item label="给你的宠物起个名字">
              <Input
                placeholder="请输入宠物名称"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                maxLength={10}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                onClick={handleCreatePet}
                loading={loading}
                block
              >
                创建宠物
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }

  // 加载中或没有宠物数据
  if (loading) {
    return (
      <Modal
        title="我的摸鱼宠物"
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          加载中...
        </div>
      </Modal>
    );
  }

  // 显示其他用户的空宠物状态
  if (isOtherUserEmptyPet) {
    return (
      <Modal
        title={
          <div className={styles.petModalTitle}>
            <span className={styles.petIcon}>🐟</span>
            <span>{`${otherUserName || '用户'}的宠物`}</span>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={700}
        className={styles.petModal}
      >
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}><SmileOutlined /></div>
          <div style={{ fontSize: '16px' }}>该用户还没有养宠物哦~</div>
        </div>
      </Modal>
    );
  }

  // 渲染皮肤列表
  const renderSkinsList = (showAll = false) => {
    // 如果showAll为true，显示所有皮肤（商店），否则只显示已拥有的皮肤（皮肤馆）
    const filteredSkins = showAll ? skins : skins.filter(skin => skin.owned);
    
    if (skinLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin tip="加载中..." />
        </div>
      );
    }
    
    if (filteredSkins.length === 0) {
      return (
        <div className={styles.shopEmpty} style={{ textAlign: 'center', padding: '50px 0' }}>
          <div className={styles.emptyIcon} style={{ fontSize: '48px', marginBottom: '20px' }}>
            {showAll ? '🛒' : '👕'}
          </div>
          <div className={styles.emptyText} style={{ fontSize: '16px' }}>
            {showAll ? '暂无可购买的皮肤' : '暂无已拥有的皮肤'}
          </div>
        </div>
      );
    }
    
    return (
      <div className={styles.skinsList}>
        <Row gutter={[12, 12]}>
          {filteredSkins.map((skin) => (
            <Col span={8} key={skin.skinId}>
              <Card
                className={`${styles.skinCard} ${skin.owned ? styles.ownedSkin : ''}`}
                hoverable
                size="small"
                cover={
                  <div className={styles.skinImageContainer}>
                    <img
                      alt={skin.name}
                      src={skin.url}
                      className={styles.skinImage}
                    />
                    {skin.owned && (
                      (skin.skinId === -1 && (!pet?.petUrl || pet.petUrl === skin.url)) || 
                      (skin.skinId !== -1 && pet?.petUrl === skin.url)
                    ) && (
                      <div className={styles.currentSkinBadge}>
                        当前使用
                      </div>
                    )}
                  </div>
                }
                bodyStyle={{ padding: '12px 16px' }}
              >
                <Card.Meta
                  title={<div className={styles.skinTitle}>{skin.name}</div>}
                  description={<div className={styles.skinDescription}>{skin.description}</div>}
                />
                <div className={styles.skinPrice}>
                  {skin.points} 积分
                </div>
                <div className={styles.skinActions}>
                  {skin.owned ? (
                    <Button
                      type="primary"
                      size="small"
                      disabled={(skin.skinId === -1 && (!pet?.petUrl || pet.petUrl === skin.url)) || 
                               (skin.skinId !== -1 && pet?.petUrl === skin.url)}
                      onClick={() => handleSetCurrentSkin(skin.skinId || 0)}
                      loading={setCurrentSkinLoading === skin.skinId}
                      icon={(skin.skinId === -1 && (!pet?.petUrl || pet.petUrl === skin.url)) || 
                            (skin.skinId !== -1 && pet?.petUrl === skin.url) ? <CheckOutlined /> : <SkinOutlined />}
                    >
                      {(skin.skinId === -1 && (!pet?.petUrl || pet.petUrl === skin.url)) || 
                       (skin.skinId !== -1 && pet?.petUrl === skin.url) ? '当前使用中' : '使用'}
                    </Button>
                  ) : showAll ? (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleExchangeSkin(skin.skinId || 0)}
                      loading={exchangeLoading === skin.skinId}
                      icon={<ShoppingOutlined />}
                    >
                      购买
                    </Button>
                  ) : null}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className={styles.petModalTitle}>
          <span className={styles.petIcon}>🐟</span>
          <span>
            {isOtherUser ? `${otherUserName || '用户'}的宠物` : '我的摸鱼宠物'}
            <Popover
              content={<PetRules />}
              title="宠物系统说明"
              placement="bottom"
              trigger="click"
              overlayStyle={{ width: 300 }}
              overlayInnerStyle={{
                backgroundColor: '#fff',
                boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Button
                type="text"
                icon={<QuestionCircleOutlined />}
                size="small"
                className={styles.titleHelpButton}
              />
            </Popover>
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      className={styles.petModal}
    >
      <div className={styles.petContainer}>
        <div className={styles.petInfo}>
          <div className={styles.petAvatar}>
            <Avatar src={pet?.petUrl} size={100} />
          </div>
          <div className={styles.petDetails}>
            <div className={styles.petName}>
              <span className={styles.name}>
                {pet?.name}
                {!isOtherUser && !isRenaming ? (
                  <Tooltip title="修改名称需要消耗100积分">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setIsRenaming(true)}
                      icon={<EditOutlined />}
                      className={styles.renameButton}
                    >
                      修改
                    </Button>
                  </Tooltip>
                ) : isRenaming ? (
                  <div className={styles.renameContainer}>
                    <Input
                      size="small"
                      placeholder="请输入新名称"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={10}
                      autoFocus
                      className={styles.renameInput}
                      prefix={<EditOutlined />}
                      suffix={
                        <span className={styles.charCount}>
                          {newName.length}/10
                        </span>
                      }
                    />
                    <div className={styles.renameActions}>
                      <Button
                        size="small"
                        type="primary"
                        onClick={handleRename}
                        loading={renameLoading}
                        icon={<CheckOutlined />}
                      >
                        确定
                      </Button>
                      <Button
                        size="small"
                        onClick={() => {setIsRenaming(false); setNewName('');}}
                        icon={<CloseOutlined />}
                        className={styles.cancelButton}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : null}
              </span>
              <span className={styles.level}>Lv.{pet?.level || 1}</span>
            </div>
            <div className={styles.petStatus}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <HeartOutlined /> 心情:
                </span>
                <div className={styles.statusProgressContainer}>
                  <Progress
                    percent={(pet?.mood || 0) / 100 * 100}
                    status="active"
                    strokeColor="#ff7875"
                    size="small"
                  />
                  <Tooltip title="心情值影响宠物的积分产出和经验获取">
                    <InfoCircleOutlined className={styles.statusInfo} />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <ThunderboltOutlined /> 饥饿:
                </span>
                <div className={styles.statusProgressContainer}>
                  <Progress
                    percent={(pet?.hunger || 0) / 100 * 100}
                    status="active"
                    strokeColor="#52c41a"
                    size="small"
                  />
                  <Tooltip title="饥饿值影响宠物的积分产出和经验获取">
                    <InfoCircleOutlined className={styles.statusInfo} />
                  </Tooltip>
                </div>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>
                  <ExperimentOutlined /> 经验:
                </span>
                <div className={styles.statusProgressContainer}>
                  {pet && (
                    <Progress
                      percent={(pet as any).exp ? ((pet as any).exp / 100 * 100) : 0}
                      status="active"
                      strokeColor="#1890ff"
                      size="small"
                    />
                  )}
                  <Tooltip title="每100点经验可提升1级">
                    <InfoCircleOutlined className={styles.statusInfo} />
                  </Tooltip>
                </div>
              </div>
            </div>
            {!isOtherUser && (
              <div className={styles.petActions} style={{ marginTop: 10 }}>
                <Button type="primary" onClick={handleFeed} loading={feedLoading} style={{ marginRight: 8 }}>
                  喂食 <span className={styles.costBadge}>-5积分</span>
                </Button>
                <Button type="primary" onClick={handlePat} loading={patLoading}>
                  抚摸 <span className={styles.costBadge}>-3积分</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs
          defaultActiveKey={isOtherUser ? "skills" : "items"}
          items={[
            ...(isOtherUser ? [] : [{
              key: 'items',
              label: (
                <span>
                  <GiftOutlined /> 物品
                </span>
              ),
              children: (
                <div className={styles.itemsContainer}>
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Card className={styles.itemCard}>
                        <div className={styles.itemIcon}>🍞</div>
                        <div className={styles.itemName}>鱼饵</div>
                        <div className={styles.itemCount}>数量: 5</div>
                        <div className={styles.itemDesc}>恢复20点饥饿值</div>
                        <div className={styles.itemActions}>
                          <Button
                            type="primary"
                            size="small"
                            disabled
                          >
                            敬请期待
                          </Button>
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card className={styles.itemCard}>
                        <div className={styles.itemIcon}>🎾</div>
                        <div className={styles.itemName}>玩具球</div>
                        <div className={styles.itemCount}>数量: 3</div>
                        <div className={styles.itemDesc}>提高15点心情值</div>
                        <div className={styles.itemActions}>
                          <Button
                            type="primary"
                            size="small"
                            disabled
                          >
                            敬请期待
                          </Button>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            }]),
            {
              key: 'skills',
              label: (
                <span>
                  <ThunderboltOutlined /> 技能
                </span>
              ),
              children: (
                <div className={styles.skillsContainer}>
                  <div className={styles.shopEmpty} style={{ textAlign: 'center', padding: '50px 0' }}>
                    <div className={styles.emptyIcon} style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
                    <div className={styles.emptyText} style={{ fontSize: '16px' }}>技能系统即将开放，敬请期待！</div>
                  </div>
                </div>
              ),
            },
            ...(isOtherUser ? [] : [{
              key: 'shop',
              label: (
                <span>
                  <ShoppingOutlined /> 商店
                </span>
              ),
              children: (
                <div className={styles.shopContainer}>
                  {isOtherUser ? (
                    <div className={styles.shopEmpty}>
                      <div className={styles.emptyIcon}>🛒</div>
                      <div className={styles.emptyText}>无法查看其他用户的商店</div>
                    </div>
                  ) : (
                    <ShopTabs renderSkinsList={renderSkinsList} />
                  )}
                </div>
              ),
            }]),
            {
              key: 'skin',
              label: (
                <span>
                  <SkinOutlined /> 皮肤馆
                </span>
              ),
              children: (
                <div className={styles.skinContainer}>
                  {isOtherUser ? (
                    <div className={styles.otherUserSkins}>
                      {pet?.skins && pet.skins.length > 0 ? (
                        <div className={styles.skinsList}>
                          <Row gutter={[12, 12]}>
                            {pet.skins.map((skin) => (
                              <Col span={8} key={skin.skinId}>
                                <Card
                                  className={`${styles.skinCard} ${styles.ownedSkin}`}
                                  hoverable
                                  size="small"
                                  cover={
                                    <div className={styles.skinImageContainer}>
                                      <img
                                        alt={skin.name}
                                        src={skin.url}
                                        className={styles.skinImage}
                                      />
                                      {(skin.skinId === -1 && (!pet?.petUrl || pet.petUrl === skin.url)) || 
                                       (skin.skinId !== -1 && pet?.petUrl === skin.url) ? (
                                        <div className={styles.currentSkinBadge}>
                                          当前使用
                                        </div>
                                      ) : null}
                                    </div>
                                  }
                                  bodyStyle={{ padding: '12px 16px' }}
                                >
                                  <Card.Meta
                                    title={<div className={styles.skinTitle}>{skin.name}</div>}
                                    description={<div className={styles.skinDescription}>{skin.description}</div>}
                                  />
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                          <div style={{ fontSize: '16px', marginBottom: '20px' }}>
                            当前皮肤
                          </div>
                          <Avatar src={pet?.petUrl} size={100} />
                        </div>
                      )}
                    </div>
                  ) : (
                    renderSkinsList(false)
                  )}
                </div>
              ),
            },
            {
              key: 'achievements',
              label: (
                <span>
                  <TrophyOutlined /> 成就
                </span>
              ),
              children: (
                <div className={styles.achievementsContainer}>
                  <div className={styles.shopEmpty} style={{ textAlign: 'center', padding: '50px 0' }}>
                    <div className={styles.emptyIcon} style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
                    <div className={styles.emptyText} style={{ fontSize: '16px' }}>成就系统即将开放，敬请期待！</div>
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default MoyuPet;

