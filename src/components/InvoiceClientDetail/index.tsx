import { CloseCircleOutlined } from '@ant-design/icons';

import { Client } from '../../interfaces/generated';

import styles from './styles.module.scss';

interface Props {
  client: Client;
  removeCompany?: () => void;
  needCloseCompany?: boolean;
}

const InvoiceClientDetail = (props: Props) => {
  const client = props.client;

  return (
    <div className={styles['client-detail']}>
      <div className={styles['details']}>
        <p>Client</p>
        <b>{client?.name ?? ''}</b>
        <p>
          {client?.address?.streetAddress} <br />
          {client?.email}
        </p>
      </div>

      {
        props.needCloseCompany && (
          <div onClick={props.removeCompany}>
            <div className={styles['close-icon']}><CloseCircleOutlined /></div>
          </div>
        )
      }
    </div>

  );
}

export default InvoiceClientDetail;
