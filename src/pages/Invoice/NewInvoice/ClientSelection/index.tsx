import { Button, Select } from 'antd';

import { Client } from '../../../../interfaces/generated';

import Label from '../../../../components/Label';

import styles from './style.module.scss';

interface IProps {
  disabled: boolean;
  clients: Client[];
  onClientChange: (value: string) => void;
  confirmCompany: () => void;
}

const ClientSelection = (props: IProps) => {
  return (
    <div className={styles['client-selection-wrapper']}>
      <div className={styles['select-client']}>
        <Label label="Add Client" />
        <Select 
          placeholder="Select client for invoice"
          onChange={props.onClientChange}
        >
          {
            props.clients.map((client) => (
              <Select.Option key={client.id} value={client.id}>{client.name}</Select.Option>
            ))
          }
        </Select>
      </div>

      <div className={styles['confirm-client']}>
        <Button 
          type="primary" 
          disabled={props.disabled}
          onClick={props.confirmCompany}
        >
          Confirm
        </Button>
      </div>
    </div>


  )
}

export default ClientSelection;
