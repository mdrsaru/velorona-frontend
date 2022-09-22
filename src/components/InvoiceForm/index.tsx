import moment from 'moment';
import isNil from 'lodash/isNil';
import { ChangeEvent, useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Button, Col, Form, Input, Row, Select, Image, DatePicker, InputNumber, Space, message, Popover, Checkbox } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

import { round } from '../../utils/common';
import { notifyGraphqlError } from '../../utils/error';
import routes from '../../config/routes';
import { authVar } from '../../App/link';
import { GraphQLResponse, IInvoiceInput } from '../../interfaces/graphql.interface';
import {
  Invoice,
  InvoiceCreateInput,
  InvoiceUpdateInput,
  ProjectPagingResult,
  MutationInvoiceUpdateArgs,
  MutationInvoiceCreateArgs,
  QueryProjectArgs
} from '../../interfaces/generated';

import addIcon from '../../assets/images/add_icon.svg';
import styles from './style.module.scss';

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

export const INVOICE_UPDATE = gql`
  mutation InvoiceUpdate($input: InvoiceUpdateInput!) {
    InvoiceUpdate(input: $input) {
      id
    }
  }
`;

interface IProps {
  timesheet_id?: string;
  client_id: string;
  startDate?: string;
  endDate?: string;
  user_id?: string;
  /**
   * If passed, will be used for editing or auto populating for the timesheet
   */
  invoice?: IInvoiceInput 
}

