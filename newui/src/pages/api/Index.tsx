import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import ApplicationSelect from '@/components/ApplicationSelect';
import { queryApplication, queryApplicationAPIList } from '@/services/application';
import { Button, Checkbox, FormInstance, message, Popconfirm } from 'antd';
import { updateAPIFields } from '@/services/api';
import { ModalForm, ProFormGroup, ProFormRadio, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { TableListItem, TableListPagination } from './data';
import { list, remove, save } from './service';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Application } from '@/services/data';

export default (): React.ReactNode => {
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const formRef = useRef<FormInstance>();
  const [applications, setApplications] = useState<Application[]>()
  const [swaggerModalOpen, setSwaggerModalOpen] = useState(false)

  useEffect(() => {
    queryApplication().then(result => {
      setApplications(result)
    })
  }, [])
  const onCheckChange = (a) => {
    const updateModel = {}
    updateModel[a.target["data-column"]] = a.target.checked
    const id = a.target["data-id"]
    updateAPIFields(id, updateModel).then(result => {
      console.log("updateAPIFields", result);
      message.success('修改成功');
      actionRef.current?.reload()
    })
  }

  const methodColumnProp = { width: 80, title: '支持', search: false, align: "center", tooltip: '路由是否支持该请求', }
  const mirrorColumnProp = { width: 80, title: '镜像', search: false, align: "center", tooltip: '是否允许镜像流量到新的站点', }
  const columns: ProColumns<TableListItem>[] = [
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
      fixed: 'left',
      width: 150,
      valueEnum: applications?.reduce((acc: Record<number, any>, cur) => { acc[cur.ID] = { text: cur.Name }; return acc }, {}),
    },
    {
      title: '路由',
      dataIndex: 'URL',
      width: 300,
      search: true,
      fixed: 'left',
      align: "center"
    }, {
      title: "GET",
      search: false,
      children: [
        { width: 300, title: '描述', dataIndex: 'GETSummary' },
        { ...methodColumnProp, dataIndex: 'GET', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="GET" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'GETAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="GETAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "POST",
      search: false,
      children: [
        { width: 300, title: '描述', dataIndex: 'POSTSummary' },
        { ...methodColumnProp, dataIndex: 'POST', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="POST" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'POSTAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="POSTAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "PUT",
      search: false,
      children: [
        { width: 300, title: '描述', dataIndex: 'PUTSummary' },
        { ...methodColumnProp, dataIndex: 'PUT', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PUT" onChange={onCheckChange} />, title: '支持' },
        { ...mirrorColumnProp, dataIndex: 'PUTAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PUTAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "PATCH",
      search: false,
      children: [
        { width: 300, title: '描述', dataIndex: 'PATCHSummary' },
        { ...methodColumnProp, dataIndex: 'PATCH', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PATCH" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'PATCHAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="PATCHAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: "DELETE",
      search: false,
      children: [
        { width: 300, title: '描述', dataIndex: 'DELETESummary' },
        { ...methodColumnProp, dataIndex: 'DELETE', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="DELETE" onChange={onCheckChange} /> },
        { ...mirrorColumnProp, dataIndex: 'DELETEAllowMirror', render: (value, record) => <Checkbox checked={value} data-id={record.ID} data-column="DELETEAllowMirror" onChange={onCheckChange} /> },
      ]
    },
    {
      title: '操作', width: 100,
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (text, record: TableListItem, _, action) => [
        <a onClick={() => {
          formRef.current?.setFieldsValue(record)
          setCreateModalOpen(true)
        }}
        >编辑</a>
        ,
        <Popconfirm key="popconfirm" title={`确认删除${record.Name}吗?`} okText="是" cancelText="否" onConfirm={() => {
          remove({ ID: record.ID }).then(() => {
            actionRef.current?.reload()
          }).catch((error) => {
            message.error({ content: error.data?.errorMessage || "服务异常" })
          })
        }}>
          <a>删除</a>
        </Popconfirm>
      ],
    },
  ];

  return (
    <PageContainer pageHeaderRender={false}>
      <ProTable<TableListItem, TableListPagination>
        headerTitle="API管理"
        scroll={{ x: 2500 }}
        actionRef={actionRef}
        rowKey="ID"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button icon={<PlusOutlined />} size='small' type="primary" key="primary" onClick={() => {
            formRef.current?.resetFields();
            setCreateModalOpen(true);
          }}
          >新建</Button>,
          <Button icon={<UploadOutlined />} size='small' type="primary" key="primary" onClick={() => {
            setSwaggerModalOpen(true);
          }}
          >导入Swagger</Button>
        ]}
        request={list}
        pagination={{
          pageSize: 10
        }}
        bordered
        size="small"
        columns={columns}
      // dataSource={apiList}
      />
      <ModalForm<TableListItem>
        title="新增数据"
        width="800px"
        formRef={formRef}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        modalProps={{ forceRender: true }}
        onFinish={async (value) => {
          console.log("onFinish", value)
          let finishRes = false;
          await save(value).then(() => {
            finishRes = true;
            message.success({ content: "保存成功" })
            actionRef.current?.reload()
          }).catch(error => {
            finishRes = false;
            message.error({ content: error.data?.errorMessage || "服务异常" })
          });
          return finishRes;
        }}
        // labelCol={{ span: 4 }}
        // wrapperCol={{ span: 18 }}
        layout='horizontal'
      >
        <ProFormText hidden name="ID" />
        <ProFormSelect name="ApplicationID" label="所属应用" required rules={[{ required: true }]} options={applications?.map(m => ({ label: m.Name, value: m.ID }))} />
        <ProFormText name="URL" required rules={[{ required: true }]} label="路由" placeholder="" />
        <ProFormGroup>
          <ProFormSwitch width="md" name="GET" label="GET" placeholder="" />
          <ProFormSwitch width="md" name="GETAllowMirror" label="是否镜像" placeholder="" />
          <ProFormText width="md" name="GETSummary" label="说明" placeholder="" />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSwitch width="md" name="POST" label="POST" placeholder="" />
          <ProFormSwitch width="md" name="POSTAllowMirror" label="是否镜像" placeholder="" />
          <ProFormText width="md" name="POSTSummary" label="说明" placeholder="" />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSwitch width="md" name="PUT" label="PUT" placeholder="" />
          <ProFormSwitch width="md" name="PUTAllowMirror" label="是否镜像" placeholder="" />
          <ProFormText width="md" name="PUTSummary" label="说明" placeholder="" />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSwitch width="md" name="PATCH" label="PATCH" placeholder="" />
          <ProFormSwitch width="md" name="PATCHAllowMirror" label="是否镜像" placeholder="" />
          <ProFormText width="md" name="PATCHSummary" label="说明" placeholder="" />
        </ProFormGroup>
        <ProFormGroup>
          <ProFormSwitch width="md" name="DELETE" label="DELETE" placeholder="" />
          <ProFormSwitch width="md" name="DELETEAllowMirror" label="是否镜像" placeholder="" />
          <ProFormText width="md" name="DELETESummary" label="说明" placeholder="" />
        </ProFormGroup>
      </ModalForm>

      <ModalForm<TableListItem>
        title="swagger导入"
        width="800px"
        open={swaggerModalOpen}
        onOpenChange={setSwaggerModalOpen}
        modalProps={{ forceRender: true }}
        onFinish={async (value) => {
          // console.log("onFinish", value)
          // let finishRes = false;
          // await save(value).then(() => {
          //   finishRes = true;
          //   message.success({ content: "保存成功" })
          //   actionRef.current?.reload()
          // }).catch(error => {
          //   finishRes = false;
          //   message.error({ content: error.data?.errorMessage || "服务异常" })
          // });
          // return finishRes;
        }}
        layout='horizontal'
      >
        <ProFormText width='lg' name="url" required rules={[{ required: true }]} label="URL地址" placeholder="" addonAfter={<Button>加载</Button>} />
        <ProFormTextArea name="content" required rules={[{ required: true }]} label="内容" fieldProps={{ rows: 10 }} placeholder="" />
      </ModalForm>
    </PageContainer>
  )
}