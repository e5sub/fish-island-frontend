import React, {useEffect, useState, useRef} from 'react';
import {useParams, history, Link} from 'umi';
import {Card, Avatar, Typography, Space, Divider, List, Button, message, Spin, Input, Pagination, Modal} from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  MessageOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import {getPostVoByIdUsingGet, deletePostUsingPost1} from '@/services/backend/postController';
import {doThumbUsingPost1} from '@/services/backend/postThumbController';
import {doPostFavourUsingPost} from '@/services/backend/postFavourController';
import {
  addCommentUsingPost,
  getCommentTreeUsingPost,
  getChildCommentsUsingPost,
  deletePostUsingPost as deleteCommentUsingPost
} from '@/services/backend/commentController';
import {doThumbUsingPost} from '@/services/backend/commentThumbController';
import {getLoginUserUsingGet} from '@/services/backend/userController';
import Vditor from 'vditor';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'vditor/dist/index.css';
import './index.less';

const {Title, Text, Paragraph} = Typography;
const {TextArea} = Input;

moment.locale('zh-cn');

// 扩展 CommentNodeVO 类型
interface ExtendedCommentNodeVO extends API.CommentNodeVO {
  hasThumb?: boolean;
  showReplyBox?: boolean;
  replyContent?: string;
  replyLoading?: boolean;
  children?: ExtendedCommentNodeVO[];
  previewChildren?: ExtendedCommentNodeVO[];
  childrenExpanded?: boolean; // 控制子评论的展开/收起状态
  hasLoadedAllChildren?: boolean; // 标记是否已加载全部子评论
  parentComment?: {
    user?: {
      userName?: string;
    }
  };
}

