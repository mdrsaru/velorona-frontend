import React, {useState} from "react";
import { Button, Card, Col, Form, Input, Row, Select, Image } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import addIcon from "../../../assets/images/add_icon.svg";

import { useNavigate } from "react-router-dom";

import styles from "../style.module.scss";


const NewInvoice = () => {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [form] = Form.useForm();
  const [companyForm] = Form.useForm();
  const { Option } = Select;

  return(
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['invoice-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add Invoice</h1>
          </Col>
        </Row>
        {!confirm &&
          <Form form={companyForm} layout="vertical" onFinish={() => {setConfirm(true)}}>
            <Row>
              <Col xs={24} sm={24} md={18} lg={18} className={styles.formCol}>
                <Form.Item name="company" label="Add Company">
                  <Select placeholder="Select Company for invoice">
                    <Option value="Employee">Employee</Option>
                    <Option value="TaskManager">Task Manager</Option>
                    <Option value="Vendor">Vendor</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={6} lg={6} className={styles.formColBtn}>
                <Form.Item>
                  <Button type="primary" htmlType="submit">Confirm</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
        <Form form={form} layout="vertical">
          {confirm &&
              <Row>
                <Col span={24} className={styles.formCol}>
                  <div className={styles['client-detail']}>
                   <div className={styles['details']}>
                     <p>Client</p>
                     <b>Araniko College of Business and Technology</b>
                     <p>
                       1245 Alpine Avenue <br/>
                       contact@aranikocollege.com
                     </p>
                   </div>
                    <div className={styles['close-option']} onClick={() => setConfirm(false)}>
                      <div className={styles['close-icon']}><CloseCircleOutlined /></div>
                    </div>
                  </div>
                </Col>
              </Row>}
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="schedule" label="Invoice Scheduled">
                <Select placeholder="Select Field">
                  <Option value="Employee">Employee</Option>
                  <Option value="TaskManager">Task Manager</Option>
                  <Option value="Vendor">Vendor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Invoice Payment" name='payment'>
                <Input placeholder="Select Field" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Invoice Rate" name='rate'>
                <Input placeholder="Enter invoice rate" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="PO Number" name='number' rules={[{ required: true, message: 'Please enter PO Number!' },
                {max: 10, message: "Phone number should be less than 10 digits"}]}>
                <Input placeholder="Enter PO Number" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row className={`${styles.formRow}`}>
            <Col xs={24} sm={24} md={9} lg={9}>
              <div className={`${styles.formHeader}`}>
                <p>Project Name</p>
              </div>
              <Form.Item name="project" className={styles['form-items']}>
                <Select placeholder="Select Project">
                  <Option value="Employee">Employee</Option>
                  <Option value="TaskManager">Task Manager</Option>
                  <Option value="Vendor">Vendor</Option>
                </Select>
              </Form.Item>
              <div className={styles['add-project']}>
                <Image width={20} src={addIcon} preview={false}/>
                &nbsp; &nbsp; Add Project
              </div>
              <br/> <br/>
              <Form.Item name='note' className={styles['form-item-note']}>
                <Input placeholder="Notes" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={5} lg={5}>
              <div className={`${styles.formHeader}`}>
                <p>Total Hour</p>
              </div>
              <Form.Item name='hour' className={styles['form-items']}>
                <Input placeholder="Total Hours" autoComplete="off"/>
              </Form.Item>
              <br/> <br/> <br/>
              <Form.Item name='hour' className={styles['form-items']} label={'Total Hours'}>
                <Input placeholder="Total Hours" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={5} lg={5}>
              <div className={`${styles.formHeader}`}>
                <p>Rates</p>
              </div>
              <Form.Item name='rate' className={styles['form-items']}>
                <Input placeholder="Total Rate" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={5} lg={5}>
              <div className={`${styles.formHeader}`}>
                <p>Amount</p>
              </div>
              <Form.Item name='amount' className={styles['form-items']}>
                <Input placeholder="Enter Amount" autoComplete="off"/>
              </Form.Item>
              <br/> <br/> <br/>
              <Form.Item name='amount' className={styles['form-items']} label={'Total Amount'}>
                <Input placeholder="Total Amount" autoComplete="off"/>
              </Form.Item>
              <Form.Item name='tax' className={styles['form-items']} label={'Tax %'}>
                <Input placeholder="Enter Tax Percent" autoComplete="off"/>
              </Form.Item>
              <br/><br/>
              <Form.Item name='sub-total' className={styles['form-items']} label={'SubTotal'}>
                <Input placeholder="Subtotal" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <br/>
          <Row justify="end">
            <Col>
              <Form.Item className={styles['form-items']}>
                <Button type="primary" htmlType="submit">Send Invoice</Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
export default NewInvoice
