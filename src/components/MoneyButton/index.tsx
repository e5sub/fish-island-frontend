import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, Button } from 'antd';
import moment from 'moment';
import Draggable from 'react-draggable';
import './index.less';

interface MoneyButtonProps {
  isMoneyVisible: boolean;
  holidayInfo: { name: string; date: string } | null;
  timeInfo: { type: 'lunch' | 'work' | 'holiday'; timeRemaining: string; earnedAmount?: number };
  holidayTooltipStyle: string;
  setIsMoneyOpen: (isOpen: boolean) => void;
  setIsFoodRecommenderOpen: (isOpen: boolean) => void;
}

const MoneyButton: React.FC<MoneyButtonProps> = ({
  isMoneyVisible,
  holidayInfo,
  timeInfo,
  holidayTooltipStyle,
  setIsMoneyOpen,
  setIsFoodRecommenderOpen,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const nodeRef = useRef(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const savedPosition = localStorage.getItem('moneyButtonPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  const handleDragStart = () => {
    isDragging.current = false;
  };

  const handleDrag = () => {
    isDragging.current = true;
  };

  const handleDragStop = (e: any, data: any) => {
    if (isDragging.current) {
      const newPosition = { x: data.x, y: data.y };
      setPosition(newPosition);
      localStorage.setItem('moneyButtonPosition', JSON.stringify(newPosition));
    }
  };

  if (!isMoneyVisible) {
    return null;
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
    >
      <div ref={nodeRef} className="money-button-container">
        <Tooltip
          title={
            holidayInfo ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {holidayInfo.name}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#fff',
                  opacity: 0.9
                }}>
                  {moment(holidayInfo.date).format('YYYY年MM月DD日')}
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  {(() => {
                    const now = moment();
                    const holidayDate = moment(holidayInfo.date);
                    const diffDays = holidayDate.diff(now, 'days');

                    if (diffDays > 0) {
                      return `还有 ${diffDays} 天 🎉`;
                    } else {
                      const diffHours = holidayDate.diff(now, 'hours') % 24;
                      const diffMinutes = holidayDate.diff(now, 'minutes') % 60;
                      const diffSeconds = holidayDate.diff(now, 'seconds') % 60;

                      if (diffHours <= 0 && diffMinutes <= 0 && diffSeconds <= 0) {
                        return '假期已到 🎉';
                      }

                      return `还有 ${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}:${String(diffSeconds).padStart(2, '0')} 🎉`;
                    }
                  })()}
                </div>
              </div>
            ) : '加载中...'
          }
          placement="top"
          overlayClassName={holidayTooltipStyle}
        >
          <Button
            type="primary"
            shape="circle"
            onClick={() => {
              if (!isDragging.current) {
                setIsMoneyOpen(true);
              }
            }}
            className="money-button"
          >
            <div className="money-button-content">
              <Tooltip title="点击查看今天吃什么" placement="top">
                <div className="money-button-emoji" onClick={(e) => {
                  e.stopPropagation();
                  if (!isDragging.current) {
                    setIsFoodRecommenderOpen(true);
                  }
                }}>
                  {timeInfo.type === 'lunch' ? '🍱' : '🧑‍💻'}
                </div>
              </Tooltip>
              <div className="money-button-time">
                {timeInfo.type === 'lunch' ?
                  `午餐: ${timeInfo.timeRemaining}` :
                  `下班: ${timeInfo.timeRemaining}`
                }
              </div>
              {timeInfo.earnedAmount !== undefined && (
                <div className="money-button-amount">
                  💰：{timeInfo.earnedAmount.toFixed(2)}
                </div>
              )}
            </div>
          </Button>
        </Tooltip>
      </div>
    </Draggable>
  );
};

export default MoneyButton;