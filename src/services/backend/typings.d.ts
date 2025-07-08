declare namespace API {
  type AvatarFrame = {
    createTime?: string;
    frameId?: number;
    isDelete?: number;
    name?: string;
    points?: number;
    updateTime?: string;
    url?: string;
  };

  type AvatarFrameQueryRequest = {
    current?: number;
    id?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
  };

  type AvatarFrameVO = {
    hasOwned?: boolean;
    id?: number;
    name?: string;
    points?: number;
    url?: string;
  };

  type BaseResponseBoolean_ = {
    code?: number;
    data?: boolean;
    message?: string;
  };

  type BaseResponseCosCredentialVo_ = {
    code?: number;
    data?: CosCredentialVo;
    message?: string;
  };

  type BaseResponseDonationRecordsVO_ = {
    code?: number;
    data?: DonationRecordsVO;
    message?: string;
  };

  type BaseResponseHeroVO_ = {
    code?: number;
    data?: HeroVO;
    message?: string;
  };

  type BaseResponseInt_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseListAvatarFrame_ = {
    code?: number;
    data?: AvatarFrame[];
    message?: string;
  };

  type BaseResponseListHeroRankingVO_ = {
    code?: number;
    data?: HeroRankingVO[];
    message?: string;
  };

  type BaseResponseListHotPostVO_ = {
    code?: number;
    data?: HotPostVO[];
    message?: string;
  };

  type BaseResponseListNewUserDataWebVO_ = {
    code?: number;
    data?: NewUserDataWebVO[];
    message?: string;
  };

  type BaseResponseListSimpleHeroVO_ = {
    code?: number;
    data?: SimpleHeroVO[];
    message?: string;
  };

  type BaseResponseListUndercoverPlayerDetailVO_ = {
    code?: number;
    data?: UndercoverPlayerDetailVO[];
    message?: string;
  };

  type BaseResponseListUndercoverRoomVO_ = {
    code?: number;
    data?: UndercoverRoomVO[];
    message?: string;
  };

  type BaseResponseListUndercoverVoteVO_ = {
    code?: number;
    data?: UndercoverVoteVO[];
    message?: string;
  };

  type BaseResponseListUserChatResponse_ = {
    code?: number;
    data?: UserChatResponse[];
    message?: string;
  };

  type BaseResponseListUserTitle_ = {
    code?: number;
    data?: UserTitle[];
    message?: string;
  };

  type BaseResponseListVO_ = {
    code?: number;
    data?: VO[];
    message?: string;
  };

  type BaseResponseLoginUserVO_ = {
    code?: number;
    data?: LoginUserVO;
    message?: string;
  };

  type BaseResponseLong_ = {
    code?: number;
    data?: number;
    message?: string;
  };

  type BaseResponseMockInterview_ = {
    code?: number;
    data?: MockInterview;
    message?: string;
  };

  type BaseResponsePageAvatarFrameVO_ = {
    code?: number;
    data?: PageAvatarFrameVO_;
    message?: string;
  };

  type BaseResponsePageCommentNodeVO_ = {
    code?: number;
    data?: PageCommentNodeVO_;
    message?: string;
  };

  type BaseResponsePageCommentVO_ = {
    code?: number;
    data?: PageCommentVO_;
    message?: string;
  };

  type BaseResponsePageDonationRecords_ = {
    code?: number;
    data?: PageDonationRecords_;
    message?: string;
  };

  type BaseResponsePageDonationRecordsVO_ = {
    code?: number;
    data?: PageDonationRecordsVO_;
    message?: string;
  };

  type BaseResponsePageEmoticonFavour_ = {
    code?: number;
    data?: PageEmoticonFavour_;
    message?: string;
  };

  type BaseResponsePageMockInterview_ = {
    code?: number;
    data?: PageMockInterview_;
    message?: string;
  };

  type BaseResponsePagePost_ = {
    code?: number;
    data?: PagePost_;
    message?: string;
  };

  type BaseResponsePagePostVO_ = {
    code?: number;
    data?: PagePostVO_;
    message?: string;
  };

  type BaseResponsePageRoomMessageVo_ = {
    code?: number;
    data?: PageRoomMessageVo_;
    message?: string;
  };

  type BaseResponsePageTags_ = {
    code?: number;
    data?: PageTags_;
    message?: string;
  };

  type BaseResponsePageTagsVO_ = {
    code?: number;
    data?: PageTagsVO_;
    message?: string;
  };

  type BaseResponsePageUser_ = {
    code?: number;
    data?: PageUser_;
    message?: string;
  };

  type BaseResponsePageUserVO_ = {
    code?: number;
    data?: PageUserVO_;
    message?: string;
  };

  type BaseResponsePostVO_ = {
    code?: number;
    data?: PostVO;
    message?: string;
  };

  type BaseResponseRedPacket_ = {
    code?: number;
    data?: RedPacket;
    message?: string;
  };

  type BaseResponseString_ = {
    code?: number;
    data?: string;
    message?: string;
  };

  type BaseResponseTagsVO_ = {
    code?: number;
    data?: TagsVO;
    message?: string;
  };

  type BaseResponseTokenLoginUserVo_ = {
    code?: number;
    data?: TokenLoginUserVo;
    message?: string;
  };

  type BaseResponseUndercoverPlayerDetailVO_ = {
    code?: number;
    data?: UndercoverPlayerDetailVO;
    message?: string;
  };

  type BaseResponseUndercoverPlayerVO_ = {
    code?: number;
    data?: UndercoverPlayerVO;
    message?: string;
  };

  type BaseResponseUndercoverRoomVO_ = {
    code?: number;
    data?: UndercoverRoomVO;
    message?: string;
  };

  type BaseResponseUser_ = {
    code?: number;
    data?: User;
    message?: string;
  };

  type BaseResponseUserDataWebVO_ = {
    code?: number;
    data?: UserDataWebVO;
    message?: string;
  };

  type BaseResponseUserMuteVO_ = {
    code?: number;
    data?: UserMuteVO;
    message?: string;
  };

  type BaseResponseUserVO_ = {
    code?: number;
    data?: UserVO;
    message?: string;
  };

  type BaseResponseWebParseVO_ = {
    code?: number;
    data?: WebParseVO;
    message?: string;
  };

  type callbackUsingDELETEParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
    /** source */
    source: string;
  };

  type callbackUsingGETParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
    /** source */
    source: string;
  };

  type callbackUsingPATCHParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
    /** source */
    source: string;
  };

  type callbackUsingPOSTParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
    /** source */
    source: string;
  };

  type callbackUsingPUTParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
    /** source */
    source: string;
  };

  type ChildCommentQueryRequest = {
    current?: number;
    pageSize?: number;
    rootId?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type CommentAddRequest = {
    content?: string;
    parentId?: number;
    postId?: number;
    rootId?: number;
  };

  type CommentNodeVO = {
    childCount?: number;
    content?: string;
    createTime?: string;
    hasThumb?: boolean;
    id?: number;
    parentId?: number;
    postId?: number;
    previewChildren?: CommentVO[];
    thumbNum?: number;
    user?: UserVO;
    userId?: number;
  };

  type CommentQueryRequest = {
    current?: number;
    pageSize?: number;
    postId?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type CommentThumbAddRequest = {
    commentId?: number;
  };

  type CommentVO = {
    content?: string;
    createTime?: string;
    hasThumb?: boolean;
    id?: number;
    parentId?: number;
    postId?: number;
    thumbNum?: number;
    user?: UserVO;
    userId?: number;
  };

  type CosCredentialVo = {
    /** 桶名称 */
    bucket?: string;
    /** 文件地址 */
    key?: string;
    /** 区域 */
    region?: string;
    response?: Response;
  };

  type CreateRedPacketRequest = {
    /** 红包个数 */
    count: number;
    name?: string;
    /** 红包总金额（积分） */
    totalAmount: number;
    /** 红包类型：1-随机红包，2-平均红包 */
    type: number;
  };

  type Credentials = {
    sessionToken?: string;
    tmpSecretId?: string;
    tmpSecretKey?: string;
    token?: string;
  };

  type DeleteRequest = {
    id?: string;
  };

  type DonationRecords = {
    amount?: number;
    createTime?: string;
    id?: number;
    isDelete?: number;
    remark?: string;
    updateTime?: string;
    userId?: number;
  };

  type DonationRecordsAddRequest = {
    amount?: number;
    remark?: string;
    userId?: number;
  };

  type DonationRecordsQueryRequest = {
    amount?: number;
    createTime?: string;
    current?: number;
    id?: number;
    pageSize?: number;
    remark?: string;
    sortField?: string;
    sortOrder?: string;
    updateTime?: string;
    userId?: number;
  };

  type DonationRecordsUpdateRequest = {
    amount?: number;
    id?: number;
    isDelete?: number;
    remark?: string;
    userId?: number;
  };

  type DonationRecordsVO = {
    amount?: number;
    createTime?: string;
    donorUser?: LoginUserVO;
    id?: number;
    remark?: string;
    userId?: number;
  };

  type eliminatePlayerUsingPOSTParams = {
    /** roomId */
    roomId: string;
    /** userId */
    userId: number;
  };

  type EmoticonFavour = {
    createTime?: string;
    emoticonSrc?: string;
    id?: number;
    updateTime?: string;
    userId?: number;
  };

  type endGameUsingPOSTParams = {
    /** roomId */
    roomId: string;
  };

  type exchangeFrameUsingPOSTParams = {
    /** frameId */
    frameId: number;
  };

  type FluxString_ = {
    prefetch?: number;
  };

  type generatePresignedDownloadUrlUsingGETParams = {
    /** fileName */
    fileName: string;
  };

  type getCosCredentialUsingGETParams = {
    /** fileName */
    fileName?: string;
  };

  type getCurrentPlayerInfoUsingGETParams = {
    /** roomId */
    roomId: string;
  };

  type getDonationRecordsVoByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getHeroByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getMinioPresignedUsingGETParams = {
    /** fileName */
    fileName?: string;
  };

  type getMockInterviewByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getPlayerDetailInfoUsingGETParams = {
    /** roomId */
    roomId: string;
    /** userId */
    userId: number;
  };

  type getPlayerInfoUsingGETParams = {
    /** roomId */
    roomId: string;
    /** userId */
    userId: number;
  };

  type getPostVoByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getRedPacketDetailUsingGETParams = {
    /** 红包ID */
    redPacketId: string;
  };

  type getRedPacketRecordsUsingGETParams = {
    /** 红包ID */
    redPacketId: string;
  };

  type getRoomByIdUsingGETParams = {
    /** roomId */
    roomId?: string;
  };

  type getRoomPlayersDetailUsingGETParams = {
    /** roomId */
    roomId: string;
  };

  type getRoomVotesUsingGETParams = {
    /** roomId */
    roomId: string;
  };

  type getTagsVOByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type getUserMuteInfoUsingGETParams = {
    /** userId */
    userId: number;
  };

  type getUserVoByIdUsingGETParams = {
    /** id */
    id?: number;
  };

  type grabRedPacketUsingPOSTParams = {
    /** 红包ID */
    redPacketId: string;
  };

  type HeroRankingVO = {
    rank?: number;
    score?: number;
    userAvatar?: string;
    userId?: number;
    userName?: string;
  };

  type HeroVO = {
    ability?: string;
    cname?: string;
    ename?: string;
    faction?: string;
    height?: string;
    id?: string;
    identity?: string;
    mossId?: number;
    newType?: number;
    officialLink?: string;
    primaryType?: number;
    quote?: string;
    race?: string;
    region?: string;
    releaseDate?: string;
    secondaryType?: number;
    skins?: string;
    skinsNum?: number;
    title?: string;
  };

  type HotPostDataVO = {
    followerCount?: number;
    title?: string;
    url?: string;
  };

  type HotPostVO = {
    category?: number;
    categoryName?: string;
    data?: HotPostDataVO[];
    iconUrl?: string;
    id?: number;
    name?: string;
    type?: string;
    typeName?: string;
    updateTime?: string;
  };

  type LoginUserVO = {
    avatarFramerUrl?: string;
    bindPlatforms?: PlatformBindVO[];
    createTime?: string;
    email?: string;
    id?: number;
    lastSignInDate?: string;
    level?: number;
    points?: number;
    titleId?: number;
    titleIdList?: string;
    updateTime?: string;
    usedPoints?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type Message = {
    content?: string;
    id?: string;
    mentionedUsers?: Sender[];
    quotedMessage?: Message;
    roomId?: string;
    sender?: Sender;
    timestamp?: string;
  };

  type MessageQueryRequest = {
    current?: number;
    pageSize?: number;
    roomId?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type MessageWrapper = {
    message?: Message;
  };

  type MockInterview = {
    createTime?: string;
    difficulty?: string;
    id?: number;
    isDelete?: number;
    jobPosition?: string;
    messages?: string;
    status?: number;
    updateTime?: string;
    userId?: number;
    workExperience?: string;
  };

  type MockInterviewAddRequest = {
    difficulty?: string;
    jobPosition?: string;
    workExperience?: string;
  };

  type MockInterviewEventRequest = {
    event?: string;
    id?: number;
    message?: string;
  };

  type MockInterviewQueryRequest = {
    current?: number;
    difficulty?: string;
    id?: number;
    jobPosition?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    status?: number;
    userId?: number;
    workExperience?: string;
  };

  type ModelAndView = {
    empty?: boolean;
    model?: Record<string, any>;
    modelMap?: Record<string, any>;
    reference?: boolean;
    status?:
      | 'CONTINUE'
      | 'SWITCHING_PROTOCOLS'
      | 'PROCESSING'
      | 'CHECKPOINT'
      | 'OK'
      | 'CREATED'
      | 'ACCEPTED'
      | 'NON_AUTHORITATIVE_INFORMATION'
      | 'NO_CONTENT'
      | 'RESET_CONTENT'
      | 'PARTIAL_CONTENT'
      | 'MULTI_STATUS'
      | 'ALREADY_REPORTED'
      | 'IM_USED'
      | 'MULTIPLE_CHOICES'
      | 'MOVED_PERMANENTLY'
      | 'FOUND'
      | 'MOVED_TEMPORARILY'
      | 'SEE_OTHER'
      | 'NOT_MODIFIED'
      | 'USE_PROXY'
      | 'TEMPORARY_REDIRECT'
      | 'PERMANENT_REDIRECT'
      | 'BAD_REQUEST'
      | 'UNAUTHORIZED'
      | 'PAYMENT_REQUIRED'
      | 'FORBIDDEN'
      | 'NOT_FOUND'
      | 'METHOD_NOT_ALLOWED'
      | 'NOT_ACCEPTABLE'
      | 'PROXY_AUTHENTICATION_REQUIRED'
      | 'REQUEST_TIMEOUT'
      | 'CONFLICT'
      | 'GONE'
      | 'LENGTH_REQUIRED'
      | 'PRECONDITION_FAILED'
      | 'PAYLOAD_TOO_LARGE'
      | 'REQUEST_ENTITY_TOO_LARGE'
      | 'URI_TOO_LONG'
      | 'REQUEST_URI_TOO_LONG'
      | 'UNSUPPORTED_MEDIA_TYPE'
      | 'REQUESTED_RANGE_NOT_SATISFIABLE'
      | 'EXPECTATION_FAILED'
      | 'I_AM_A_TEAPOT'
      | 'INSUFFICIENT_SPACE_ON_RESOURCE'
      | 'METHOD_FAILURE'
      | 'DESTINATION_LOCKED'
      | 'UNPROCESSABLE_ENTITY'
      | 'LOCKED'
      | 'FAILED_DEPENDENCY'
      | 'TOO_EARLY'
      | 'UPGRADE_REQUIRED'
      | 'PRECONDITION_REQUIRED'
      | 'TOO_MANY_REQUESTS'
      | 'REQUEST_HEADER_FIELDS_TOO_LARGE'
      | 'UNAVAILABLE_FOR_LEGAL_REASONS'
      | 'INTERNAL_SERVER_ERROR'
      | 'NOT_IMPLEMENTED'
      | 'BAD_GATEWAY'
      | 'SERVICE_UNAVAILABLE'
      | 'GATEWAY_TIMEOUT'
      | 'HTTP_VERSION_NOT_SUPPORTED'
      | 'VARIANT_ALSO_NEGOTIATES'
      | 'INSUFFICIENT_STORAGE'
      | 'LOOP_DETECTED'
      | 'BANDWIDTH_LIMIT_EXCEEDED'
      | 'NOT_EXTENDED'
      | 'NETWORK_AUTHENTICATION_REQUIRED';
    view?: View;
    viewName?: string;
  };

  type NewUserDataWebRequest = {
    beginTime?: string;
    endTime?: string;
    type?: number;
  };

  type NewUserDataWebVO = {
    date?: string;
    newUserCount?: number;
  };

  type OrderItem = {
    asc?: boolean;
    column?: string;
  };

  type PageAvatarFrameVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: AvatarFrameVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageCommentNodeVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: CommentNodeVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageCommentVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: CommentVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageDonationRecords_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: DonationRecords[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageDonationRecordsVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: DonationRecordsVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageEmoticonFavour_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: EmoticonFavour[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageMockInterview_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: MockInterview[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePost_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Post[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PagePostVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: PostVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageRequest = {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
  };

  type PageRoomMessageVo_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: RoomMessageVo[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTags_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: Tags[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageTagsVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: TagsVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUser_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: User[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type PageUserVO_ = {
    countId?: string;
    current?: number;
    maxLimit?: number;
    optimizeCountSql?: boolean;
    orders?: OrderItem[];
    pages?: number;
    records?: UserVO[];
    searchCount?: boolean;
    size?: number;
    total?: number;
  };

  type parseWebPageUsingGETParams = {
    /** url */
    url: string;
  };

  type PlatformBindVO = {
    avatar?: string;
    nickname?: string;
    platform?: string;
  };

  type Post = {
    content?: string;
    coverImage?: string;
    createTime?: string;
    favourNum?: number;
    id?: number;
    isDelete?: number;
    isFeatured?: number;
    tags?: string;
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    userId?: number;
    viewNum?: number;
  };

  type PostAddRequest = {
    content?: string;
    coverImage?: string;
    tags?: string[];
    title?: string;
  };

  type PostEditRequest = {
    content?: string;
    coverImage?: string;
    id?: string;
    tags?: string[];
    title?: string;
  };

  type PostFavourAddRequest = {
    postId?: number;
  };

  type PostFavourQueryRequest = {
    current?: number;
    pageSize?: number;
    postQueryRequest?: PostQueryRequest;
    sortField?: string;
    sortOrder?: string;
    userId?: number;
  };

  type PostQueryRequest = {
    content?: string;
    current?: number;
    isFeatured?: number;
    pageSize?: number;
    searchText?: string;
    sortField?: string;
    sortOrder?: string;
    tags?: string[];
    title?: string;
    userId?: number;
  };

  type PostThumbAddRequest = {
    postId?: number;
  };

  type PostUpdateRequest = {
    content?: string;
    coverImage?: string;
    id?: string;
    tags?: string[];
    title?: string;
  };

  type PostVO = {
    commentNum?: number;
    content?: string;
    coverImage?: string;
    createTime?: string;
    favourNum?: number;
    hasFavour?: boolean;
    hasThumb?: boolean;
    id?: number;
    isFeatured?: number;
    latestComment?: CommentVO;
    tagList?: string[];
    thumbNum?: number;
    title?: string;
    updateTime?: string;
    user?: UserVO;
    userId?: number;
    viewNum?: number;
  };

  type recordGuessSuccessUsingPOSTParams = {
    /** heroId */
    heroId?: number;
  };

  type RedPacket = {
    amountPerPacket?: number;
    count?: number;
    createTime?: string;
    creatorAvatar?: string;
    creatorId?: number;
    creatorName?: string;
    expireTime?: string;
    grabCount?: number;
    id?: string;
    name?: string;
    remainingAmount?: number;
    remainingCount?: number;
    status?: number;
    totalAmount?: number;
    type?: number;
  };

  type removeActiveRoomUsingPOSTParams = {
    /** roomId */
    roomId?: string;
  };

  type renderAuthUsingGETParams = {
    /** source */
    source: string;
  };

  type Response = {
    credentials?: Credentials;
    expiration?: string;
    expiredTime?: number;
    requestId?: string;
    startTime?: number;
  };

  type RoomMessageVo = {
    id?: number;
    messageWrapper?: MessageWrapper;
    roomId?: number;
    userId?: number;
  };

  type SaTokenInfo = {
    isLogin?: boolean;
    loginDevice?: string;
    loginId?: Record<string, any>;
    loginType?: string;
    sessionTimeout?: number;
    tag?: string;
    tokenActiveTimeout?: number;
    tokenName?: string;
    tokenSessionTimeout?: number;
    tokenTimeout?: number;
    tokenValue?: string;
  };

  type SaveTodoDto = {
    /** Todo data */
    todoData: Record<string, any>[];
  };

  type Sender = {
    avatar?: string;
    avatarFramerUrl?: string;
    country?: string;
    id?: string;
    isAdmin?: boolean;
    level?: number;
    name?: string;
    points?: number;
    region?: string;
    /** 用户称号 ID */
    titleId?: number;
    /** 用户称号ID列表 */
    titleIdList?: string;
    /** 用户简介 */
    userProfile?: string;
  };

  type setCurrentFrameUsingPOST1Params = {
    /** titleId */
    titleId: number;
  };

  type setCurrentFrameUsingPOSTParams = {
    /** frameId */
    frameId: number;
  };

  type SimpleHeroVO = {
    cname?: string;
    id?: number;
  };

  type startGameUsingPOSTParams = {
    /** roomId */
    roomId: string;
  };

  type streamChatDemoUsingGETParams = {
    /** prompt */
    prompt: string;
  };

  type Tags = {
    color?: string;
    createTime?: string;
    icon?: string;
    id?: number;
    isDelete?: number;
    sort?: number;
    tagsName?: string;
    type?: number;
    updateTime?: string;
  };

  type TagsAddRequest = {
    color?: string;
    icon?: string;
    sort?: number;
    tagsName?: string;
  };

  type TagsQueryRequest = {
    current?: number;
    id?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    tagsName?: string;
    type?: number;
  };

  type TagsUpdateRequest = {
    color?: string;
    icon?: string;
    id?: number;
    sort?: number;
    tagsName?: string;
    type?: number;
  };

  type TagsVO = {
    color?: string;
    icon?: string;
    id?: number;
    sort?: number;
    tagsName?: string;
    type?: number;
  };

  type TokenLoginUserVo = {
    avatarFramerUrl?: string;
    bindPlatforms?: PlatformBindVO[];
    createTime?: string;
    email?: string;
    id?: number;
    lastSignInDate?: string;
    level?: number;
    points?: number;
    saTokenInfo?: SaTokenInfo;
    titleId?: number;
    titleIdList?: string;
    updateTime?: string;
    usedPoints?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type unbindUsingDELETEParams = {
    /** source */
    source: string;
  };

  type UndercoverGuessRequest = {
    guessWord?: string;
    roomId?: string;
  };

  type UndercoverPlayerDetailVO = {
    guessCount?: number;
    isEliminated?: boolean;
    remainingGuessCount?: number;
    userAvatar?: string;
    userId?: number;
    userName?: string;
    voteCount?: number;
  };

  type UndercoverPlayerVO = {
    guessCount?: number;
    isEliminated?: boolean;
    remainingGuessCount?: number;
    role?: string;
    userId?: number;
    word?: string;
  };

  type UndercoverRoomCreateRequest = {
    /** 平民词 */
    civilianWord?: string;
    /** 持续时间秒 */
    duration?: number;
    /** 游戏模式：1-常规模式(默认)，2-卧底猜词模式 */
    gameMode?: number;
    /** 房间最大人数 */
    maxPlayers?: number;
    /** 卧底词 */
    undercoverWord?: string;
  };

  type UndercoverRoomJoinRequest = {
    roomId?: string;
  };

  type UndercoverRoomQuitRequest = {
    roomId?: string;
  };

  type UndercoverRoomVO = {
    createTime?: string;
    creatorAvatar?: string;
    creatorId?: number;
    creatorName?: string;
    duration?: number;
    eliminatedIds?: number[];
    gameMode?: number;
    gameResult?: string;
    maxPlayers?: number;
    orderedParticipantIds?: number[];
    participantIds?: number[];
    participants?: UndercoverPlayerDetailVO[];
    remainingTime?: number;
    role?: string;
    roomId?: string;
    startTime?: string;
    status?: 'WAITING' | 'PLAYING' | 'ENDED';
    votes?: UndercoverVoteVO[];
    word?: string;
  };

  type UndercoverVoteRequest = {
    roomId?: string;
    targetId?: number;
  };

  type UndercoverVoteVO = {
    targetAvatar?: string;
    targetId?: number;
    targetName?: string;
    voteTime?: string;
    voterAvatar?: string;
    voterId?: number;
    voterName?: string;
  };

  type unmuteUserUsingPOSTParams = {
    /** userId */
    userId: number;
  };

  type uploadFileByMinioUsingPOSTParams = {
    biz?: string;
  };

  type uploadFileUsingPOSTParams = {
    biz?: string;
  };

  type User = {
    avatarFramerList?: string;
    avatarFramerUrl?: string;
    createTime?: string;
    email?: string;
    id?: number;
    isDelete?: number;
    mpOpenId?: string;
    titleId?: number;
    titleIdList?: string;
    unionId?: string;
    updateTime?: string;
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userPassword?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserAddRequest = {
    userAccount?: string;
    userAvatar?: string;
    userName?: string;
    userRole?: string;
  };

  type UserBindEmailRequest = {
    code?: string;
    email?: string;
  };

  type UserChatResponse = {
    /** 用户头像 */
    avatar?: string;
    /** 头像框 URL */
    avatarFramerUrl?: string;
    /** 用户 ID */
    id?: string;
    /** 是否是管理员 */
    isAdmin?: boolean;
    /** 用户等级 */
    level?: number;
    /** 用户名称 */
    name?: string;
    /** 用户积分 */
    points?: number;
    /** 用户状态 */
    status?: string;
    /** 用户称号 ID */
    titleId?: number;
    /** 用户称号ID列表 */
    titleIdList?: string;
    /** 用户简介 */
    userProfile?: string;
  };

  type UserDataWebVO = {
    thisMonthActiveUsers?: number;
    todayActiveUsers?: number;
    todayNewUsers?: number;
    totalUsers?: number;
  };

  type UserEmailResetPasswordRequest = {
    checkPassword?: string;
    code?: string;
    email?: string;
    userPassword?: string;
  };

  type UserEmailSendRequest = {
    email?: string;
  };

  type userLoginByGithubUsingPOSTParams = {
    auth_code?: string;
    authorization_code?: string;
    code?: string;
    oauth_token?: string;
    oauth_verifier?: string;
    state?: string;
  };

  type UserLoginRequest = {
    email?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserMuteRequest = {
    /** 禁言时间（秒） */
    duration?: number;
    /** 用户id */
    userId?: number;
  };

  type UserMuteVO = {
    /** 是否被禁言 */
    isMuted?: boolean;
    /** 剩余禁言时间（格式化为时分秒） */
    remainingTime?: string;
  };

  type UserQueryRequest = {
    createTimeRange?: string[];
    current?: number;
    id?: number;
    mpOpenId?: string;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    unionId?: string;
    updateTimeRange?: string[];
    userAccount?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserRegisterRequest = {
    captchaVerification?: string;
    checkPassword?: string;
    code?: string;
    email?: string;
    userAccount?: string;
    userPassword?: string;
  };

  type UserTitle = {
    createTime?: string;
    isDelete?: number;
    name?: string;
    titleId?: number;
    updateTime?: string;
  };

  type UserUpdateMyRequest = {
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
  };

  type UserUpdateRequest = {
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type UserVO = {
    createTime?: string;
    id?: number;
    userAvatar?: string;
    userName?: string;
    userProfile?: string;
    userRole?: string;
  };

  type View = {
    contentType?: string;
  };

  type VO = {
    /** 抢到的金额 */
    amount?: number;
    /** 抢红包时间 */
    grabTime?: string;
    /** 记录ID */
    id?: string;
    /** 红包ID */
    redPacketId?: string;
    /** 用户头像 */
    userAvatar?: string;
    /** 用户ID */
    userId?: number;
    /** 用户昵称 */
    userName?: string;
  };

  type WebParseVO = {
    description?: string;
    favicon?: string;
    title?: string;
  };
}
