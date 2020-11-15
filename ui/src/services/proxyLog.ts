import { request } from 'umi';

export async function query(params?: any) {
  return request('/api/proxylog', {
    params,
  });
}
export async function retry(id: number) {
  return request(`/api/proxylog/${id}/retry`, { method: "POST" });
}
