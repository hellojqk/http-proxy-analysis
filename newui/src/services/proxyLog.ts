import { request } from 'umi';
import { ProxyLog } from './data';

export async function queryProxyLog(params?: any) {
  return request('/api/proxylog', {
    params,
  });
}
export async function retryProxyLog(id: number) {
  return request(`/api/proxylog/${id}/retry`, { method: "POST" });
}

export async function ignoreProxyLog(data: ProxyLog) {
  return request("/api/proxylog/ignore", {
    method: "POST",
    skipErrorHandler: true,
    data: data
  })
}