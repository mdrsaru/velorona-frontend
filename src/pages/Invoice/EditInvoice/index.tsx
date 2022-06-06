import { gql, useQuery } from '@apollo/client';
import { Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { authVar } from "../../../App/link";
import { InvoiceQueryInput } from '../../../interfaces/generated';
import PageHeader from '../../../components/PageHeader';
import InvoiceForm from '../../../components/InvoiceForm';

import { InvoicePagingData } from '../../../interfaces/graphql.interface';

import styles from './style.module.scss';

const INVOICE = gql`
  query Invoice($input: InvoiceQueryInput!) {
    Invoice(input: $input) {
      data {
        id
        client_id
        company_id
        issueDate
        dueDate 
        invoiceNumber
        poNumber
        notes
        subtotal
        taxPercent
        totalAmount
        totalQuantity
        items {
          id
          quantity
          rate
          amount
          project_id
          description
        }
      }
    }
  }
`;

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const loggedInUser = authVar();
  const company_id = loggedInUser?.company?.id as string;

  const { data: invoiceData, loading: invoiceLoading } = useQuery<
    InvoicePagingData,
    {
      input: InvoiceQueryInput,
    }
  >(INVOICE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id,
          id,
        },
      },
    },
  });

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title={<><ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Edit Invoice</>}
        />

        {
          !invoiceLoading  && (
            <InvoiceForm 
              client_id={invoiceData?.Invoice?.data?.[0]?.client_id as string} 
              invoice={invoiceData?.Invoice?.data?.[0]}
            />
          )
        }

      </Card>
    </div>
  )
}
export default EditInvoice
