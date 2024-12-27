import { request } from 'umi';

export async function queryProxyLog(params?: any) {
  return request('/api/proxylog', {
    params,
  });
}
export async function retryProxyLog(id: number) {
  return request(`/api/proxylog/${id}/retry`, { method: "POST" });
}
