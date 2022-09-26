import { Button, Select, DatePicker, Space } from 'antd';
 
import Label from '../../../../components/Label';
import { User } from '../../../../interfaces/generated';

import styles from './style.module.scss';

interface IProps {
  loading: boolean;
  employees: User[];
  employeeLoading: boolean;
  isFilterApplied: boolean;
  onUserChange: (value: string) => void;
  onDateRangeChange: (values: any) => void;
  applyFilter: () => void;
  cancelFilter: () => void;
}

const CustomFilter = (props: IProps) => {
  const employees = props.employees;

  return (
    <>
      <div className={styles['form-item']}>
        <Label label="Select employee" />
        <Select 
          loading={props.employeeLoading}
          disabled={props.isFilterApplied}
          placeholder="Select employee"
          onChange={props.onUserChange}
        >
          {
            employees?.map((user: any) => (
              <Select.Option key={user.id} value={user.id}>
                {user.fullName} - {user.email}
              </Select.Option>
            ))
          }
        </Select>
      </div>

      <div className={styles['form-item']}>
        <Label label="Select date range" />
        <DatePicker.RangePicker 
          disabled={props.isFilterApplied}
          onChange={props.onDateRangeChange}
        />
      </div>

      <div className={styles['form-item']}>
        <Space>
          <Button 
            loading={props.loading}
            disabled={props.isFilterApplied}
            type="primary" 
            onClick={props.applyFilter}
          >
            Apply Filter
          </Button>

          <>
            {
              props.isFilterApplied && (
                <Button 
                  onClick={props.cancelFilter}
                >
                  Cancel
                </Button>
              )
            }
          </>
        </Space>
      </div>
    </>
  )
}

export default CustomFilter;
