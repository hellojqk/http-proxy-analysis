import React, { useEffect, useState } from 'react';
import { Select, } from 'antd';
import { queryApplication } from "@/services/application"


const ApplicationSelect = (props: any) => {
  const [applicationList, setApplicationList] = useState<API.Application[]>([])
  useEffect(() => {
    if (!applicationList || applicationList.length === 0) {
      queryApplication().then(result => {
        if (result) {
          setApplicationList(result)
        }
      })
    }
  }, [])
  return <Select {...props} filterOption={(input, option: { label: string }) => {
    return option && option.label && option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
  }} showSearch options={applicationList.map((f: API.Application) => { return { label: f.Name, value: f.ID } })} />
}
export default ApplicationSelect