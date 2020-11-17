import { request } from 'umi';

export async function queryApplication(params?: any) {
  return request('/api/application', {
    params,
  });
}

export async function queryApplicationAPIList(id: number) {
  return request(`/api/application/${id}/api`);
}
