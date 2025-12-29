import React, { useState } from 'react';
import { Card, Button, message, Empty, Modal } from 'antd';
import { GiftOutlined, HistoryOutlined } from '@ant-design/icons';
import styles from './Lottery.less';

interface LotteryRecord {
  id: number;
  prizeName: string;
  prizeIcon: string;
  drawTime: string;
}

const Lottery: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [selectedPrizeIndex, setSelectedPrizeIndex] = useState<number | null>(null);
  const [lotteryRecords, setLotteryRecords] = useState<LotteryRecord[]>([]);
  const [isTenDraw, setIsTenDraw] = useState<boolean>(false);
  const [tenDrawResults, setTenDrawResults] = useState<LotteryRecord[]>([]);
  const [showTenDrawModal, setShowTenDrawModal] = useState<boolean>(false);

  // 抽奖奖品列表（示例数据，后续可替换为API数据）
  const prizes = [
    { id: 1, name: '摸鱼币 x100', icon: '💰', rarity: 'common' },
    { id: 2, name: '摸鱼币 x500', icon: '💰', rarity: 'rare' },
    { id: 3, name: '摸鱼币 x1000', icon: '💰', rarity: 'epic' },
    { id: 4, name: '宠物经验 x50', icon: '⭐', rarity: 'common' },
    { id: 5, name: '宠物经验 x200', icon: '⭐', rarity: 'rare' },
    { id: 6, name: '稀有装备', icon: '⚔️', rarity: 'epic' },
    { id: 7, name: '传说装备', icon: '👑', rarity: 'legendary' },
    { id: 8, name: '谢谢参与', icon: '🎁', rarity: 'common' },
  ];

  // 单次抽奖
  const drawSingle = async (prizeIndex: number): Promise<void> => {
    return new Promise((resolve) => {
      // 计算旋转角度
      const anglePerPrize = 360 / prizes.length;
      // 指针固定在顶部（0度位置）
      // 转盘初始状态：索引0的奖品在顶部（0度位置）
      // 转盘顺时针旋转（CSS rotate正值是顺时针）
      // 第i个奖品的中心角度：i * anglePerPrize + anglePerPrize/2
      const prizeCenterAngle = prizeIndex * anglePerPrize + anglePerPrize / 2;
      
      // 要让prizeCenterAngle转到指针位置（0度），需要旋转的角度
      // 由于转盘顺时针旋转，要让prizeCenterAngle转到0度，需要旋转 (360 - prizeCenterAngle) 度
      const targetRelativeAngle = 360 - prizeCenterAngle;
      
      // 当前转盘已经旋转的角度（归一化到0-360）
      const currentAngle = ((rotation % 360) + 360) % 360;
      
      // 计算需要额外旋转的角度
      // 如果目标角度小于当前角度，需要多转一圈
      let additionalAngle = targetRelativeAngle - currentAngle;
      if (additionalAngle <= 0) {
        additionalAngle += 360;
      }
      
      // 加上多圈旋转（至少5圈=1800度）让转盘转得更久，更有视觉效果
      const totalRotation = rotation + 1800 + additionalAngle;
      
      setRotation(totalRotation);
      setIsSpinning(true);
      
      // 等待转盘旋转完成（2.5秒）
      setTimeout(() => {
        setIsSpinning(false);
        resolve();
      }, 2500);
    });
  };

  // 处理单次抽奖
  const handleDraw = async () => {
    if (drawing) return;
    
    setDrawing(true);
    setLoading(true);
    
    try {
      // TODO: 调用抽奖API
      // const res = await drawLotteryUsingPost();
      
      // 随机选择一个奖品索引
      const randomIndex = Math.floor(Math.random() * prizes.length);
      setSelectedPrizeIndex(randomIndex);
      
      // 执行转盘旋转
      await drawSingle(randomIndex);
      
      // 显示中奖结果
      const randomPrize = prizes[randomIndex];
      message.success(`恭喜获得：${randomPrize.name}！`);
      
      // 添加到抽奖记录
      const newRecord: LotteryRecord = {
        id: Date.now(),
        prizeName: randomPrize.name,
        prizeIcon: randomPrize.icon,
        drawTime: new Date().toLocaleString('zh-CN'),
      };
      setLotteryRecords(prev => [newRecord, ...prev]);
      
    } catch (error) {
      console.error('抽奖失败:', error);
      message.error('抽奖失败，请稍后重试');
    } finally {
      setLoading(false);
      setDrawing(false);
    }
  };

  // 处理十连抽
  const handleTenDraw = async () => {
    if (drawing) return;
    
    setDrawing(true);
    setIsTenDraw(true);
    setLoading(true);
    
    try {
      // 生成10个随机奖品
      const results: LotteryRecord[] = [];
      for (let i = 0; i < 10; i++) {
        // TODO: 调用抽奖API
        // const res = await drawLotteryUsingPost();
        
        // 随机选择一个奖品索引
        const randomIndex = Math.floor(Math.random() * prizes.length);
        const randomPrize = prizes[randomIndex];
        
        results.push({
          id: Date.now() + i,
          prizeName: randomPrize.name,
          prizeIcon: randomPrize.icon,
          drawTime: new Date().toLocaleString('zh-CN'),
        });
      }
      
      // 随机选择一个奖品作为转盘停止的位置（用于视觉效果）
      const displayIndex = Math.floor(Math.random() * prizes.length);
      setSelectedPrizeIndex(displayIndex);
      
      // 转盘只转一次
      await drawSingle(displayIndex);
      
      // 保存结果并显示弹窗
      setTenDrawResults(results);
      setShowTenDrawModal(true);
      
      // 批量添加到抽奖记录
      setLotteryRecords(prev => [...results, ...prev]);
      
    } catch (error) {
      console.error('十连抽失败:', error);
      message.error('十连抽失败，请稍后重试');
    } finally {
      setLoading(false);
      setDrawing(false);
      setIsTenDraw(false);
    }
  };

  // 关闭十连抽弹窗
  const handleCloseTenDrawModal = () => {
    setShowTenDrawModal(false);
    setTenDrawResults([]);
  };

  return (
    <div className={styles.lotteryContainer}>
      <div className={styles.lotteryHeader}>
        <div className={styles.lotteryTitle}>
          <GiftOutlined className={styles.lotteryTitleIcon} />
          <span>幸运抽奖</span>
        </div>
        <div className={styles.lotterySubtitle}>每日一次免费抽奖机会，丰厚奖品等你来拿！</div>
      </div>

      <div className={styles.lotteryContent}>
        {/* 左侧转盘区域 */}
        <div className={styles.leftSection}>
          <div className={styles.wheelContainer}>
            {/* 转盘指针 */}
            <div className={`${styles.wheelPointer} ${isSpinning ? styles.pointerSpinning : ''}`}>
              <div className={styles.pointerTriangle}>
                <div className={styles.pointerGlow}></div>
              </div>
              <div className={styles.pointerShadow}></div>
            </div>
            <div 
              className={`${styles.wheel} ${isSpinning ? styles.wheelSpinning : ''}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
              }}
            >
              {prizes.map((prize, index) => (
                <div
                  key={prize.id}
                  className={`${styles.wheelItem} ${styles[`rarity${prize.rarity}`]}`}
                  style={{
                    transform: `rotate(${index * (360 / prizes.length)}deg)`,
                  }}
                >
                  <div className={styles.wheelItemContent}>
                    <div className={styles.wheelItemIcon}>{prize.icon}</div>
                    <div className={styles.wheelItemName}>{prize.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.wheelCenter}>
              <div className={styles.drawButtons}>
                <Button
                  type="primary"
                  size="large"
                  icon={<GiftOutlined />}
                  onClick={handleDraw}
                  loading={loading && !isTenDraw}
                  disabled={drawing}
                  className={styles.drawButton}
                >
                  {drawing && !isTenDraw ? '抽奖中...' : '单抽'}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<GiftOutlined />}
                  onClick={handleTenDraw}
                  loading={loading && isTenDraw}
                  disabled={drawing}
                  className={`${styles.drawButton} ${styles.tenDrawButton}`}
                >
                  {drawing && isTenDraw ? '十连抽中...' : '十连抽'}
                </Button>
              </div>
            </div>
          </div>

          {/* 抽奖规则 */}
          <Card className={styles.rulesCard}>
            <div className={styles.rulesTitle}>抽奖规则</div>
            <ul className={styles.rulesList}>
              <li>每日可免费抽奖1次</li>
              <li>十连抽可获得更多奖励</li>
              <li>奖品将自动发放到账户</li>
              <li>活动最终解释权归平台所有</li>
            </ul>
          </Card>
        </div>

        {/* 右侧抽奖记录 */}
        <div className={styles.rightSection}>
          <Card className={styles.recordsCard}>
            <div className={styles.recordsTitle}>
              <HistoryOutlined className={styles.recordsIcon} />
              <span>抽奖记录</span>
            </div>
            <div className={styles.recordsList}>
              {lotteryRecords.length === 0 ? (
                <Empty 
                  description="暂无抽奖记录" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  className={styles.emptyRecords}
                />
              ) : (
                <div className={styles.recordsContent}>
                  {lotteryRecords.map((record) => (
                    <div key={record.id} className={styles.recordItem}>
                      <div className={styles.recordIcon}>{record.prizeIcon}</div>
                      <div className={styles.recordInfo}>
                        <div className={styles.recordPrizeName}>{record.prizeName}</div>
                        <div className={styles.recordTime}>{record.drawTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 十连抽结果弹窗 */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <GiftOutlined className={styles.modalTitleIcon} />
            <span>十连抽结果</span>
          </div>
        }
        open={showTenDrawModal}
        onCancel={handleCloseTenDrawModal}
        footer={[
          <Button key="confirm" type="primary" onClick={handleCloseTenDrawModal}>
            确定
          </Button>
        ]}
        width={600}
        className={styles.tenDrawModal}
      >
        <div className={styles.tenDrawResults}>
          {tenDrawResults.map((result, index) => (
            <div key={result.id} className={styles.resultItem}>
              <div className={styles.resultIcon}>{result.prizeIcon}</div>
              <div className={styles.resultName}>{result.prizeName}</div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Lottery;

