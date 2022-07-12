
import { gql, useQuery } from "@apollo/client";
import { Form, Modal, Row, Col, Button, Space, Input } from "antd"
import { useEffect, useState } from "react";
import { authVar } from "../../App/link";
import { QueryUserArgs, UserPagingResult } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { USER } from "../../pages/Employee";

import { CheckCircleFilled } from '@ant-design/icons'
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import { debounce } from "lodash";

import styles from './styles.module.scss'

interface IProps {
  visibility: boolean;
  setVisibility: any;
  setEmployee?: any;
}


const AddWorkscheduleEmployee = (props: IProps) => {
  const loggedInUser = authVar()
  const [form] = Form.useForm();

  const [filterForm] = Form.useForm();

  const [user, setUser] = useState('');

  useEffect(() => {
    setUser('')
  }, [])
  const { data: employeeData, refetch: refetchEmployee } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(
    USER,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: loggedInUser?.user?.id
          }
        },
      },
    }
  );


  const onChangeFilter = () => {
    let values = filterForm.getFieldsValue(['search'])
    let input: {
      paging: any,
      query?: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      }
    }
    let query: {
      search?: string
    } = {}


    if (values.search) {
      query['search'] = values?.search
    }

    if (query) {
      input['query'] = query
    }
    refetchEmployee({
      input: input
    })
  }

  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  const handleChange = (id: any) => {
    setUser(id);
  };
  const employeeList = employeeData?.User?.data;

  const onSubmitForm = () => {
    props.setEmployee(user)
    setUser('')
    props?.setVisibility(false)

  }

  const onCancel = () => {
    props?.setVisibility(false)
  }
  return (
    <>
      <Modal
        centered
        width={1000}
        footer={null}
        visible={props?.visibility}
        onCancel={() => props?.setVisibility(false)}
        okText='Add Employee'
        cancelText='Add '
      >
        <div style={{ marginTop: '10px' }}>
          <div className={styles['title-div']}>
            <span className={styles["title"]}>
              Add Employee
            </span>
          </div>

          <Form
            form={filterForm}
            layout="vertical"
            onFinish={() => { }}
            autoComplete="off"
            name="filter-form">
            <Form.Item name="search" label="">
              <Input
                prefix={<SearchOutlined className="site-form-item-icon" />}
                placeholder="Search by User name"
                onChange={debouncedResults}
              />
            </Form.Item>
          </Form>
          <p className={styles.employeeList}>Employee List </p>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={24}
                lg={24}>
                {employeeList?.map((employee, index) => {
                  return (
                    <Row>

                      <Col style={{ marginBottom: '2%' }} lg={23} >
                        {employee.fullName}
                      </Col>
                      <Col>
                        <CheckCircleFilled onClick={() => handleChange(employee?.fullName)} className={user === employee?.fullName ? `${styles.selected}` : `${styles.check}`} />
                      </Col>
                    </Row>
                  )
                })}
              </Col>

            </Row>
            <Row justify="end">
              <Col style={{ padding: '0 1rem 1rem 0' }}>
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit">
                      Continue
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </>
  )
}

export default AddWorkscheduleEmployee