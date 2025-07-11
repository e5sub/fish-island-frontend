// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 批量设置事件提醒为已读 POST /api/event_remind/batch/set/read */
export async function batchSetReadUsingPost(
  body: API.EventRemindStateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>('/api/event_remind/batch/set/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页获取当前用户的事件提醒列表 POST /api/event_remind/my/list/page */
export async function listMyEventRemindByPageUsingPost(
  body: API.EventRemindQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageEventRemindVO_>('/api/event_remind/my/list/page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
