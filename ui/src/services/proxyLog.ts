import { request } from 'umi';

export async function query(params?: any) {
  return request('/api/proxylog', {
    params,
  });
}
