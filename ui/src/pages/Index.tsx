import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { Button, Collapse, Divider, Input, message } from 'antd';
import { query, retry } from '../services/proxyLog';

const { Panel } = Collapse;

// import { Card, Alert, Typography } from 'antd';
// import styles from './Index.less';

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
      title: '编号',
      dataIndex: 'ID',
      search: false,
    },
    {
      title: '应用程序',
      dataIndex: 'Name',
      render: (_, record) => {
        if (!record.Application) {
          return "-";
        }
        return <>{record.Application.Name}</>
      },
    },
    {
      title: '路由',
      dataIndex: 'URL',
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
      search: false,
      tooltip: '后端服务初步分析的结果差异，详细差异见对比操作',
      render: (_, record) => {
        if (!record.AnalysisResult) {
          return <>0</>
        }
        const analysisResult = JSON.parse(record.AnalysisResult)
        return <>{analysisResult.length}</>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'CreatedAt',
      search: false,
      valueType: 'dateTime'
    },
    {
      title: '旧Url',
      dataIndex: 'OldRequestURL',
      tooltip: '接口请求路径'
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <>
          <a href={`/proxylog/${record.ID}`}>对比</a>
          <Divider type="vertical" />
          <a onClick={async () => {
            try {
              await retry(record.ID);
              message.success('重发成功');
              return true;
            } catch (error) {
              message.error('重发失败');
              return false;
            }
          }}>重发</a>
        </>
      ),
    },
  ];
  return (
    <PageContainer pageHeaderRender={false}>
      <ProTable<ProxyLog>
        headerTitle="代理日志"
        scroll={{ x: 2000 }}
        actionRef={actionRef}
        rowKey="ID"
        search={{
          labelWidth: 120,
        }}
        request={(params, sorter, filter) => query({ ...params, sorter, filter })}
        columns={columns}
        expandable={{
          rowExpandable: () => true,
          expandedRowRender: record => <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8']}>
            <Panel header="后端简要分析结果" key="1">
              <p>{record.AnalysisResult}</p>
            </Panel>
            <Panel header="请求路径" key="2">
              <p>{record.Application ? record.Application.OldHost + record.OldRequestURL : record.OldRequestURL}</p>
            </Panel>
            <Panel header="请求头部信息" key="3">
              <p>{record.OldRequestHeader}</p>
            </Panel>
            <Panel header="请求发送内容" key="4">
              <p>{record.OldRequestBody}</p>
            </Panel>
            <Panel header={`旧应用返回头部信息，Status：${record.OldResponseStatus}`} key="5">
              <p>{record.OldResponseHeader}</p>
            </Panel>
            <Panel header="旧应用返回头部信息" key="6">
              <p>{record.OldResponseBody}</p>
            </Panel>
            <Panel header={`新应用返回头部信息，Status：${record.NewResponseStatus}`} key="7">
              <p>{record.NewResponseHeader}</p>
            </Panel>
            <Panel header="新应用返回头部信息" key="8">
              <p>{record.NewResponseBody}</p>
            </Panel>
          </Collapse>,
        }}
      />
    </PageContainer>
  )
}
