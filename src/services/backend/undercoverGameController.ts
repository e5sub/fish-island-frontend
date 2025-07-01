// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取指定玩家信息（仅管理员） GET /api/undercover/admin/room/player */
export async function getPlayerInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPlayerInfoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUndercoverPlayerVO_>('/api/undercover/admin/room/player', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取当前活跃房间 GET /api/undercover/room/active */
export async function getActiveRoomUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseUndercoverRoomVO_>('/api/undercover/room/active', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 检查游戏是否结束 GET /api/undercover/room/check-game-over */
export async function checkGameOverUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkGameOverUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/check-game-over', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建游戏房间（仅管理员） POST /api/undercover/room/create */
export async function createRoomUsingPost(
  body: API.UndercoverRoomCreateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseString_>('/api/undercover/room/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 淘汰玩家 POST /api/undercover/room/eliminate */
export async function eliminatePlayerUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.eliminatePlayerUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/eliminate', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 结束游戏（仅管理员） POST /api/undercover/room/end */
export async function endGameUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.endGameUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/end', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 加入游戏房间 POST /api/undercover/room/join */
export async function joinRoomUsingPost(
  body: API.UndercoverRoomJoinRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前玩家信息 GET /api/undercover/room/player */
export async function getCurrentPlayerInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCurrentPlayerInfoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUndercoverPlayerVO_>('/api/undercover/room/player', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取玩家详细信息 GET /api/undercover/room/player-detail */
export async function getPlayerDetailInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPlayerDetailInfoUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseUndercoverPlayerDetailVO_>('/api/undercover/room/player-detail', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取房间内所有玩家详细信息 GET /api/undercover/room/players-detail */
export async function getRoomPlayersDetailUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRoomPlayersDetailUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListUndercoverPlayerDetailVO_>(
    '/api/undercover/room/players-detail',
    {
      method: 'GET',
      params: {
        ...params,
      },
      ...(options || {}),
    },
  );
}

/** 开始游戏（仅管理员） POST /api/undercover/room/start */
export async function startGameUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.startGameUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/start', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 提交投票 POST /api/undercover/room/vote */
export async function voteUsingPost(
  body: API.UndercoverVoteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/undercover/room/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取投票结果 GET /api/undercover/room/votes */
export async function getRoomVotesUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getRoomVotesUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseListUndercoverVoteVO_>('/api/undercover/room/votes', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
