import React, { useState, useEffect, useRef } from 'react';
import { useModel, useParams, history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Input, Button, List, Avatar, message, Typography, Modal, Spin } from 'antd';
import { SendOutlined, UndoOutlined, ClearOutlined, SaveOutlined, PlayCircleOutlined, StepForwardOutlined, LogoutOutlined } from '@ant-design/icons';
import { wsService } from '@/services/websocket';
import { getRoomByIdUsingGet, guessWordUsingPost, saveDrawDataUsingPost, startGameUsingPost, nextRoundUsingPost, quitRoomUsingPost } from '@/services/backend/drawGameController';
import './index.less';

const { Text } = Typography;

interface DrawMessage {
  type: 'draw' | 'clear' | 'chat';
  data: any;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: number;
}

interface ChatMessage {
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: number;
}

const DrawPage: React.FC = () => {
  const params = useParams();
  const roomId = params.id;

  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [roomUsers, setRoomUsers] = useState<any[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [roundTime, setRoundTime] = useState<number>(60);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush'); // 添加工具类型状态
  const [eraserSize, setEraserSize] = useState(20); // 橡皮擦大小
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<API.DrawRoomVO | null>(null);

  // 记录绘画操作历史
  const [drawOperations, setDrawOperations] = useState<any[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatListRef = useRef<HTMLDivElement | null>(null);
  const drawingHistoryRef = useRef<ImageData[]>([]);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // 添加canvas尺寸状态
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // 判断当前用户是否在房间中
  const isCurrentUserInRoom = () => {
    // 添加调试日志
    console.log('当前用户:', currentUser);
    console.log('房间用户列表:', roomUsers);

    if (!currentUser || roomUsers.length === 0) return false;

    // 确保ID类型一致进行比较（可能一个是数字一个是字符串）
    const currentUserId = currentUser.id?.toString();

    // 输出每个房间用户的ID，方便调试
    roomUsers.forEach((user, index) => {
      console.log(`房间用户 ${index}:`, user);
    });

    // 检查房间用户列表中的用户ID字段名（可能有多种可能）
    const userInRoom = roomUsers.some(user => {
      // 尝试所有可能的ID字段
      const possibleIds = [
        user.id?.toString(),
        user.userId?.toString(),
        user.user?.id?.toString(),
        user.playerId?.toString()
      ];

      // 如果任何一个ID匹配，则认为用户在房间中
      return possibleIds.some(id => id === currentUserId);
    });

    console.log('当前用户ID:', currentUserId);
    console.log('用户是否在房间中:', userInRoom);

    // 临时解决方案：如果用户已登录且房间有用户，则允许发言
    // 这是为了调试目的，后续可以移除
    if (!userInRoom && currentUser && roomUsers.length > 0) {
      console.log('临时允许用户发言（调试模式）');
      return true;
    }

    return userInRoom;
  };

  // 获取房间信息
  useEffect(() => {
    if (roomId) {
      setLoading(true);
      getRoomByIdUsingGet({ roomId })
        .then((res) => {
          if (res.data) {
            setRoomInfo(res.data);

            // 设置房间相关状态
            setCurrentWord(res.data.currentWord || '');
            setRoomUsers(res.data.participants || []);

            // 判断当前用户是否是房主
            if (currentUser && res.data.creatorId === currentUser.id) {
              setIsRoomOwner(true);
            } else {
              setIsRoomOwner(res.data.currentDrawerId === currentUser?.id);
            }

            // 如果有绘画数据，恢复绘画
            if (res.data.drawData) {
              // 创建一个Image对象来加载base64数据
              const img = new Image();
              img.onload = () => {
                // 确保canvas已经初始化
                if (canvasRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  if (ctx) {
                    // 清空当前画布
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    // 将图像绘制到画布上
                    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                    // 保存当前状态到历史记录
                    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
                    drawingHistoryRef.current = [imageData];
                  }
                }
              };
              // 设置图片源为base64数据
              img.src = res.data.drawData;
            }

            // 计算剩余时间
            if (res.data.roundEndTime) {
              const now = new Date().getTime();
              const remainingTime = Math.max(0, Math.floor((res.data.roundEndTime - now) / 1000));
              setRoundTime(remainingTime);
            }
          } else {
            message.error('获取房间信息失败');
          }
        })
        .catch((err) => {
          console.error('获取房间信息出错:', err);
          message.error('获取房间信息出错');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [roomId, currentUser]);

  // 调整canvas大小以适应容器
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasContainerRef.current && canvasRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        const containerHeight = Math.min(400, window.innerHeight * 0.5); // 限制最大高度

        // 如果之前有内容，先保存当前画布内容
        let previousImageData: ImageData | null = null;
        if (drawingHistoryRef.current.length > 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            previousImageData = drawingHistoryRef.current[drawingHistoryRef.current.length - 1];
          }
        }

        // 更新canvas尺寸状态
        setCanvasSize({
          width: containerWidth,
          height: containerHeight
        });

        // 设置canvas的实际尺寸与显示尺寸一致
        canvasRef.current.width = containerWidth;
        canvasRef.current.height = containerHeight;

        // 如果之前有内容，需要重新绘制
        if (previousImageData && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            // 创建临时画布来处理缩放
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = previousImageData.width;
            tempCanvas.height = previousImageData.height;
            const tempCtx = tempCanvas.getContext('2d');

            if (tempCtx) {
              // 将之前的图像数据绘制到临时画布
              tempCtx.putImageData(previousImageData, 0, 0);

              // 清除当前画布
              ctx.clearRect(0, 0, containerWidth, containerHeight);

              // 将临时画布内容绘制到调整大小后的画布上
              ctx.drawImage(tempCanvas, 0, 0, containerWidth, containerHeight);

              // 保存新的状态
              const newImageData = ctx.getImageData(0, 0, containerWidth, containerHeight);
              drawingHistoryRef.current = [newImageData];
            }
          }
        }
      }
    };

    // 初始调整
    resizeCanvas();

    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 连接到WebSocket
  useEffect(() => {
    if (currentUser && roomId && !loading) {
      // 使用空字符串，实际连接会在WebSocketService内部使用请求头授权
      const token = localStorage.getItem('tokenValue');
      if (!token) {
        message.error('请先登录！');
        return;
      }
      wsService.connect(token);

      // 监听连接状态变化
      const checkConnection = () => {
        const connected = wsService.isConnected();
        setIsConnected(connected);
      };

      const interval = setInterval(checkConnection, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentUser, roomId, loading]);

  // 注册WebSocket消息处理
  useEffect(() => {
    // 处理画板消息
    wsService.addMessageHandler('draw', (data) => {

      // 如果消息中包含聊天内容，且消息的roomId等于当前房间ID，才添加到聊天室
      if (data.data.message && data.data.message.roomId === roomId) {
        const chatMessage: ChatMessage = {
          content: data.data.message.content,
          sender: {
            id: data.data.message.sender.id,
            name: data.data.message.sender.name,
            avatar: data.data.message.sender.avatar
          },
          timestamp: new Date(data.data.message.timestamp).getTime()
        };
        setMessages(prev => [...prev, chatMessage]);
      }
    });

    // 处理用户加入/离开消息
    wsService.addMessageHandler('user_event', (data) => {
      if (data.data.action === 'join') {
        setRoomUsers(prev => [...prev, data.data.user]);
        message.info(`${data.data.user.name} 加入了房间`);
      } else if (data.data.action === 'leave') {
        setRoomUsers(prev => prev.filter(user => user.id !== data.data.user.id));
        message.info(`${data.data.user.name} 离开了房间`);
      }
    });

    // 处理游戏状态更新
    wsService.addMessageHandler('game_state', (data) => {
      if (data.data.currentWord) {
        setCurrentWord(data.data.currentWord);
      }
      if (data.data.roundTime) {
        setRoundTime(data.data.roundTime);
      }
    });

    // 处理刷新绘画数据
    wsService.addMessageHandler('refreshDraw', (data) => {
      // 静默刷新房间数据，不显示任何加载状态
      if (roomId) {
        getRoomByIdUsingGet({ roomId })
          .then((res) => {
            if (res.data) {

              // 静默更新玩家列表
              setRoomUsers(res.data.participants || []);

              // 更新当前词语状态，并显示提示
              if (res.data.currentWord && res.data.currentWord !== currentWord) {
                setCurrentWord(res.data.currentWord);
                message.info(`当前词语已更新: ${res.data.currentWord}`);
              } else {
                setCurrentWord(res.data.currentWord || '');
              }

              // 更新房主状态
              if (currentUser) {
                setIsRoomOwner(
                  res.data.creatorId === currentUser.id ||
                  res.data.currentDrawerId === currentUser.id
                );
              }

              // 更新房间信息状态
              setRoomInfo(res.data);

              // 更新画布数据
              if (res.data.drawData && canvasRef.current) {
                const canvas = canvasRef.current;
                const img = new Image();
                img.onload = () => {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // 清空当前画布
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // 将图像绘制到画布上
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    // 保存当前状态到历史记录
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    drawingHistoryRef.current = [imageData];

                  }
                };
                // 设置图片源为base64数据
                img.src = res.data.drawData;
              }

              // 更新剩余时间
              if (res.data.roundEndTime) {
                const now = new Date().getTime();
                const remainingTime = Math.max(0, Math.floor((res.data.roundEndTime - now) / 1000));
                setRoundTime(remainingTime);
              }
            }
          })
          .catch(() => {
            // 静默处理错误，不显示任何错误提示
          });
      }
    });

    return () => {
      wsService.clearMessageHandlers();
    };
  }, [isRoomOwner, currentWord, roomId]);

  // 自动滚动聊天到底部
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]);

  // 处理画板消息
  const handleDrawMessageReceived = (data: DrawMessage) => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    switch (data.type) {
      case 'draw':
        if (data.data.action === 'start') {
          ctx.beginPath();
          ctx.moveTo(data.data.x, data.data.y);

          if (data.data.tool === 'brush') {
            ctx.strokeStyle = data.data.color;
            ctx.lineWidth = data.data.brushSize;
          } else if (data.data.tool === 'eraser') {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = data.data.eraserSize;
          }

          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        } else if (data.data.action === 'move') {
          ctx.lineTo(data.data.x, data.data.y);
          ctx.stroke();
        }
        break;
      case 'clear':
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawingHistoryRef.current = [];
        break;
      default:
        break;
    }
  };

  // Canvas事件处理 - 修复坐标计算
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isRoomOwner || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 保存当前画布状态
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(imageData);

      if (tool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round'; // 添加线条连接方式

        // 记录绘画操作，但不发送
        const operation = {
          action: 'start',
          tool: 'brush',
          x,
          y,
          color,
          brushSize
        };

        setDrawOperations(prev => [...prev, operation]);
      } else if (tool === 'eraser') {
        // 橡皮擦工具
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#FFFFFF'; // 白色橡皮擦
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 记录橡皮擦操作
        const operation = {
          action: 'start',
          tool: 'eraser',
          x,
          y,
          eraserSize
        };

        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isRoomOwner || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    currentPathRef.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();

      // 记录绘画操作，但不发送
      const operation = {
        action: 'move',
        tool: tool,
        x,
        y
      };

      setDrawOperations(prev => [...prev, operation]);
    }
  };

  // 添加触摸设备支持
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isRoomOwner || !canvasRef.current) return;
    e.preventDefault(); // 防止页面滚动

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    currentPathRef.current = [{ x, y }];

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // 保存当前画布状态
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      drawingHistoryRef.current.push(imageData);

      if (tool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 记录绘画操作
        const operation = {
          action: 'start',
          tool: 'brush',
          x,
          y,
          color,
          brushSize
        };

        setDrawOperations(prev => [...prev, operation]);
      } else if (tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = eraserSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 记录橡皮擦操作
        const operation = {
          action: 'start',
          tool: 'eraser',
          x,
          y,
          eraserSize
        };

        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isRoomOwner || !canvasRef.current) return;
    e.preventDefault(); // 防止页面滚动

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];

    // 使用缩放比例来正确计算坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    currentPathRef.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();

      // 记录绘画操作
      const operation = {
        action: 'move',
        tool: tool,
        x,
        y
      };

      setDrawOperations(prev => [...prev, operation]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !isRoomOwner) return;
    setIsDrawing(false);
  };

  // 撤销上一步
  const handleUndo = () => {
    if (!canvasRef.current || drawingHistoryRef.current.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const prevState = drawingHistoryRef.current.pop();
      if (prevState) {
        ctx.putImageData(prevState, 0, 0);

        // 记录撤销操作
        const operation = {
          action: 'undo'
        };

        setDrawOperations(prev => [...prev, operation]);
      }
    }
  };

  // 清空画布
  const handleClear = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      drawingHistoryRef.current = [];

      // 记录清空操作
      const operation = {
        action: 'clear'
      };

      setDrawOperations(prev => [...prev, operation]);
    }
  };

  // 保存画布并上传
  const handleSave = () => {
    if (!canvasRef.current || !roomId) return;

    const canvas = canvasRef.current;

    // 获取画布数据
    const imageDataUrl = canvas.toDataURL('image/png');

    // 显示加载状态
    const loadingKey = 'saveDrawing';
    message.loading({ content: '正在保存绘画...', key: loadingKey });

    // 调用保存API
    saveDrawDataUsingPost({
      drawData: imageDataUrl,
      roomId: roomId
    }).then((res) => {
      if (res.data) {
        message.success({ content: '绘画保存成功!', key: loadingKey });
      } else {
        message.error({ content: '保存失败: ' + (res.message || '未知错误'), key: loadingKey });
      }
    }).catch(err => {
      console.error('保存绘画失败:', err);
      message.error({ content: '保存失败: ' + (err.message || '未知错误'), key: loadingKey });
    });
  };

  // 发送聊天消息
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentUser || !roomId) return;

    // 检查用户是否在房间成员列表中
    if (!isCurrentUserInRoom()) {
      message.error('您不在当前房间中，无法发言');
      return;
    }

    // 创建本地消息对象
    const chatMessage: ChatMessage = {
      content: inputMessage,
      sender: {
        id: currentUser.id?.toString() || '',
        name: currentUser.userName || '',
        avatar: currentUser.userAvatar || ''
      },
      timestamp: Date.now()
    };

    // 立即在本地显示消息
    setMessages(prev => [...prev, chatMessage]);

    // 创建消息包装对象，用于API调用
    const messageWrapper = {
      message: {
        content: inputMessage,
        sender: {
          id: currentUser.id?.toString() || '',
          name: currentUser.userName || '',
          avatar: currentUser.userAvatar || ''
        },
        roomId: roomId,
        timestamp: new Date().toISOString()
      }
    };

    // 如果是绘画者，只发送聊天消息，不调用猜词API
    if (isRoomOwner) {
      guessWordUsingPost({
        guessWord: inputMessage,
        roomId: roomId,
        messageWrapper: messageWrapper
      })
      // 这里可以添加发送普通聊天消息的逻辑，如果后端有相应API
      // 目前只在本地显示
      setInputMessage('');
      return;
    }

    // 非绘画者调用猜词API
    guessWordUsingPost({
      guessWord: inputMessage,
      roomId: roomId,
      messageWrapper: messageWrapper
    })
      .then((res) => {
        if (res.data) {
          // 如果猜对了
          if (res.data.isCorrect) {
            message.success(`恭喜你猜对了！答案是：${res.data.guessWord}`);
          }
        }
      })
      .catch((err) => {
        console.error('猜词失败:', err);
        message.error('发送消息失败');
      });

    setInputMessage('');
  };

  // 切换绘图工具
  const switchTool = (selectedTool: 'brush' | 'eraser') => {
    setTool(selectedTool);
    // 如果切换到画笔，记得保存当前画笔设置
    message.info(`已切换到${selectedTool === 'brush' ? '画笔' : '橡皮擦'}`);
  };

  const colorOptions = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF'];

  // 处理开始游戏
  const handleStartGame = () => {
    if (!roomId) return;

    startGameUsingPost({ roomId })
      .then((res) => {
        if (res.data) {
          message.success('游戏已开始');
        }
      })
      .catch((err) => {
        console.error('开始游戏出错:', err);
        message.error('开始游戏出错');
      });
  };

  // 处理下一轮
  const handleNextRound = () => {
    if (!roomId) return;

    nextRoundUsingPost({ roomId })
      .then((res) => {
        if (res.data) {
          message.success('已进入下一轮');
        }
      })
      .catch((err) => {
        console.error('进入下一轮出错:', err);
        message.error('进入下一轮出错');
      });
  };

  // 处理退出房间
  const handleQuitRoom = () => {
    if (!roomId) return;

    Modal.confirm({
      title: '确认退出房间',
      content: '确定要退出当前房间吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const loadingKey = 'quitRoom';
        message.loading({ content: '正在退出房间...', key: loadingKey });

        quitRoomUsingPost({ roomId })
          .then((res) => {
            if (res.data) {
              message.success({ content: '已退出房间', key: loadingKey });
              // 退出成功后，返回到绘画游戏列表页面
              history.push('/draw');
            } else {
              message.error({ content: '退出房间失败: ' + (res.message || '未知错误'), key: loadingKey });
            }
          })
          .catch((err) => {
            console.error('退出房间失败:', err);
            message.error({ content: '退出房间失败: ' + (err.message || '未知错误'), key: loadingKey });
          });
      },
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Spin size="large" tip="加载房间信息中..." />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="draw-game-container">
        <div className="draw-game-content">
          {/* 画板区域 */}
          <div className="draw-canvas-section">
            <Card
              title={
                <div className="canvas-header">
                  <span>{isRoomOwner ? "你是绘画者" : "猜词环节"}</span>
                  {isRoomOwner && (
                    <div className="word-display">
                      当前词语: <Text strong>{currentWord || '(未设置)'}</Text>
                    </div>
                  )}

                  {/* 添加开始游戏按钮，仅对房主显示，且仅在等待状态下显示 */}
                  {isRoomOwner && roomInfo?.status === 'WAITING' && roomInfo?.participants && roomInfo.participants.length > 0 && (
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleStartGame}
                      className="start-game-btn"
                    >
                      开始游戏
                    </Button>
                  )}

                  {isRoomOwner && roomInfo?.status === 'PLAYING' && (
                    <Button
                      type="primary"
                      icon={<StepForwardOutlined />}
                      onClick={handleNextRound}
                      className="next-round-btn"
                      style={{ marginLeft: '8px' }}
                    >
                      下一轮
                    </Button>
                  )}

                  {/* 添加退出房间按钮 */}
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleQuitRoom}
                    className="quit-room-btn"
                    style={{ marginLeft: '8px' }}
                  >
                    退出房间
                  </Button>
                </div>
              }
              className="draw-canvas-card"
            >
              <div className="canvas-container" ref={canvasContainerRef}>
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="draw-canvas"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  onTouchStart={handleCanvasTouchStart}
                  onTouchMove={handleCanvasTouchMove}
                  onTouchEnd={handleCanvasMouseUp}
                />
              </div>

              {isRoomOwner && (
                <div className="canvas-toolbar">
                  <div className="tool-selector">
                    <Button
                      type={tool === 'brush' ? 'primary' : 'default'}
                      onClick={() => switchTool('brush')}
                      className="tool-button"
                    >
                      画笔
                    </Button>
                    <Button
                      type={tool === 'eraser' ? 'primary' : 'default'}
                      onClick={() => switchTool('eraser')}
                      className="tool-button"
                    >
                      橡皮擦
                    </Button>
                  </div>

                  {tool === 'brush' ? (
                    <>
                      <div className="color-palette">
                        {colorOptions.map((c) => (
                          <div
                            key={c}
                            className={`color-option ${color === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                          />
                        ))}
                      </div>

                      <div className="brush-size-controls">
                        <span>笔触大小:</span>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={brushSize}
                          onChange={(e) => setBrushSize(parseInt(e.target.value))}
                        />
                        <span>{brushSize}px</span>
                      </div>
                    </>
                  ) : (
                    <div className="brush-size-controls">
                      <span>橡皮大小:</span>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={eraserSize}
                        onChange={(e) => setEraserSize(parseInt(e.target.value))}
                      />
                      <span>{eraserSize}px</span>
                    </div>
                  )}

                  <div className="canvas-actions">
                    <Button icon={<UndoOutlined />} onClick={handleUndo}>撤销</Button>
                    <Button icon={<ClearOutlined />} danger onClick={handleClear}>清空</Button>
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      onClick={handleSave}
                    >
                      保存
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* 聊天室区域 */}
          <div className="chat-section">
            <Card title="聊天室" className="chat-card">
              <div className="chat-list" ref={chatListRef}>
                <List
                  itemLayout="horizontal"
                  dataSource={messages}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.sender.avatar} />}
                        title={<span>{item.sender.name} <Text type="secondary" style={{ fontSize: '12px' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </Text></span>}
                        description={item.content}
                      />
                    </List.Item>
                  )}
                />
              </div>

              <div className="chat-input">
                <Input
                  placeholder={isRoomOwner ? "输入聊天内容..." : "输入你的猜测..."}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  disabled={!isCurrentUserInRoom()}
                  suffix={
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!isCurrentUserInRoom()}
                    >
                      发送
                    </Button>
                  }
                />
                {currentUser && !isCurrentUserInRoom() && (
                  <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                    您不在当前房间中，无法发言
                  </div>
                )}
              </div>
            </Card>

            <Card title="房间成员" className="users-card">
              <List
                dataSource={roomUsers}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.userAvatar} />}
                      title={item.userName}
                      description={item.isCreator ? '(房主)' : (item.isCurrentDrawer ? '(当前绘画者)' : '玩家')}
                    />
                    <div>{item.score || 0}分</div>
                  </List.Item>
                )}
              />
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DrawPage;
