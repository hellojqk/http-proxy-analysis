import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import ApplicationSelect from '@/components/ApplicationSelect';
import { queryApplicationAPIList } from '@/services/application';
import { Checkbox, message } from 'antd';
import { updateAPIFields } from '@/services/api';

export default (): React.ReactNode => {
  const actionRef = useRef<ActionType>();

  const [apiList, setApiList] = useState([])
  const [appID, setAppID] = useState(0)

  const loadData = (id: number) => {
    let loadId = id;
    if (!loadId) {
      loadId = appID;
    }
    if (!loadId) {
      return
    }
    queryApplicationAPIList(loadId).then(result => {
      console.log("queryApplicationAPIList", result);
      setApiList(result);
    })
  }

  const onAppChange = (id: number) => {
    setAppID(id);
    loadData(id);
  }

  const onCheckChange = (a) => {
    const updateModel = {}
    updateModel[a.target["data-column"]] = a.target.checked
    const id = a.target["data-id"]
    updateAPIFields(id, updateModel).then(result => {
      console.log("updateAPIFields", result);
      message.success('修改成功');
      loadData(appID);
    })
  }

  const methodColumnProp = { width: 80, title: '支持', search: false, align: "center", tooltip: '路由是否支持该请求', }
  const mirrorColumnProp = { width: 80, title: '镜像', search: false, align: "center", tooltip: '是否允许镜像流量到新的站点', }
  const columns: ProColumns<API.API>[] = [
    {
      title: '编号',
      dataIndex: 'ID',
      width: 100,
      search: false,
      fixed: 'left',
      align: "center"
    },
    {
      title: '应用程序',
      dataIndex: 'ApplicationID',
      hideInTable: true,
      renderFormItem: (item, config, form) => {
        return <ApplicationSelect {...config} onChange={onAppChange} />
      }
    },
    {
      title: '路由',
      dataIndex: 'URL',
      width: 300,
      search: false,
      fixed: 'left',
      align: "center"
    }, {
      title: "GET",
      children: [
        { width: 300, title: '描述', dataIndex: 'GETSummary', search: false, },
        { ...methodColumnProp, dataIndex: 'GET', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="GET" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'GETAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="GETAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "POST",
      children: [
        { width: 300, title: '描述', dataIndex: 'POSTSummary', search: false, },
        { ...methodColumnProp, dataIndex: 'POST', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="POST" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'POSTAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="POSTAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "PUT",
      children: [
        { width: 300, title: '描述', dataIndex: 'PUTSummary', search: false, },
        { ...methodColumnProp, dataIndex: 'PUT', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PUT" onChange={onCheckChange} />, title: '支持' },
        { ...mirrorColumnProp, dataIndex: 'PUTAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PUTAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "PATCH",
      children: [
        { width: 300, title: '描述', dataIndex: 'PATCHSummary', search: false, },
        { ...methodColumnProp, dataIndex: 'PATCH', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PATCH" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'PATCHAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PATCHAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "DELETE",
      children: [
        { width: 300, title: '描述', dataIndex: 'DELETESummary', search: false, },
        { ...methodColumnProp, dataIndex: 'DELETE', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="DELETE" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'DELETEAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="DELETEAllowMirror" onChange={onCheckChange} /> },
      ]
    },
  ];

  return (
    <PageContainer pageHeaderRender={false}>
      <ProTable<API.API>
        headerTitle="API管理"
        scroll={{ x: 2500 }}
        actionRef={actionRef}
        rowKey="ID"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          pageSize: 10
        }}
        bordered
        size="small"
        columns={columns}
        dataSource={apiList}
      />
    </PageContainer>
  )
}