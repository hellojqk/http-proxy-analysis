import React, { useEffect, useState } from 'react';
import { Select, } from 'antd';
import { queryApplication } from "@/services/application"
import { Application } from '@/services/API.d';

const ApiSelect = (props: any) => {
  const { form } = props
  const [applicationList, setApplicationList] = useState<Application[]>([])
  useEffect(() => {
    if (!applicationList || applicationList.length === 0) {
      queryApplication().then(result => {
        if (result) {
          setApplicationList(result)
        }
      })
    }
  }, [])
  const apiList: {}[] = [];
  const applicationID = form.getFieldValue("ApplicationID")
  if (applicationID && applicationList) {
    applicationList.forEach((app: Application) => {
      if (app.ID === applicationID && app.APIs) {
        app.APIs.forEach(api => {
          if (api.GET) {
            apiList.push({ key: `GET${api.ID}`, value: api.ID, label: `GET ${api.URL} ${api.GETSummary}` })
          }
          if (api.POST) {
            apiList.push({ key: `POST${api.ID}`, value: api.ID, label: `POST ${api.URL} ${api.POSTSummary}` })
          }
          if (api.PUT) {
            apiList.push({ key: `PUT${api.ID}`, value: api.ID, label: `PUT ${api.URL} ${api.PUTSummary}` })
          }
          if (api.PATCH) {
            apiList.push({ key: `PATCH${api.ID}`, value: api.ID, label: `PATCH ${api.URL} ${api.PATCHSummary}` })
          }
          if (api.DELETE) {
            apiList.push({ key: `DELETE${api.ID}`, value: api.ID, label: `DELETE ${api.URL} ${api.DELETESummary}` })
          }
        })
      }
    })
  }
  return <Select {...props} dropdownMatchSelectWidth={false} allowClear filterOption={(input, option: { label: string }) => {
    return option && option.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }} showSearch options={apiList} />
}

export default ApiSelect;