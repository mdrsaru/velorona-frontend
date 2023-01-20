import { Button, Col, Form, InputNumber, message, Modal, Row, Select, Space } from "antd"
import { CloseOutlined } from "@ant-design/icons"

import { gql, useMutation, useQuery } from "@apollo/client"
import { PROJECT } from "../../pages/Project"
import { authVar } from "../../App/link"
import { CurrencyPagingResult, MutationUserPayRateCreateArgs, QueryCurrencyArgs, UserPayRate } from "../../interfaces/generated"
import { notifyGraphqlError } from "../../utils/error"

import { USER_PAY_RATE } from "../ViewUserPayRate"
import { GraphQLResponse } from "../../interfaces/graphql.interface"
import styles from "./styles.module.scss"
import { CURRENCY } from "../../pages/Currency"

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  userPayRate?: any;
}


export const USER_PAYRATE_CREATE = gql`
  mutation UserPayRateCreate($input: UserPayRateCreateInput!) {
    UserPayRateCreate(input: $input) {
      id
    }
  }
`;

const UserPayRateModal = (props: IProps) => {
  const loggedInUser = authVar()
  const user = props.data
  const { userPayRate } = props;
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

  const { data: currencyData } = useQuery<
    GraphQLResponse<'Currency', CurrencyPagingResult>,
    QueryCurrencyArgs
  >(CURRENCY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only'
  });

  const project_ids: any = [];

  projectData?.Project?.data?.forEach((project: any, index: number) => {
    project_ids.push({ id: project?.id, name: project?.name })
  })

  const ids: any = []

  userPayRate?.UserPayRate?.data?.forEach((userPayRate: any, index: number) => {
    ids.push({ id: userPayRate?.project?.id, name: userPayRate?.project?.name })
  })

  let projectList = project_ids.filter(function (objOne: any) {
    return !ids.some(function (objTwo: any) {
      return objOne.id === objTwo.id;
    });
  });

  const [userPayRateCreate] = useMutation<
    GraphQLResponse<'UserPayRateCreate', UserPayRate>, MutationUserPayRateCreateArgs
  >(USER_PAYRATE_CREATE, {
    refetchQueries: [
      {
        query: USER_PAY_RATE,
        variables: {
          input: {
            query: {
              user_id: user?.id,
            },
            paging: {
              order: ["updatedAt:DESC"],
            },
          },
        },
      },

      'UserPayRate'
    ],
    onCompleted() {
      message.success({
        content: `User pay rate added successfully!`,
        className: "custom-message",
      });
      props.setVisibility(false)
    },
    onError(err) {
      return notifyGraphqlError(err);

    }
  })
  const [form] = Form.useForm();


  const selectUserRateCurrency = (
    <Form.Item name='user_rate_currency_id' className={styles['form-select-item']}>
      <Select style={{ width: '5rem' }} placeholder='Symbol'>
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
      <Select style={{ width: '5rem' }} placeholder='Symbol'>
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

  const onSubmitForm = (values: any) => {
    form.resetFields()

    const input: any = {
      user_id: user.id,
      project_id: values.project_id,
      amount: values.payRate,
      invoiceRate: values.invoiceRate,
      company_id: loggedInUser.company?.id as string,
      user_rate_currency_id: values.user_rate_currency_id,
      invoice_rate_currency_id: values.invoice_rate_currency_id,


    }

    userPayRateCreate({
      variables: {
        input: input
      }
    })
  };

  const onCancel = () => {
    form.resetFields()
    props.setVisibility(false)
  }

  let defaultValues: any;
  if (currencyData) {
    let id;
    currencyData?.Currency?.data?.map((currency) => {
      if (currency?.symbol === '$') {
        return (
          id = currency?.id
        )
      }
    })
    defaultValues = {
      user_rate_currency_id: id,
      invoice_rate_currency_id: id,
    }
  }
  return (
    <Modal
      centered
      visible={props?.visibility}
      className={styles['user-pay-rate']}
      closeIcon={[
        <div onClick={onCancel}
          key={1}>
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
            Add payment
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
          name="payrate-form"
          initialValues={defaultValues}
          onFinish={onSubmitForm}>
          <Row gutter={[24, 0]}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item
                label="Project Name"
                name="project_id"
                rules={[{
                  required: true,
                  message: 'Please select project'
              }]}>
                <Select placeholder="Select Project">
                  {projectList?.map((project: any, index: number) => (
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
                  style={{ width: '100%' }}/>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                label="Payrate"
                name="payRate">
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
              <Form.Item name="action-button">
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

export default UserPayRateModal;
