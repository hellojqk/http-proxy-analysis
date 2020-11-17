import { request } from 'umi';

export async function updateAPIFields(id: number, params: {}) {
  return request(`/api/api/${id}`, { method: "PATCH", data: params, });
}