const InvoiceForm = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const loggedInUser = authVar();
  const [form] = Form.useForm();
  const [isSendInvoiceClicked, setIsSendInvoiceClicked] = useState(false);
  const [needProject, setNeedProject] = useState(true);
  const [searchParams, ] = useSearchParams();
  const period = searchParams.get('period');

  const company_id = loggedInUser?.company?.id as string
  const companyCode = loggedInUser?.company?.code as string

  useEffect(() => {
    if(!isNil(props.invoice?.needProject)) {
      setNeedProject(props.invoice?.needProject as boolean);
    }
  }, [props.invoice?.needProject])

  const [createInvoice, { loading: creatingInvoice }] = useMutation<
    GraphQLResponse<'InvoiceCreate', Invoice>,
    MutationInvoiceCreateArgs
  >(
    INVOICE_CREATE, {
      onCompleted(data) {
        if(data.InvoiceCreate) {
          message.success('Invoice created successfully');

          if(location?.state?.from === 'timesheet' && props.timesheet_id) {
            return navigate(routes.detailTimesheet.path(companyCode, props.timesheet_id));
          }

          navigate(routes.invoice.path(companyCode));
        }
      },
      onError: notifyGraphqlError,
    }
  );
  const [updateInvoice, { loading: updatingInvoice }] = useMutation<
    GraphQLResponse<'InvoiceUpdate', Invoice>,
    MutationInvoiceUpdateArgs
  >(
    INVOICE_UPDATE, {
      onCompleted(data) {
        if(data.InvoiceUpdate) {
          message.success('Invoice updated successfully');

          navigate(routes.invoice.path(companyCode));
        }
      },
      onError: notifyGraphqlError,
    }
  );

  const { data: projectData, loading: projectLoading } = useQuery<
    GraphQLResponse<'Project', ProjectPagingResult>,
    QueryProjectArgs
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

  const onNeedProjectChange = (e: CheckboxChangeEvent) => {
    setNeedProject(e.target.checked);
  }

  const invoice = props.invoice;
  const initialValues = {
    issueDate: moment(invoice?.issueDate),
    dueDate: moment(invoice?.dueDate),
    poNumber: invoice?.poNumber ?? '',
    totalAmount: invoice?.totalAmount ?? 0,
    subtotal: invoice?.subtotal ?? 0,
    taxPercent: invoice?.taxPercent ?? 0,
    taxAmount: invoice?.taxAmount ?? 0,
    discount: invoice?.discount ?? 0,
    discountAmount: invoice?.discountAmount ?? 0,
    notes: invoice?.notes ?? '',
    totalQuantity: invoice?.totalQuantity ?? 0,
    needProject: invoice?.needProject ?? needProject,
    shipping: invoice?.shipping ?? 0,
    items: invoice?.items?.map((item) => ({
      id: item.id,
      project_id: item.project_id,
      description: item.description || '',
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })) ?? [{
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0,
    }],
  }


  const onHourRateChange = (index: number) => {
    let { items, totalAmount, taxPercent = 0, taxAmount = 0, discount = 0, discountAmount = 0, shipping = 0 } = form.getFieldsValue();

    const quantity = items?.[index]?.quantity;
    const rate = items?.[index]?.rate;

    if(quantity && rate) {
      items[index].amount = round(quantity * rate, 2);

      const subtotal = items.reduce((acc: number, current: any) => {
        return acc + current.amount;
      }, 0) 

      const totalQuantity= items.reduce((acc: number, current: any) => {
        return acc + current.quantity;
      }, 0) 

      totalAmount = subtotal;

      if(discount >= 0) {
        discountAmount = discount * 0.01 * subtotal;
        totalAmount = subtotal - discountAmount;
      }

      if(taxPercent >= 0) {
        taxAmount = taxPercent * 0.01 * totalAmount;
        totalAmount += taxAmount;
      }

      if(shipping >= 0) {
        totalAmount += shipping;
      }

      form.setFieldsValue({
        items,
        totalQuantity,
        subtotal: round(subtotal, 2),
        taxAmount: round(taxAmount, 2),
        discountAmount: round(discountAmount, 2),
        totalAmount: round(totalAmount, 2),
      });
    }
  }

  const onItemRowRemove = (index: number, remove: (key: number) => void) => {
    let { items, totalQuantity, totalAmount, subtotal, taxPercent = 0, taxAmount = 0, discount = 0, discountAmount = 0, shipping = 0 }= form.getFieldsValue();

    const quantity = items?.[index]?.quantity ?? 0;
    const amount = items?.[index]?.amount ?? 0;

    subtotal -= amount;
    totalQuantity -= quantity;
    totalAmount -= amount;

    if(discount >= 0) {
      discountAmount = discount * 0.01 * subtotal;
      totalAmount = subtotal - discountAmount;
    }

    if(taxPercent >= 0) {
      taxAmount = taxPercent * 0.01 * totalAmount;
      totalAmount += taxAmount;
    }

    if(shipping >= 0) {
      totalAmount += shipping;
    }

    form.setFieldsValue({
      totalQuantity,
      subtotal: round(subtotal, 2),
      discountAmount: round(discountAmount, 2),
      taxAmount: round(taxAmount, 2),
      totalAmount: round(totalAmount, 2),
    });

    remove(index);
  }

  const onTaxPercentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const subtotal = form.getFieldValue('subtotal') 
    const discountAmount = parseFloat(form.getFieldValue('discountAmount') || 0) 
    const value = parseFloat(e.target.value || '0');
    const subtotalWithDiscount = subtotal - discountAmount;

    if(value >= 0) {
      const taxAmount = value * 0.01 * (subtotalWithDiscount);
      const totalAmount = (1 + value * 0.01) * subtotalWithDiscount;
      form.setFieldsValue({
        totalAmount: round(totalAmount, 2),
        taxAmount: round(taxAmount, 2),
      });
    }
  }

  const onDiscountPercentChange = (e: ChangeEvent<HTMLInputElement>) => {
    const subtotal = form.getFieldValue('subtotal') 
    const value = parseFloat(e.target.value || '0');
    const taxPercent = parseFloat(form.getFieldValue('taxPercent') || 0);

    if(value >= 0) {
      const discount = value * 0.01 * subtotal;
      let totalAmount = subtotal - discount;
      const taxAmount = taxPercent * 0.01 * totalAmount;
      totalAmount += taxAmount;
      form.setFieldsValue({
        discountAmount: round(discount, 2),
        totalAmount: round(totalAmount, 2),
        taxAmount: round(taxAmount, 2),
      });
    }
  }

  const onShippingChange = (e: ChangeEvent<HTMLInputElement>) => {
    const subtotal = form.getFieldValue('subtotal') 
    const discountAmount = parseFloat(form.getFieldValue('discountAmount') || 0) 
    const taxAmount = parseFloat(form.getFieldValue('taxAmount') || 0) 
    const value = parseFloat(e.target.value || '0');

    if(value >= 0) {
      const totalAmount = subtotal - discountAmount + taxAmount;
      form.setFieldsValue({
        totalAmount: round(totalAmount + value, 2),
      });
    }
  }

  const onSubmit = (values: any) => {
    const commonData = {
      company_id,
      poNumber: values.poNumber,
      issueDate: values.issueDate?.toISOString(),
      dueDate: values.dueDate?.toISOString(),
      notes: values.notes,
      taxPercent: parseFloat(values.taxPercent),
      taxAmount: parseFloat(values.taxAmount),
      totalAmount: parseFloat(values.totalAmount),
      subtotal: parseFloat(values.subtotal),
      totalQuantity: values.totalQuantity,
      discount: parseFloat(values.discount),
      needProject: values.needProject,
      shipping: parseFloat(values.shipping || 0)
    };

    if(props.invoice?.id) {
      const input: InvoiceUpdateInput = {
        id: props.invoice.id,
        ...commonData,
        items: values.items.map((item: any) => ({
          id: item.id,
          project_id: item.project_id || null,
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
        })),
      };

      if(values.status) {
        input.status = values.status
      }

      updateInvoice({
        variables: {
          input,
        }
      }).finally(() => {
        setIsSendInvoiceClicked(false)
      });

    } else {
      const input: InvoiceCreateInput = {
        ...commonData,
        client_id: props.client_id,
        items: values.items.map((item: any) => ({
          project_id: item.project_id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          amount: parseFloat(item.amount),
        })),
      }; 

      if(props.user_id) {
        input.user_id = props.user_id;
      }
      if(props.startDate) {
        input.startDate = props.startDate;
      }
      if(props.endDate) {
        input.endDate = props.endDate;
      }

      if(values.status) {
        input.status = values.status
      }

      if(props.timesheet_id) {
        input['timesheet_id'] = props.timesheet_id;
      }

      createInvoice({
        variables: {
          input,
        }
      }).finally(() => {
        setIsSendInvoiceClicked(false)
      });

    }
  } 

  const saveAndSend = () => {
    setIsSendInvoiceClicked(true);
    const values = form.getFieldsValue();
    values.status = 'Sent';
    onSubmit(values);
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
      className={styles['invoice-form']}
    >
      <Row gutter={24}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            label="Invoice Number"
          >
            <Popover content="Invoice number will be auto generated" >
              <div>
                <Input 
                  placeholder="Invoice Number" 
                  value={invoice?.invoiceNumber} 
                  disabled
                />
              </div>
            </Popover>
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <Form.Item
            name="issueDate"
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
            name="dueDate"
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
          >
            <Input placeholder="Enter PO Number" autoComplete="off" />
          </Form.Item>

        </Col>
      </Row>

      {
        !period && (
          <Row gutter={24}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="needProject"
                valuePropName="checked"
              >
                <Checkbox onChange={onNeedProjectChange}>
                  <h3>Need project for the invoice</h3>
                </Checkbox>
              </Form.Item>
            </Col>
          </Row>
        )
      }

      <div>
        <table className={styles['items-table']}>
          <thead>
            <tr>
              <th>Description</th>
              { needProject && <th></th> }
              <th>Quantity</th>
              <th>Rates</th>
              <th>Amount</th>
              <th></th>
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
                          {
                            needProject && (
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
                                  <Select placeholder="Select Project" loading={projectLoading} disabled={!!period}>
                                    {
                                      projectData?.Project?.data?.map((project) => (
                                        <Select.Option key={project.id} value={project.id}>{project.name}</Select.Option>
                                      ))
                                    }
                                  </Select>
                                </Form.Item>
                              </td>
                            )
                          }

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'description']}
                              {...restField}
                            >
                              <Input />
                            </Form.Item>
                          </td>

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'quantity']}
                              rules={[{
                                required: true,
                                message: 'Please enter quantity'
                              }]}
                              {...restField}
                            >
                              <InputNumber min={0} autoComplete="off" onChange={() => onHourRateChange(name)} />
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
                              <Input type="number" prefix="$" min={0} autoComplete="off" onChange={() => onHourRateChange(name)} />
                            </Form.Item>
                          </td>

                          <td>
                            <Form.Item
                              className={styles['td-input']}
                              name={[name, 'amount']}
                              {...restField}
                            >
                              <Input type="number" prefix="$" disabled placeholder="Total Amount" autoComplete="off" />
                            </Form.Item>
                          </td>

                          {
                            !period && (
                              <td>
                                <CloseCircleOutlined 
                                  className={styles['remove-icon']} 
                                  onClick={() => onItemRowRemove(name, remove)}
                                />
                              </td>
                            )
                          }

                        </tr>
                      ))
                    }

                    {
                      !period && (
                        <tr>
                          <td>
                            <Form.Item>
                              <div 
                                className={styles['add-project']} 
                                onClick={() => add({
                                  project_id: undefined,
                                  quantity: 0,
                                  rate: 0,
                                  amount: 0,
                                })}
                              >
                                <Image width={20} src={addIcon} preview={false} />
                                &nbsp; &nbsp; Add Item 
                              </div>
                            </Form.Item>
                          </td>
                        </tr>
                      )
                    }

                    <tr>
                      <td className={styles['horizontal']} colSpan={needProject ? 5 : 4}></td>
                    </tr>

                  </tbody>
                </>
              )
            }}
          </Form.List>

          <tfoot>
            <tr>

              <td colSpan={needProject ? 2 : 1}>
              </td>

              <td>
                <Form.Item 
                  name="totalQuantity" 
                  className={styles['td-input']}
                  label="Total Quantity"
                >
                  <InputNumber disabled placeholder="Total Quantity" />
                </Form.Item>
              </td>

              <td></td>

              <td>
                <Form.Item 
                  name="subtotal" 
                  className={styles['td-input']}
                  label="Sub Total"
                >
                  <Input type="number" prefix="$" disabled />
                </Form.Item>
              </td>

            </tr>

            <tr>
              <td colSpan={ needProject ? 3 : 2 }></td>

              <td>
                <Form.Item 
                  name="discount" 
                  className={styles['td-input']}
                  label="Discount Percentage"
                >
                  <Input type="number" placeholder="Enter Discount %" onChange={onDiscountPercentChange} suffix="%" />
                </Form.Item>
              </td>

              <td>
                <Form.Item 
                  className={styles['td-input']}
                  label="Discount Amount"
                  name="discountAmount"
                >
                  <Input type="number" prefix="$" disabled />
                </Form.Item>
              </td>
            </tr>

            <tr>
              <td colSpan={ needProject ? 3 : 2 }></td>

              <td>
                <Form.Item 
                  name="taxPercent" 
                  className={styles['td-input']}
                  label="Tax Percentage"
                >
                  <Input type="number" placeholder="Enter Tax %" onChange={onTaxPercentChange} suffix="%" />
                </Form.Item>
              </td>

              <td>
                <Form.Item 
                  name="taxAmount" 
                  className={styles['td-input']}
                  label="Tax Amount"
                >
                  <Input type="number" prefix="$" disabled />
                </Form.Item>
              </td>
            </tr>

            <tr>
              <td colSpan={ needProject ? 4 : 3 }></td>

              <td>
                <Form.Item 
                  className={styles['td-input']}
                  label="Shipping"
                  name="shipping"
                >
                  <Input type="number" prefix="$" onChange={onShippingChange} />
                </Form.Item>
              </td>
            </tr>


            <tr>
              <td className={styles['horizontal']} colSpan={ needProject ? 5 : 4 }></td>
            </tr>

            <tr>
              { needProject && <td></td> }
              <td></td>
              <td></td>
              <td> </td>
              <td>
                <Form.Item 
                  name="totalAmount" 
                  className={styles['td-input']}
                  label="Total Amount"
                >
                  <Input type="number" prefix="$" disabled />
                </Form.Item>
              </td>
            </tr>

            <tr>
              <td colSpan={needProject ? 2 : 1}></td>
              <td colSpan={3}>
                <Form.Item
                  name='notes'
                  label="Notes"
                  className={styles['td-input']}
                >
                  <Input.TextArea rows={3} placeholder="Notes" autoComplete="off" />
                </Form.Item>

              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Row justify="end">
        <Space>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={!isSendInvoiceClicked && (creatingInvoice || updatingInvoice)}
          >
            Save and Exit
          </Button>

          <Button 
            type="primary" 
            loading={isSendInvoiceClicked && (creatingInvoice || updatingInvoice)}
            onClick={saveAndSend}
          >
            Send Invoice
          </Button>
        </Space>
      </Row>
    </Form>
  )
}

export default InvoiceForm
