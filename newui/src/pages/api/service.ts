// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
import { TableColumns, TableListItem } from './data';

export async function list(params: { current?: number; pageSize?: number; }, sort: any,) {
  return request<{ data: TableListItem[]; total?: number; success?: boolean; }>('/api/api', {
    method: 'GET',
    params: {
      ...params,
      sort: sort
    },
  }).then((response) => { return { data: response, success: true } });
}

export async function save(data: TableListItem) {
  return request("/api/api", {
    method: data.ID ? "PUT" : "POST",
    skipErrorHandler: true,
    data: data
  })
}

export async function saveSwagger(data: any) {
  return request("/api/api/importSwagger", {
    method: "POST",
    skipErrorHandler: true,
    data: data
  })
}

export async function remove(data: TableListItem) {
  return request("/api/api", {
    method: "DELETE",
    skipErrorHandler: true,
    data: data
  })
}