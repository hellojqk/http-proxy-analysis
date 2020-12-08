import { request } from 'umi';

export async function queryDiffStrategyList() {
  return request(`/api/diff_strategy`);
}

export async function deleteDiffStrategy(id: number) {
  return request(`/api/diff_strategy/${id}`, {
    method: "DELETE",
  });
}

export async function insertDiffStrategy(param: any) {
  return request(`/api/diff_strategy`, {
    method: "POST",
    data: param
  });
}
