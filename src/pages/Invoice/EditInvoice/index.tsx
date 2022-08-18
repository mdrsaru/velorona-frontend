import { gql, useQuery } from '@apollo/client';
import { Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

import { authVar } from "../../../App/link";
import { QueryInvoiceArgs, InvoicePagingResult } from '../../../interfaces/generated';
import { IInvoiceInput, GraphQLResponse } from '../../../interfaces/graphql.interface';

import PageHeader from '../../../components/PageHeader';
import InvoiceForm from '../../../components/InvoiceForm';

import styles from './style.module.scss';

const INVOICE = gql`
  query Invoice($input: InvoiceQueryInput!) {
    Invoice(input: $input) {
      data {
        id
        timesheet_id
        client_id
        company_id
        issueDate
        dueDate 
        invoiceNumber
        poNumber
        notes
        subtotal
        taxPercent
        taxAmount
        totalAmount
        totalQuantity
        discount
        discountAmount
        needProject
        shipping
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
    GraphQLResponse<'Invoice', InvoicePagingResult>,
    QueryInvoiceArgs
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

  const invoice = invoiceData?.Invoice?.data?.[0];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title={<><ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Edit Invoice</>}
        />

        {
          !invoiceLoading  && (
            <InvoiceForm 
              timesheet_id={invoice?.timesheet_id as string}
              client_id={invoice?.client_id as string} 
              invoice={invoice as IInvoiceInput}
            />
          )
        }

      </Card>
    </div>
  )
}
export default EditInvoice
