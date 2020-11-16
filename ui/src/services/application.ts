import { request } from 'umi';

export async function queryApplication(params?: any) {
  return request('/api/application', {
    params,
  });
}