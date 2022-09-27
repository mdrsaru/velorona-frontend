import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { authVar } from '../../App/link';
import routes from '../../config/routes';
import { round } from '../../utils/common';
import { IInvoiceInput } from '../../interfaces/graphql.interface';
import {
  ClientPagingResult,
  ProjectItem,
  ProjectItemInput,
  ClientQueryInput,
} from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader';
import InvoiceClientDetail from '../../components/InvoiceClientDetail';
import InvoiceForm from '../../components/InvoiceForm';
import Loader from '../../components/Loader';

import styles from './style.module.scss';

type QueryInput = {
  clientInput: ClientQueryInput,
  projectItemInput: ProjectItemInput,
};

type Response = {
  Client: ClientPagingResult,
  ProjectItems: ProjectItem[],
};

const CLIENT_AND_PROJECT_ITEMS = gql`
  query ClientAndProjectItems(
    $clientInput: ClientQueryInput!,
    $projectItemInput: ProjectItemInput!
  ) {
    Client(input: $clientInput) {
      data {
        id
        name
        email
        invoicingEmail
        address {
          streetAddress
        }
      }
    }

    ProjectItems(input: $projectItemInput) {
      project_id
      totalExpense
      totalDuration
      totalHours
      hourlyRate
    }
  }
`

const TimesheetInvoice = (props: any) => {
  const authData = authVar();
  //const { timesheetId } = useParams();
  const [invoiceInput, setInvoiceInput] = useState<IInvoiceInput | undefined>();
  const company_id = authData.company?.id as string;
  const searchParams = useSearchParams()[0];

  const timesheetId = searchParams.get('timesheet_id') as string;
  const client_id = searchParams.get('client_id') as string;
  const user_id = searchParams.get('user_id') as string;
  const startDate = searchParams.get('start') as string;
  const endDate = searchParams.get('end') as string;

  const {
    data: clientProjectData,
    loading,
  } = useQuery<
    Response,
    QueryInput
  >(CLIENT_AND_PROJECT_ITEMS, {
    variables: {
      clientInput: {
        query: {
          company_id,
          id: client_id,
        }
      },
      projectItemInput: {
        startTime: startDate + ' 00:00:00',
        endTime: endDate + ' 23:59:59',
        company_id,
        user_id,
        client_id,
      }
    },
    onCompleted(response) {
      if(response.ProjectItems) {
        let totalAmount = 0;
        let totalQuantity = 0;

        const description = `${startDate} - ${endDate}`;

        const items = (response?.ProjectItems ?? []).map((item) => {
          const quantity = item.totalHours;
          totalAmount += item.totalExpense;
          totalQuantity += quantity;

          return {
            project_id: item.project_id,
            description,
            quantity: round(quantity, 6),
            rate: item.hourlyRate,
            amount: item.totalExpense,
          }
        })

        totalAmount = round(totalAmount, 2);

        const invoice: IInvoiceInput = {
          issueDate: new Date(), 
          dueDate: new Date(),
          needProject: true,
          poNumber: '',
          totalAmount,
          subtotal: totalAmount,
          taxPercent: 0,
          taxAmount: 0,
          discount: 0,
          discountAmount: 0,
          notes: '',
          totalQuantity: round(totalQuantity, 2),
          shipping: 0,
          items,
        }

        setInvoiceInput(invoice);
      }

    }
  })

  const client = clientProjectData?.Client?.data?.[0];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title={
            <>
              <Link to={routes.employeeTimesheet.path(company_id)}>
                <ArrowLeftOutlined /> 
              </Link>
              &nbsp; Add Invoice
            </>
          }
        />

        {
          loading && <Loader />
        }

        {
          !!client && (
            <>
              <InvoiceClientDetail client={client} />
              { 
                invoiceInput && (
                  <InvoiceForm 
                    timesheet_id={timesheetId} 
                    client_id={client.id}
                    invoice={invoiceInput} 
                    startDate={startDate}
                    endDate={endDate}
                    user_id={user_id}
                    invoicingEmail={client.invoicingEmail}
                  /> 
                )
              }
            </>
          )
        }


      </Card>
    </div>
  );
}

export default TimesheetInvoice;