const PostDetail: React.FC = () => {
  const {id} = useParams<{ id: string }>();
  const [post, setPost] = useState<API.PostVO>();
  const [comments, setComments] = useState<ExtendedCommentNodeVO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentContent, setCommentContent] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<API.UserVO>();
  const [commentPagination, setCommentPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const contentRef = useRef<HTMLDivElement>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [commentCollapsed, setCommentCollapsed] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // 格式化时间
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = moment(timeString);
    const now = moment();

    if (now.diff(date, 'days') < 1) {
      // 今天内的时间显示为"xx小时前"或"xx分钟前"
      return date.fromNow();
    } else if (now.diff(date, 'days') < 7) {
      // 一周内的显示为"周几 HH:mm"
      return date.format('dddd HH:mm');
    } else if (now.year() === date.year()) {
      // 今年内的显示为"MM-DD HH:mm"
      return date.format('MM-DD HH:mm');
    } else {
      // 往年的显示为"YYYY-MM-DD HH:mm"
      return date.format('YYYY-MM-DD HH:mm');
    }
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const res = await getLoginUserUsingGet();
      if (res.data) {
        setCurrentUser(res.data);
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
    }
  };

  // 获取帖子详情
  const fetchPostDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await getPostVoByIdUsingGet({
        id: id
      } as any);

      if (res.data) {
        setPost(res.data);
        // 使用 Vditor 预览模式渲染内容
        setTimeout(() => {
          if (contentRef.current && res.data?.content) {
            Vditor.preview(contentRef.current, res.data?.content, {
              mode: 'light',
              hljs: {
                style: 'github',
                lineNumber: true,
              },
              speech: {
                enable: true,
              },
              anchor: 1,
              after() {
                // 渲染完成后的回调
                contentRef.current?.querySelectorAll('pre code').forEach((block) => {
                  // 为代码块添加复制按钮
                  Vditor.codeRender(block as HTMLElement);
                });
                
                // 处理表格和图片，确保不会导致横向滚动
                contentRef.current?.querySelectorAll('table').forEach((table) => {
                  table.style.maxWidth = '100%';
                  table.style.display = 'block';
                  table.style.overflowX = 'auto';
                  table.style.width = 'fit-content';
                  table.style.margin = '0 auto';
                });
                
                contentRef.current?.querySelectorAll('img').forEach((img) => {
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                  // 防止图片加载后撑开容器
                  img.addEventListener('load', () => {
                    img.style.maxWidth = '100%';
                  });
                });
                
                // 处理可能导致溢出的元素
                contentRef.current?.querySelectorAll('iframe, video, embed, object').forEach((elem) => {
                  elem.setAttribute('style', 'max-width: 100%; width: 100%;');
                });
                
                // 处理长链接文本
                contentRef.current?.querySelectorAll('a').forEach((link) => {
                  link.style.wordBreak = 'break-word';
                  link.style.overflowWrap = 'break-word';
                });
                
                // 处理代码块
                contentRef.current?.querySelectorAll('pre').forEach((pre) => {
                  pre.style.maxWidth = '100%';
                  pre.style.overflowX = 'auto';
                  pre.style.whiteSpace = 'pre-wrap';
                  pre.style.wordBreak = 'break-word';
                });
              }
            });
          }
        }, 0);
      }
    } catch (error) {
      message.error('获取帖子详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取评论列表
  const fetchComments = async () => {
    if (!id) return;

    setCommentsLoading(true);
    try {
      const res = await getCommentTreeUsingPost({
        postId: id as unknown as number,
        current: commentPagination.current,
        pageSize: commentPagination.pageSize,
        sortField: 'createTime',
        sortOrder: 'descend'
      });

      if (res.data) {
        // 将API返回的评论数据转换为ExtendedCommentNodeVO类型
        const commentsList = res.data.records || [];
        // 为每个评论添加额外的UI状态属性
        const enhancedComments = commentsList.map((comment: any) => ({
          ...comment,
          showReplyBox: false,
          replyContent: '',
          replyLoading: false,
          childrenExpanded: true, // 默认展开子评论
          hasLoadedAllChildren: false, // 默认未加载全部子评论
          // 处理previewChildren
          previewChildren: comment.previewChildren ? comment.previewChildren.map((child: any) => ({
            ...child,
            showReplyBox: false,
            replyContent: '',
            replyLoading: false
          })) : [],
          // 处理children
          children: comment.children ? comment.children.map((child: any) => ({
            ...child,
            showReplyBox: false,
            replyContent: '',
            replyLoading: false
          })) : []
        }));
        setComments(enhancedComments);
        setCommentPagination({
          ...commentPagination,
          total: res.data.total || 0
        });
      }
    } catch (error) {
      console.error('获取评论失败', error);
      message.error('获取评论失败');
    } finally {
      setCommentsLoading(false);
    }
  };

  // 加载更多子评论
  const loadMoreChildComments = async (rootId: number | string) => {
    if (!id) return;

    try {
      const res = await getChildCommentsUsingPost({
        rootId: rootId as any,
        current: 1,
        pageSize: 20, // 一次性获取较多子评论
        sortField: 'createTime',
        sortOrder: 'ascend'
      });

      if (res.data && res.data.records) {
        // 处理子评论数据
        const childComments = res.data.records.map((child: any) => ({
          ...child,
          showReplyBox: false,
          replyContent: '',
          replyLoading: false
        }));

        // 更新评论列表中对应根评论的子评论
        setComments(comments.map(comment => {
          if (comment.id === rootId) {
            return {
              ...comment,
              children: childComments,
              previewChildren: [], // 清空预览子评论，避免重复显示
              hasLoadedAllChildren: true // 标记已加载全部子评论
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('获取子评论失败', error);
      message.error('获取子评论失败');
    }
  };

  // 处理评论分页变化
  const handleCommentPageChange = (page: number) => {
    setCommentPagination({
      ...commentPagination,
      current: page
    });
  };

  // 点赞帖子
  const handleThumbPost = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    if (!id || !post) return;

    try {
      await doThumbUsingPost1({
        postId: id
      } as any);

      // 不刷新整个页面，只更新点赞状态和数量
      setPost({
        ...post,
        hasThumb: !post.hasThumb,
        thumbNum: post.hasThumb ? (post.thumbNum || 1) - 1 : (post.thumbNum || 0) + 1
      });
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 收藏帖子
  const handleFavourPost = async () => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    if (!id || !post) return;

    try {
      await doPostFavourUsingPost({
        postId: id
      } as any);

      // 不刷新整个页面，只更新收藏状态和数量
      setPost({
        ...post,
        hasFavour: !post.hasFavour,
        favourNum: post.hasFavour ? (post.favourNum || 1) - 1 : (post.favourNum || 0) + 1
      });
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 点赞评论
  const handleThumbComment = async (commentId: number | string) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    try {
      await doThumbUsingPost({
        commentId: commentId
      } as any);

      // 不刷新整个页面，只更新该评论的点赞状态和数量
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            hasThumb: !comment.hasThumb,
            thumbNum: comment.hasThumb ? (comment.thumbNum || 1) - 1 : (comment.thumbNum || 0) + 1
          };
        }
        // 检查子评论
        if (comment.children && comment.children.length > 0) {
          return {
            ...comment,
            children: comment.children.map(child => {
              if (child.id === commentId) {
                return {
                  ...child,
                  hasThumb: !child.hasThumb,
                  thumbNum: child.hasThumb ? (child.thumbNum || 1) - 1 : (child.thumbNum || 0) + 1
                };
              }
              return child;
            })
          };
        }
        // 检查预览子评论
        if (comment.previewChildren && comment.previewChildren.length > 0) {
          return {
            ...comment,
            previewChildren: comment.previewChildren.map(child => {
              if (child.id === commentId) {
                return {
                  ...child,
                  hasThumb: !child.hasThumb,
                  thumbNum: child.hasThumb ? (child.thumbNum || 1) - 1 : (child.thumbNum || 0) + 1
                };
              }
              return child;
            })
          };
        }
        return comment;
      }));
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 切换回复框显示状态
  const toggleReplyBox = (commentId: number | string) => {
    console.log('切换回复框:', commentId);

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const newShowReplyBox = !comment.showReplyBox;
        console.log('根评论切换回复框状态:', newShowReplyBox);

        return {
          ...comment,
          showReplyBox: newShowReplyBox,
          // 如果是打开回复框，则初始化回复内容为空字符串
          replyContent: newShowReplyBox ? '' : comment.replyContent
        };
      }

      // 检查子评论
      if (comment.children && comment.children.length > 0) {
        let found = false;
        const updatedChildren = comment.children.map(child => {
          if (child.id === commentId) {
            found = true;
            const newShowReplyBox = !child.showReplyBox;
            console.log('子评论切换回复框状态:', newShowReplyBox);

            return {
              ...child,
              showReplyBox: newShowReplyBox,
              // 如果是打开回复框，则初始化回复内容为空字符串
              replyContent: newShowReplyBox ? '' : child.replyContent
            };
          }
          return child;
        });

        if (found) {
          return {
            ...comment,
            children: updatedChildren
          };
        }
      }

      // 检查预览子评论
      if (comment.previewChildren && comment.previewChildren.length > 0) {
        let found = false;
        const updatedPreviewChildren = comment.previewChildren.map(child => {
          if (child.id === commentId) {
            found = true;
            const newShowReplyBox = !child.showReplyBox;
            console.log('预览子评论切换回复框状态:', newShowReplyBox);

            return {
              ...child,
              showReplyBox: newShowReplyBox,
              // 如果是打开回复框，则初始化回复内容为空字符串
              replyContent: newShowReplyBox ? '' : child.replyContent
            };
          }
          return child;
        });

        if (found) {
          return {
            ...comment,
            previewChildren: updatedPreviewChildren
          };
        }
      }

      return comment;
    }));
  };

  // 更新回复内容
  const updateReplyContent = (commentId: number | string, content: string) => {
    console.log('更新回复内容:', commentId, content);
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replyContent: content
        };
      }
      // 检查子评论
      if (comment.children && comment.children.length > 0) {
        const updatedChildren = comment.children.map(child => {
          if (child.id === commentId) {
            return {
              ...child,
              replyContent: content
            };
          }
          return child;
        });

        return {
          ...comment,
          children: updatedChildren
        };
      }
      // 检查预览子评论
      if (comment.previewChildren && comment.previewChildren.length > 0) {
        const updatedPreviewChildren = comment.previewChildren.map(child => {
          if (child.id === commentId) {
            return {
              ...child,
              replyContent: content
            };
          }
          return child;
        });

        return {
          ...comment,
          previewChildren: updatedPreviewChildren
        };
      }
      return comment;
    }));
  };

  // 提交回复
  const handleSubmitReply = async (parentId: number | string, rootId: number | string | null = null) => {
    console.log('提交回复 - 参数:', parentId, rootId);

    // 找到对应的评论
    let replyContent = '';
    let foundComment: ExtendedCommentNodeVO | undefined;

    // 查找评论及其回复内容
    for (const comment of comments) {
      // 检查是否是根评论
      if (comment.id === parentId) {
        replyContent = comment.replyContent || '';
        foundComment = comment;
        break;
      }

      // 检查子评论
      if (comment.children && comment.children.length > 0) {
        const child = comment.children.find(c => c.id === parentId);
        if (child) {
          replyContent = child.replyContent || '';
          foundComment = child;
          break;
        }
      }

      // 检查预览子评论
      if (comment.previewChildren && comment.previewChildren.length > 0) {
        const child = comment.previewChildren.find(c => c.id === parentId);
        if (child) {
          replyContent = child.replyContent || '';
          foundComment = child;
          break;
        }
      }
    }

    console.log('回复内容:', replyContent, '评论ID:', parentId, '找到评论:', foundComment);

    if (!foundComment) {
      console.error('未找到对应的评论');
      message.warning('回复失败：未找到对应的评论');
      return;
    }

    if (!replyContent.trim()) {
      console.error('回复内容为空');
      message.warning('回复内容不能为空');
      return;
    }

    if (!currentUser) {
      message.warning('请先登录');
      return;
    }

    if (!id) return;

    // 确保rootId有效，如果没有提供，则使用parentId作为rootId
    const finalRootId = rootId || parentId;
    console.log('最终rootId:', finalRootId);

    // 更新评论的加载状态
    setComments(comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replyLoading: true
        };
      }
      if (comment.children) {
        return {
          ...comment,
          children: comment.children.map(child => {
            if (child.id === parentId) {
              return {
                ...child,
                replyLoading: true
              };
            }
            return child;
          })
        };
      }
      if (comment.previewChildren) {
        return {
          ...comment,
          previewChildren: comment.previewChildren.map(child => {
            if (child.id === parentId) {
              return {
                ...child,
                replyLoading: true
              };
            }
            return child;
          })
        };
      }
      return comment;
    }));

    try {
      await addCommentUsingPost({
        postId: id as unknown as number,
        content: replyContent,
        parentId: parentId as unknown as number,
        rootId: finalRootId as unknown as number
      } as any);

      message.success('回复成功');

      // 清空回复框并隐藏
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replyContent: '',
            showReplyBox: false,
            replyLoading: false
          };
        }
        if (comment.children) {
          return {
            ...comment,
            children: comment.children.map(child => {
              if (child.id === parentId) {
                return {
                  ...child,
                  replyContent: '',
                  showReplyBox: false,
                  replyLoading: false
                };
              }
              return child;
            })
          };
        }
        if (comment.previewChildren) {
          return {
            ...comment,
            previewChildren: comment.previewChildren.map(child => {
              if (child.id === parentId) {
                return {
                  ...child,
                  replyContent: '',
                  showReplyBox: false,
                  replyLoading: false
                };
              }
              return child;
            })
          };
        }
        return comment;
      }));

      // 重新获取评论列表，显示最新评论
      fetchComments();

      // 更新帖子的评论数
      if (post) {
        setPost({
          ...post,
          commentNum: (post.commentNum || 0) + 1
        });
      }
    } catch (error) {
      message.error('回复失败');
      // 重置加载状态
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replyLoading: false
          };
        }
        if (comment.children) {
          return {
            ...comment,
            children: comment.children.map(child => {
              if (child.id === parentId) {
                return {
                  ...child,
                  replyLoading: false
                };
              }
              return child;
            })
          };
        }
        if (comment.previewChildren) {
          return {
            ...comment,
            previewChildren: comment.previewChildren.map(child => {
              if (child.id === parentId) {
                return {
                  ...child,
                  replyLoading: false
                };
              }
              return child;
            })
          };
        }
        return comment;
      }));
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: number | string) => {
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？删除后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await deleteCommentUsingPost({
            id: commentId
          } as any);
          
          if (res.data) {
            message.success('评论删除成功');
            
            // 从评论列表中移除已删除的评论
            setComments(comments.filter(comment => {
              // 如果是根评论被删除
              if (comment.id === commentId) {
                return false;
              }
              
              // 检查子评论是否被删除
              if (comment.children && comment.children.length > 0) {
                comment.children = comment.children.filter(child => child.id !== commentId);
              }
              
              // 检查预览子评论是否被删除
              if (comment.previewChildren && comment.previewChildren.length > 0) {
                comment.previewChildren = comment.previewChildren.filter(child => child.id !== commentId);
              }
              
              return true;
            }));
            
            // 更新帖子的评论数
            if (post) {
              setPost({
                ...post,
                commentNum: Math.max((post.commentNum || 0) - 1, 0)
              });
            }
          } else {
            message.error('评论删除失败');
          }
        } catch (error) {
          console.error('删除评论失败:', error);
          message.error('删除评论失败');
        }
      }
    });
  };

  // 切换子评论的展开/收起状态
  const toggleChildrenExpanded = (commentId: number | string) => {
    console.log('切换子评论展开状态:', commentId);

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          childrenExpanded: !comment.childrenExpanded
        };
      }
      return comment;
    }));
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      message.warning('评论内容不能为空');
      return;
    }
    if (!currentUser) {
      message.warning('请先登录');
      return;
    }
    if (!id) return;

    setCommentLoading(true);
    try {
      await addCommentUsingPost({
        postId: id as unknown as number,
        content: commentContent,
      } as any);

      message.success('评论成功');
      setCommentContent('');
      // 重新获取评论列表，显示最新评论
      setCommentPagination({
        ...commentPagination,
        current: 1 // 重置到第一页以查看新评论
      });
      fetchComments();

      // 更新帖子的评论数
      if (post) {
        setPost({
          ...post,
          commentNum: (post.commentNum || 0) + 1
        });
      }
    } catch (error) {
      message.error('评论失败');
    } finally {
      setCommentLoading(false);
    }
  };

  // 渲染评论项
  const renderCommentItem = (item: ExtendedCommentNodeVO, isChild = false, rootId: number | string | null = null) => {
    // 确定当前评论的根评论ID
    const currentRootId = isChild ? rootId : item.id;

    return (
      <div className={`comment-item ${isChild ? 'child-comment' : ''}`} key={item.id}>
        <div className="comment-item-avatar">
          <Avatar src={item.user?.userAvatar} size={isChild ? 32 : 36}/>
        </div>
        <div className="comment-item-content">
          <div className="comment-item-header">
            <Text strong>{item.user?.userName}</Text>
            <div className="comment-item-meta">
              <Text type="secondary">{formatTime(item.createTime)}</Text>
              {canDeleteComment(item.user?.id) && (
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined/>}
                  onClick={() => handleDeleteComment(item.id || 0)}
                  className="delete-button"
                />
              )}
            </div>
          </div>
          <div className="comment-item-body">
            {item.parentComment && (
              <div className="reply-info">
                回复 <Text strong>{item.parentComment.user?.userName}</Text>:
              </div>
            )}
            <Paragraph ellipsis={{ rows: 20, expandable: true, symbol: '展开' }}>{item.content}</Paragraph>
          </div>
          <div className="comment-item-actions">
            <Button
              type="text"
              icon={<CommentOutlined/>}
              onClick={() => toggleReplyBox(item.id || 0)}
              className="reply-button"
            >
              回复
            </Button>
            <Button
              type="text"
              icon={item.hasThumb ? <LikeFilled/> : <LikeOutlined/>}
              onClick={() => handleThumbComment(String(item.id))}
              className={item.hasThumb ? 'like-button active' : 'like-button'}
            >
              {item.thumbNum || 0}
            </Button>
          </div>

          {item.showReplyBox && (
            <div className="reply-box">
              <TextArea
                placeholder={`回复 ${item.user?.userName}...`}
                autoSize={{minRows: 2, maxRows: 4}}
                value={item.replyContent || ''}
                onChange={(e) => {
                  console.log('TextArea onChange:', item.id, e.target.value);
                  updateReplyContent(item.id || 0, e.target.value);
                }}
                onFocus={() => {
                  // 确保焦点时内容存在
                  console.log('TextArea onFocus:', item.id, item.replyContent);
                  if (item.replyContent === undefined) {
                    updateReplyContent(item.id || 0, '');
                  }
                }}
                className="reply-textarea"
              />
              <div className="reply-actions">
                <Button
                  size="small"
                  onClick={() => toggleReplyBox(item.id || 0)}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined/>}
                  loading={item.replyLoading}
                  onClick={() => handleSubmitReply(item.id || 0, currentRootId)}
                  disabled={!item.replyContent?.trim()}
                >
                  回复
                </Button>
              </div>
            </div>
          )}

          {/* 渲染子评论 */}
          {!isChild && ((item.previewChildren && item.previewChildren.length > 0) || (item.children && item.children.length > 0)) && (
            <div className="child-comments-header">
              {/* 子评论数量和展开/收起按钮 */}
              <div className="child-comments-count">
                {item.childCount || (item.previewChildren?.length || 0) || (item.children?.length || 0)} 条回复
              </div>
              <Button
                type="link"
                size="small"
                onClick={() => toggleChildrenExpanded(item.id || 0)}
              >
                {item.childrenExpanded ? '收起' : '展开'}
              </Button>
            </div>
          )}

          {/* 渲染预览子评论 */}
          {!isChild && item.childrenExpanded && item.previewChildren && item.previewChildren.length > 0 && !item.hasLoadedAllChildren && (
            <div className="child-comments">
              {item.previewChildren.map(child => renderCommentItem(child, true, item.id))}

              {/* 显示加载更多按钮 */}
              {item.childCount && item.childCount > (item.previewChildren?.length || 0) && (
                <div className="load-more-comments">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => loadMoreChildComments(item.id || 0)}
                  >
                    查看全部 {item.childCount} 条回复
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 如果已经加载了完整的子评论列表，则显示它们 */}
          {!isChild && item.childrenExpanded && item.children && item.children.length > 0 && (
            <div className="child-comments">
              {item.children.map(child => renderCommentItem(child, true, item.id))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 判断当前用户是否有权限编辑或删除帖子
  const canEditPost = () => {
    if (!currentUser || !post) return false;

    // 管理员可以编辑所有帖子
    if (currentUser.userRole === 'admin') return true;

    // 普通用户只能编辑自己的帖子
    return currentUser.id === post.userId;
  };

  // 判断当前用户是否有权限删除评论
  const canDeleteComment = (commentUserId?: number) => {
    if (!currentUser) return false;

    // 管理员可以删除任何评论
    if (currentUser.userRole === 'admin') return true;

    // 普通用户只能删除自己的评论
    return currentUser.id === commentUserId;
  };

  // 编辑帖子
  const handleEditPost = () => {
    if (!id) return;
    history.push(`/post/edit/${id}`);
  };

  // 显示删除确认对话框
  const showDeleteConfirm = () => {
    setDeleteModalVisible(true);
  };

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!id) return;

    setDeleteLoading(true);
    try {
      // 直接使用字符串ID，避免精度丢失
      const res = await deletePostUsingPost1({id: id});

      if (res.data) {
        message.success('帖子删除成功');
        // 删除成功后返回帖子列表页
        history.push('/post');
      } else {
        message.error('帖子删除失败');
      }
    } catch (error) {
      console.error('删除帖子失败:', error);
      message.error('删除帖子失败');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
    }
  };

  // 切换评论区收缩状态
  const toggleCommentCollapse = () => {
    setCommentCollapsed(!commentCollapsed);
  };

  // 添加滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 添加窗口大小监听
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // 初始化
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 初始化数据
  useEffect(() => {
    if (id) {
      fetchCurrentUser();
      fetchPostDetail();
    }
  }, [id]);

  // 当评论分页参数变化时，重新获取评论
  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id, commentPagination.current]);

  if (loading) {
    return (
      <div className="post-detail-loading">
        <Spin size="large"/>
      </div>
    );
  }

  if (!post) {
    return <div className="post-detail-not-found">帖子不存在或已被删除</div>;
  }

  return (
    <div className="post-detail-container">
      <div className="post-detail-header">
        <Link to="/post">
          <div className="back-button">
            <ArrowLeftOutlined/>
            <span>返回帖子列表</span>
          </div>
        </Link>
        <div className="post-actions-buttons">
          {/* 添加编辑按钮 */}
          {canEditPost() && (
            <Button
              type="primary"
              icon={<EditOutlined/>}
              onClick={handleEditPost}
              style={{marginRight: 8}}
            >
              编辑帖子
            </Button>
          )}
          {/* 添加删除按钮 */}
          {canEditPost() && (
            <Button
              danger
              icon={<DeleteOutlined/>}
              onClick={showDeleteConfirm}
            >
              删除帖子
            </Button>
          )}
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Modal
        title="删除确认"
        open={deleteModalVisible}
        onOk={handleDeletePost}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        confirmLoading={deleteLoading}
      >
        <p>确定要删除这篇帖子吗？删除后将无法恢复。</p>
      </Modal>

      <div className="post-detail-layout">
        <div className="post-detail-main" ref={mainContentRef}>
          <Card className="post-detail-card">
            <div className="post-detail-title">
              <Title level={3}>{post.title}</Title>
              <div className="post-detail-meta">
                <Space>
                  <Avatar src={post.user?.userAvatar} size="small"/>
                  <Text strong>{post.user?.userName}</Text>
                  <Text type="secondary">{formatTime(post.createTime)}</Text>
                </Space>
              </div>
            </div>
            <Divider/>
            <div className="post-detail-body">
              {/* Vditor 预览区域 */}
              <div ref={contentRef} className="vditor-reset"></div>
            </div>
          </Card>
        </div>

        <div className={`post-detail-sidebar ${commentCollapsed ? 'collapsed' : ''} ${isScrolling ? 'sticky' : ''}`}>
          <div
            className="comment-collapse-button"
            onClick={toggleCommentCollapse}
            data-tooltip={commentCollapsed ? '展开评论' : '收起评论'}
          >
            {isMobile ?
              (commentCollapsed ? <DownOutlined/> : <UpOutlined/>) :
              (commentCollapsed ? <LeftOutlined/> : <RightOutlined/>)
            }
          </div>
          <Card
            className="post-detail-comments"
            title={
              <div className="comments-header">
                <span>评论</span>
                <span className="comment-count">{commentPagination.total}</span>
              </div>
            }
            extra={
              <div className="post-actions">
                <Button
                  type="text"
                  icon={post.hasThumb ? <LikeFilled/> : <LikeOutlined/>}
                  onClick={handleThumbPost}
                  className={post.hasThumb ? 'action-button active' : 'action-button'}
                >
                  {post.thumbNum || 0}
                </Button>
                <Button
                  type="text"
                  icon={post.hasFavour ? <StarFilled/> : <StarOutlined/>}
                  onClick={handleFavourPost}
                  className={post.hasFavour ? 'action-button active' : 'action-button'}
                >
                  {post.favourNum || 0}
                </Button>
                <Button
                  type="text"
                  icon={<MessageOutlined/>}
                  className="action-button"
                >
                  {post.commentNum || 0}
                </Button>
              </div>
            }
            bodyStyle={{
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 120px)',
              visibility: commentCollapsed ? 'hidden' : 'visible',
              overflow: 'hidden',
              width: '100%',
              maxWidth: '100%'
            }}
          >
            {!commentCollapsed && (
              <>
                <div className="comment-fixed-top">
                  <div className="comment-editor">
                    <div className="comment-avatar">
                      <Avatar src={currentUser?.userAvatar} size={40}/>
                    </div>
                    <div className="comment-input">
                      <TextArea
                        placeholder="写下你的评论..."
                        autoSize={{minRows: 2, maxRows: 6}}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="comment-textarea"
                      />
                      <Button
                        type="primary"
                        icon={<SendOutlined/>}
                        onClick={handleSubmitComment}
                        loading={commentLoading}
                        disabled={!commentContent.trim()}
                      >
                        发布评论
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="comment-scrollable-content">
                  {commentsLoading ? (
                    <div className="comments-loading">
                      <Spin/>
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="comment-list">
                      {comments.map(item => renderCommentItem(item))}

                      {commentPagination.total > commentPagination.pageSize && (
                        <div className="comment-pagination">
                          <Pagination
                            current={commentPagination.current}
                            pageSize={commentPagination.pageSize}
                            total={commentPagination.total}
                            onChange={handleCommentPageChange}
                            size="small"
                            simple
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="no-comments">
                      <MessageOutlined style={{fontSize: 24}}/>
                      <p>暂无评论，快来发表第一条评论吧！</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
