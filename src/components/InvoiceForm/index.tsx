import moment from 'moment';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input, Row, Select, Image, DatePicker, InputNumber, Space, message } from 'antd';

import { round } from '../../utils/common';
import { notifyGraphqlError } from '../../utils/error';
import routes from '../../config/routes';
import { authVar } from '../../App/link';
import { Invoice, ProjectQueryInput, InvoiceCreateInput } from '../../interfaces/generated';
import { ProjectPagingData } from '../../interfaces/graphql.interface';

import addIcon from '../../assets/images/add_icon.svg';
import styles from './style.module.scss';

interface IProps {
  client_id: string;
}

const PROJECT_LIST = gql`
  query ProjectList($input: ProjectQueryInput!) {
    Project(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

const INVOICE_CREATE = gql`
  mutation InvoiceCreate($input: InvoiceCreateInput!) {
    InvoiceCreate(input: $input) {
      id
    }
  }
`;

const InvoiceForm = (props: IProps) => {
  const navigate = useNavigate();
  const loggedInUser = authVar();
  const [form] = Form.useForm();

  const company_id = loggedInUser?.company?.id as string

  const [createInvoice, { loading: creatingInvoice }] = useMutation<
    { InvoiceCreate: Invoice }, { input: InvoiceCreateInput }
  >(
    INVOICE_CREATE, {
      onCompleted(data) {
        if(data.InvoiceCreate) {
          message.success('Invoice created successfully');
          navigate(routes.invoice.path(loggedInUser?.company?.code as string));
        }
      },
      onError: notifyGraphqlError,
    }
  );

  const { data: projectData, loading: projectLoading } = useQuery<
    ProjectPagingData,
    {
      input: ProjectQueryInput,
    }
  >(PROJECT_LIST, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    variables: {
      input: {
        query: {
          client_id: props.client_id,
          company_id,
        }
      }
    }
  });

  const initialValues = {
    date: moment(),
    paymentDue: moment(),
    poNumber: '',
    totalAmount: 1,
    subtotal: 1,
    taxPercent: 0,
    notes: '',
    totalHours: 1,
    items: [
      {
        hours: 1,
        rate: 1,
        amount: 1,
      }
    ]
  }

  const onHourRateChange = (index: number) => {
    let { items, totalAmount, taxPercent = 0 }= form.getFieldsValue();

    const hours = items?.[index]?.hours;
    const rate = items?.[index]?.rate;

    if(hours && rate) {
      items[index].amount = round(hours * rate, 2);

      const subtotal = items.reduce((acc: number, current: any) => {
        return acc + current.amount;
      }, 0) 

      const totalHours = items.reduce((acc: number, current: any) => {
        return acc + current.hours;
      }, 0) 

      if(taxPercent >= 0) {
        totalAmount = (1 - taxPercent * 0.01) * subtotal;
      } else {
        totalAmount = subtotal;
      }

      form.setFieldsValue({
        items,
        totalHours,
        subtotal: round(subtotal, 2),
        totalAmount: round(totalAmount, 2),
      });
    }
  }

  const onTaxPercentChange = (value: number) => {
    const subtotal = form.getFieldValue('subtotal') 

    if(value >= 0) {
      const totalAmount = (1 - value * 0.01) * subtotal;
      form.setFieldsValue({
        totalAmount: round(totalAmount, 2),
      });
    }
  }

  const onSubmit = (values: any) => {
    const input: InvoiceCreateInput = {
      client_id: props.client_id,
      company_id,
      poNumber: values.poNumber,
      date: values.date?.toISOString(),
      paymentDue: values.paymentDue?.toISOString(),
      notes: values.notes,
      taxPercent: values.taxPercent,
      totalAmount: parseFloat(values.totalAmount),
      subtotal: parseFloat(values.subtotal),
      totalHours: values.totalHours,
      items: values.items.map((item: any) => ({
        project_id: item.project_id,
        hours: item.hours,
        rate: item.rate,
        amount: item.amount,
      })),
    } 

    createInvoice({
      variables: {
        input,
      }
    })
  } 


  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Row gutter={24}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label="Invoice Number"
          >
            <Input placeholder="Invoice Number" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            name="date"
            label="Invoice Date"
            rules={[{
              required: true,
              message: 'Please select invoice date'
            }]}
          >
            <DatePicker />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            name="paymentDue"
            label="Payment Due"
            rules={[{
              required: true,
              message: 'Please select payment due date'
            }]}
          >
            <DatePicker />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label="PO Number"
            name='poNumber'
            rules={[{
              required: true,
              message: 'Please enter PO Number'
            }]}
          >
            <Input placeholder="Enter PO Number" autoComplete="off" />
          </Form.Item>

        </Col>
      </Row>

      <div>
        <table className={styles['items-table']}>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Total Hour</th>
              <th>Rates</th>
              <th>Amount</th>
            </tr>
          </thead>

          <Form.List name="items">
            {(fields, { add, remove }) => {
              return (
                <>
                  <tbody>
                    {
                      fields.map(({ key, name, ...restField }) => (
                        <tr key={key}>
                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'project_id']}
                              rules={[{
                                required: true,
                                message: 'Please select project'
                              }]}
                              {...restField}
                            >
                              <Select placeholder="Select Project" loading={projectLoading}>
                                {
                                  projectData?.Project?.data?.map((project) => (
                                    <Select.Option key={project.id} value={project.id}>{project.name}</Select.Option>
                                  ))
                                }
                              </Select>
                            </Form.Item>
                          </td>

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'hours']}
                              rules={[{
                                required: true,
                                message: 'Please enter hours'
                              }]}
                              {...restField}
                            >
                              <InputNumber min={1} autoComplete="off" onChange={() => onHourRateChange(key)} />
                            </Form.Item>
                          </td>

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'rate']}
                              {...restField}
                              rules={[{
                                required: true,
                                message: 'Please enter rate'
                              }]}
                            >
                              <InputNumber min={1} autoComplete="off" onChange={() => onHourRateChange(key)} />
                            </Form.Item>
                          </td>

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'amount']}
                              {...restField}
                            >
                              <InputNumber disabled placeholder="Total Amount" autoComplete="off" />
                            </Form.Item>
                          </td>

                        </tr>
                      ))
                    }

                    <tr>
                      <td>
                        <Form.Item>
                          <div 
                            className={styles['add-project']} 
                            onClick={() => add({
                              project_id: undefined,
                              hours: 1,
                              rate: 1,
                              amount: 1,
                            })}
                          >
                            <Image width={20} src={addIcon} preview={false} />
                            &nbsp; &nbsp; Add Project
                          </div>
                        </Form.Item>
                      </td>
                    </tr>

                    <tr>
                      <td className={styles['horizontal']} colSpan={4}></td>
                    </tr>

                  </tbody>
                </>
              )
            }}
          </Form.List>

          <tfoot>
            <tr>
              <td>
                <Form.Item
                  name='notes'
                  label="Notes"
                >
                  <Input placeholder="notes" autoComplete="off" />
                </Form.Item>

              </td>

              <td>
                <Form.Item 
                  name="totalHours" 
                  className={styles['td-input']}
                  label="Total Hours"
                >
                  <InputNumber disabled placeholder="Total Hours" />
                </Form.Item>
              </td>

              <td></td>

              <td>
                <Form.Item 
                  name="subtotal" 
                  className={styles['td-input']}
                  label="Sub Total"
                >
                  <InputNumber disabled />
                </Form.Item>
              </td>

            </tr>

            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <Form.Item 
                  name="taxPercent" 
                  className={styles['td-input']}
                  label="Tax Percentage"
                >
                  <InputNumber placeholder="Enter Tax %" onChange={onTaxPercentChange}/>
                </Form.Item>
              </td>
            </tr>

            <tr>
              <td className={styles['horizontal']} colSpan={4}></td>
            </tr>

            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <Form.Item 
                  name="totalAmount" 
                  className={styles['td-input']}
                  label="Total Amount"
                >
                  <InputNumber disabled />
                </Form.Item>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Row justify="end">
        <Space>
          <Button type="primary" htmlType="submit" loading={creatingInvoice}>Save and Exit</Button>

          <Button type="primary">Send Invoice</Button>
        </Space>
      </Row>
    </Form>
  )
}

export default InvoiceForm
