import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Divider, Input } from 'antd';
import { query } from '../services/proxyLog';
// import { Card, Alert, Typography } from 'antd';
// import styles from './Welcome.less';

// const CodePreview: React.FC<{}> = ({ children }) => (
//   <pre className={styles.pre}>
//     <code>
//       <Typography.Text copyable>{children}</Typography.Text>
//     </code>
//   </pre>
// );

export interface Model {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
}
export interface Application extends Model {
  Name: string;
  OldHost: string;
  NewHost: string;
  Status: boolean;
  APIs: API[];
}
export interface API extends Model {
  ApplicationID: number;
  URL: string;
  GET: boolean;
  POST: boolean;
  PUT: boolean;
  PATCH: boolean;
  DELETE: boolean;
  Status: boolean;
  Application: Application;
}
export interface ProxyLog extends Model {
  ApplicationID: number;
  APIID: number;
  OldRequestMethod: string;
  OldRequestURL: string;
  OldRequestHeader: string;
  OldRequestBody: string;
  OldResponseHeader: string;
  OldResponseBody: string;
  OldResponseStatus: number;
  NewResponseHeader: string;
  NewResponseBody: string;
  NewResponseStatus: number;
  AnalysisResult: string;
  Application: Application;
  API: API;
}


export default (): React.ReactNode => {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<ProxyLog>[] = [
    {
      title: '应用程序',
      dataIndex: 'Application',
      render: (_, record) => {
        if (!record.Application) {
          return "-";
        }
        return <>{record.Application.Name}</>
      },
    },
    {
      title: '路由',
      dataIndex: 'API',
      render: (_, record) => {
        if (!record.API) {
          return "-";
        }
        return <>{record.API.URL}</>
      },
    },
    {
      title: '旧方法',
      dataIndex: 'OldRequestMethod',
      tooltip: '接口请求类型'
    },
    {
      title: '旧Url',
      dataIndex: 'OldRequestURL',
      tooltip: '接口请求路径'
    },
    {
      title: '旧状态',
      dataIndex: 'OldResponseStatus',
      tooltip: '旧接口返回HTTP状态码'
    },
    {
      title: '新状态',
      dataIndex: 'NewResponseStatus',
      tooltip: '新接口返回HTTP状态码'
    },
    {
      title: '分析结果',
      dataIndex: 'AnalysisResult',
      tooltip: '后端服务初步分析的结果差异，详细差异见对比操作'
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a href="">展开</a>
          <Divider type="vertical" />
          <a href="">对比</a>
          <Divider type="vertical" />
          <a href="">重发</a>
        </>
      ),
    },
  ];
  return (
    <PageContainer pageHeaderRender={false}>
      <ProTable<ProxyLog>
        headerTitle="代理日志"
        actionRef={actionRef}
        rowKey="ID"
        search={{
          labelWidth: 120,
        }}
        request={(params, sorter, filter) => query({ ...params, sorter, filter })}
        columns={columns}
      />
    </PageContainer>
  )
}
