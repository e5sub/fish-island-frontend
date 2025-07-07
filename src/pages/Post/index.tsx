import React, {useState, useEffect} from 'react';
import {Card, List, Tag, Space, Button, Input, Tabs, Avatar, Badge, message, Modal} from 'antd';
import type {SizeType} from 'antd/es/config-provider/SizeContext';
import {
  FireOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  LikeOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined
} from '@ant-design/icons';
import {history, Link} from '@umijs/max';
import {listPostVoByPageUsingPost, deletePostUsingPost1} from '@/services/backend/postController';
import {listTagsVoByPageUsingPost} from '@/services/backend/tagsController';
import {getLoginUserUsingGet} from '@/services/backend/userController';
import './index.less';
import moment from 'moment';

const {TabPane} = Tabs;
const {Search} = Input;

const PostPage: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<number | null>(null);
  const [posts, setPosts] = useState<API.PostVO[]>([]);
  const [hotTopics, setHotTopics] = useState<API.HotPostDataVO[]>([]);
  const [tags, setTags] = useState<API.TagsVO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<string>('latest');
  const [currentUser, setCurrentUser] = useState<API.UserVO>();
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // 检测是否为移动设备
  const [isMobile, setIsMobile] = useState<boolean>(false);

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

  // 获取标签列表
  const fetchTags = async () => {
    try {
      const result = await listTagsVoByPageUsingPost({
        pageSize: 20, // 一次性获取足够多的标签
        current: 1,
      });
      if (result.data?.records) {
        setTags(result.data.records);
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
      message.error('获取标签列表失败');
    }
  };

  // 标签颜色列表
  const tagColors = [
    'magenta', 'red', 'volcano', 'orange', 'gold',
    'lime', 'green', 'cyan', 'blue', 'geekblue',
    'purple', 'pink'
  ];

  // 根据标签ID获取颜色
  const getTagColor = (tagId: number | undefined) => {
    if (!tagId) return tagColors[0];
    // 使用取模运算确保颜色循环使用
    return tagColors[tagId % tagColors.length];
  };

  // 获取热门话题
  const fetchHotTopics = async () => {
    try {
      // 使用热门讨论的参数获取热门话题
      const params: API.PostQueryRequest = {
        current: 1,
        pageSize: 5,
        sortField: 'thumbNum', // 按点赞数排序
        sortOrder: 'descend',
      };

      const result = await listPostVoByPageUsingPost(params);
      if (result.data?.records) {
        setHotTopics(result.data.records.map(post => ({
          title: post.title || '',
          url: `/post/${post.id}`,
          followerCount: post.commentNum || 0, // 使用评论数作为参与人数
        })));
      }
    } catch (error) {
      console.error('获取热门话题失败:', error);
      message.error('获取热门话题失败');
    }
  };

  // 获取帖子列表
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params: API.PostQueryRequest = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchQuery || undefined,
      };

      // 根据当前选中的标签筛选
      if (selectedTag) {
        params.tags = [tags.find(tag => tag.id === selectedTag)?.tagsName || ''];
      }

      // 根据当前选中的Tab设置排序
      if (currentTab === 'hot') {
        params.sortField = 'thumbNum'; // 按点赞数排序
        params.sortOrder = 'descend';
      } else if (currentTab === 'featured') {
        params.isFeatured = 1; // 精华内容
      } else {
        // 默认按创建时间排序
        params.sortField = 'createTime';
        params.sortOrder = 'descend';
      }

      const result = await listPostVoByPageUsingPost(params);
      if (result.data) {
        setPosts(result.data.records || []);
        setPagination({
          ...pagination,
          total: result.data.total || 0,
        });
      }
    } catch (error) {
      console.error('获取帖子列表失败:', error);
      message.error('获取帖子列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 判断当前用户是否有权限删除帖子
  const canDeletePost = (post: API.PostVO) => {
    if (!currentUser) return false;

    // 管理员可以删除所有帖子
    if (currentUser.userRole === 'admin') return true;

    // 普通用户只能删除自己的帖子
    return currentUser.id === post.userId;
  };

  // 显示删除确认对话框
  const showDeleteConfirm = (postId: any) => {
    // 确保ID是字符串类型
    setPostToDelete(String(postId));
    setDeleteModalVisible(true);
  };

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setDeleteLoading(true);
    try {
      // 直接使用字符串ID，避免精度丢失
      const res = await deletePostUsingPost1({id: String(postToDelete)});

      if (res.data) {
        message.success('帖子删除成功');
        // 删除成功后刷新帖子列表
        fetchPosts();
      } else {
        message.error('帖子删除失败');
      }
    } catch (error) {
      console.error('删除帖子失败:', error);
      message.error('删除帖子失败');
    } finally {
      setDeleteLoading(false);
      setDeleteModalVisible(false);
      setPostToDelete(null);
    }
  };

  // 切换搜索框显示/隐藏
  const toggleSearchVisible = () => {
    setSearchVisible(!searchVisible);
  };

  // 初始化数据
  useEffect(() => {
    fetchTags();
    fetchHotTopics();
    fetchCurrentUser();
  }, []);

  // 当分页、标签选择、搜索条件或Tab变化时，重新获取帖子列表
  useEffect(() => {
    fetchPosts();
  }, [pagination.current, pagination.pageSize, selectedTag, searchQuery, currentTab]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPagination({...pagination, current: 1}); // 重置到第一页
  };

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setCurrentTab(key);
    setPagination({...pagination, current: 1}); // 重置到第一页
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  // 跳转到发布帖子页面
  const handleCreatePost = () => {
    history.push('/post/create');
  };

  // 格式化时间
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return moment(timeString).format('YYYY-MM-DD HH:mm');
  };

  useEffect(() => {
    // 检测窗口宽度，设置是否为移动设备
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 576);
    };

    // 初始检测
    checkMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);

    // 组件卸载时移除监听
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="post-page">
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

      <div className="post-container">
        <div className="post-main">
          <Card className="post-filter-card">
            <div className="filter-container">
              
              <div className="category-filter">
                <span className="filter-label">标签：</span>
                <div className="tag-container">
                  <Tag
                    color={selectedTag === null ? 'orange' : ''}
                    className={selectedTag === null ? 'category-tag active' : 'category-tag'}
                    onClick={() => setSelectedTag(null)}
                  >
                    全部
                  </Tag>
                  {tags.map(tag => (
                    <Tag
                      key={tag.id}
                      color={selectedTag === tag.id ? getTagColor(tag.id) : getTagColor(tag.id)}
                      className={selectedTag === tag.id ? 'category-tag active' : 'category-tag'}
                      onClick={() => setSelectedTag(tag.id || null)}
                    >
                      {tag.tagsName}
                    </Tag>
                  ))}
                </div>
              </div>
              {/* 搜索框开关 */}
              <div className="search-toggle">
                <Button 
                  type="link" 
                  onClick={toggleSearchVisible}
                  icon={searchVisible ? <UpOutlined /> : <FilterOutlined />}
                >
                  {searchVisible ? '收起搜索' : '展开搜索'}
                </Button>
              </div>
              
              {/* 可收起的搜索框 */}
              {searchVisible && (
                <div className="post-search">
                  <Input
                    placeholder="搜索帖子"
                    prefix={<SearchOutlined className="search-icon"/>}
                    allowClear
                    className="search-input"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={() => handleSearch(searchText)}
                  />
                  <Button
                    type="primary"
                    icon={<SearchOutlined/>}
                    className="search-button"
                    onClick={() => handleSearch(searchText)}
                  >
                    {!isMobile && '搜索'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="post-list-card">
            <div className="post-list-header">
              <div className="tabs-container">
                <Tabs
                  defaultActiveKey="latest"
                  className="post-tabs"
                  activeKey={currentTab}
                  onChange={handleTabChange}
                  size={isMobile ? "small" as SizeType : "middle" as SizeType}
                >
                  <TabPane
                    tab={<span>{!isMobile && <ClockCircleOutlined/>} 最新发布</span>}
                    key="latest"
                  />
                  <TabPane
                    tab={<span>{!isMobile && <FireOutlined/>} 热门讨论</span>}
                    key="hot"
                  />
                  <TabPane
                    tab={<span>{!isMobile && <RiseOutlined/>} 精华内容</span>}
                    key="featured"
                  />
                </Tabs>
              </div>
              <div className="button-container">
                <Button
                  type="primary"
                  icon={<PlusOutlined/>}
                  onClick={handleCreatePost}
                >
                  {isMobile ? "发布" : "发布帖子"}
                </Button>
              </div>
            </div>

            <List
              itemLayout="vertical"
              size="large"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePageChange,
                simple: isMobile, // 移动端使用简单分页
                size: isMobile ? "small" : "default",
              }}
              dataSource={posts}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  className="post-item"
                  onClick={() => history.push(`/post/${String(item.id)}`)}
                  style={{cursor: 'pointer'}}
                  actions={[
                    // 在移动端不显示阅读量、点赞数和评论数
                    !isMobile &&
                    <span onClick={(e) => e.stopPropagation()}><EyeOutlined/> 浏览 {item.viewNum || 0}</span>,
                    !isMobile &&
                    <span onClick={(e) => e.stopPropagation()}><LikeOutlined/> 点赞 {item.thumbNum || 0}</span>,
                    !isMobile &&
                    <span onClick={(e) => e.stopPropagation()}><MessageOutlined/> 评论 {item.commentNum || 0}</span>,
                    canDeletePost(item) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          history.push(`/post/edit/${item.id}`);
                        }}
                        className="edit-action"
                      >
                        <EditOutlined style={{color: '#1890ff'}}/> {isMobile ? '' : '编辑'}
                      </span>
                    ),
                    canDeletePost(item) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          // 直接传递原始ID，避免Number()转换导致精度丢失
                          showDeleteConfirm(item.id);
                        }}
                        className="delete-action"
                      >
                        <DeleteOutlined style={{color: '#ff4d4f'}}/> {isMobile ? '' : '删除'}
                      </span>
                    ),
                  ].filter(Boolean)}
                >
                  <div className="post-item-header">
                    <Avatar src={item.user?.userAvatar || 'https://joeschmoe.io/api/v1/random'}
                            size={isMobile ? 32 : 40}/>
                    <div className="post-author-info">
                      <div className="author-name">
                        <span>{item.user?.userName || '匿名用户'}</span>
                        <span className="post-time">{formatTime(item.createTime)}</span>
                      </div>
                      <div className="post-tags">
                        {item.tagList && item.tagList.map((tag, index) => {
                          // 查找对应的标签ID以获取颜色
                          const tagObj = tags.find(t => t.tagsName === tag);
                          const color = tagObj ? getTagColor(tagObj.id) : 'blue';
                          // 在移动设备上限制显示的标签数量
                          if (isMobile && index > 1) return null;
                          return (
                            <Tag
                              key={index}
                              color={color}
                              className="category-tag-small"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tag}
                            </Tag>
                          );
                        })}
                        {/* 如果在移动设备上有更多标签，显示+N */}
                        {isMobile && item.tagList && item.tagList.length > 2 && (
                          <Tag className="category-tag-small">
                            +{item.tagList.length - 2}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="post-content-wrapper">
                    <div className="post-title">
                      {item.title}
                    </div>

                    {item.latestComment && (
                      <div className="post-content hot-comment">
                        {item.latestComment.content}
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>

        <div className="post-sidebar">
          <Card title="热门话题" className="hot-topics-card">
            <List
              size="small"
              dataSource={hotTopics}
              renderItem={(item, index) => (
                <List.Item className="hot-topic-item">
                  <Badge
                    count={index + 1}
                    style={{
                      backgroundColor: index < 3 ? '#ff4d4f' : '#999',
                      marginRight: '8px'
                    }}
                  />
                  <Link to={item.url || '#'}>{item.title}</Link>
                  <span className="topic-count">{item.followerCount || 0}人参与</span>
                </List.Item>
              )}
            />
          </Card>

          <Card title="社区公告" className="announcement-card">
            <p>🎉 欢迎来到摸鱼论坛！</p>
            <p>🚀 新功能上线：表情包发送功能已开放</p>
            <p>📢 社区规则已更新，请遵守社区规范</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
