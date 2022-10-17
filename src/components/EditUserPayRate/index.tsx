import { useEffect, useState } from "react"
import { Button, Col, Form, InputNumber, message, Modal, Row, Select, Space } from "antd"
import { CloseOutlined } from "@ant-design/icons"

import { gql, useMutation, useQuery } from "@apollo/client"
import { PROJECT } from "../../pages/Project"
import { authVar } from "../../App/link"
import { CurrencyPagingResult, MutationUserPayRateUpdateArgs, QueryCurrencyArgs, UserPayRate } from "../../interfaces/generated"
import { GraphQLResponse } from "../../interfaces/graphql.interface"
import styles from "../UserPayRate/styles.module.scss"
import { CURRENCY } from "../../pages/Currency"

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  id?: string
  userPayRateData: any;
}


export const USER_PAYRATE_UPDATE = gql`
  mutation UserPayRateUpdate($input: UserPayRateUpdateInput!) {
    UserPayRateUpdate(input: $input) {
      id
      project{
      id
      name
      client{
      id 
      name
      }
      }
      amount
      invoiceRate
      
    }
  }
`;

const EditUserPayRateModal = (props: IProps) => {
  const loggedInUser = authVar()
  const user = props.data
  const { userPayRateData } = props;

  const { data: projectData } = useQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          user_id: user?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const { data: currencyData} = useQuery<
    GraphQLResponse<'Currency', CurrencyPagingResult>,
    QueryCurrencyArgs
  >(CURRENCY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only'
  });


  const [form] = Form.useForm();
  const [userRateCurrency, setUserRateCurrency] = useState('')
  const [invoiceRateCurrency, setInvoiceRateCurrency] = useState('')

  const handleUserRateCurrency = (id: any) => {
    setUserRateCurrency(id)
  }

  const handleInvoiceRateCurrency = (id: string) => {
    setInvoiceRateCurrency(id)
  }

  const selectUserRateCurrency = (
    <Form.Item name='user_rate_currency_id' className={styles['form-select-item']}>
      <Select style={{ width: '5rem' }} placeholder='Symbol' onChange={handleUserRateCurrency}>
        {currencyData?.Currency?.data?.map((currency, index) => (
          <Select.Option
            value={currency.id}
            key={index}
          >
            {currency.symbol}
          </Select.Option>

        ))}
      </Select>
    </Form.Item>
  );

  const selectInvoiceRateCurrency = (
    <Form.Item name='invoice_rate_currency_id' className={styles['form-select-item']}>
      <Select style={{ width: '5rem' }} placeholder='Symbol' onChange={handleInvoiceRateCurrency} >
        {currencyData?.Currency?.data?.map((currency, index) => (
          <Select.Option
            value={currency.id}
            key={index}

          >
            {currency.symbol}
          </Select.Option>
        ))}

      </Select>
   </Form.Item>

  );

  const [userPayRateUpdate] = useMutation<
    GraphQLResponse<'UserPayRateUpdate', UserPayRate>, MutationUserPayRateUpdateArgs
  >(USER_PAYRATE_UPDATE, {

    onCompleted() {
      message.success({
        content: `User pay rate updated successfully!`,
        className: "custom-message",
      });
      props.setVisibility(false)
    },
    onError(err) {
      return message.error('You can not add pay rate to already existing project')

    }
  })

  const onSubmitForm = (values: any) => {
    const input: any = {
      id: props?.id as string,
      project_id: values.project_id,
      amount: values.amount,
      invoiceRate: values.invoiceRate,
    }

    if (userRateCurrency) {
      input.user_rate_currency_id = userRateCurrency
    }

    if (invoiceRateCurrency) {
      input.invoice_rate_currency_id = invoiceRateCurrency
    }

    userPayRateUpdate({
      variables: {
        input: input
      }
    })
  };

  const onCancel = () => {
    props.setVisibility(!props.visibility)
  }


  let defaultValues: any;
  if (userPayRateData) {
    defaultValues = {
      project_id: userPayRateData?.UserPayRate?.data?.[0]?.project?.id,
      amount: userPayRateData?.UserPayRate?.data?.[0]?.amount ?? 0,
      invoiceRate: userPayRateData?.UserPayRate?.data?.[0]?.invoiceRate,
      user_rate_currency_id: userPayRateData?.UserPayRate?.data?.[0]?.userRateCurrency?.id,
      invoice_rate_currency_id: userPayRateData?.UserPayRate?.data?.[0]?.invoiceRateCurrency?.id
    }
  }

  useEffect(() => {
    form.setFieldsValue(defaultValues)
  }, [form, defaultValues])
  return (
    <Modal
      centered
      visible={props?.visibility}
      className={styles['user-pay-rate']}
      closeIcon={[
        <div onClick={() => props?.setVisibility(false)} key={2}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      width={869}
      footer={null}>
      <div className={styles["modal-body"]}>
        <div>
          <span className={styles["title"]}>
            Edit Employee PayRate
          </span>
        </div>

        <div className={styles.employeeDetailDiv}>
          <p className={styles.employeeName}>
            {user?.fullName}
          </p>
        </div>
        <Form
          form={form}
          layout="vertical"
          name="user-payrate-form"
          onFinish={onSubmitForm}
          initialValues={defaultValues}
        >
          <Row gutter={[24, 0]}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item
                label="Project Name"
                name="project_id">
                <Select placeholder="Select Project">
                  {projectData?.Project?.data?.map((project: any, index: number) => (
                    <Select.Option value={project?.id} key={index}>
                      {project?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                label="Invoice rate"
                name="invoiceRate">
                <InputNumber
                  addonBefore={selectInvoiceRateCurrency}
                  addonAfter="Hr"
                  placeholder="Enter invoice rate"
                  autoComplete="off"
                  style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
              label="Payrate"
                name="amount">
                <InputNumber
                  addonBefore={selectUserRateCurrency}
                  addonAfter="Hr"
                  placeholder="Enter payrate"
                  autoComplete="off"
                  style={{ width: '100%' }} />
              </Form.Item>
            </Col>



          </Row>
          <Row justify="end">
            <Col style={{ padding: '0 1rem 1rem 0' }}>
              <Form.Item name="action-btn">
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
  )
};

export default EditUserPayRateModal;
