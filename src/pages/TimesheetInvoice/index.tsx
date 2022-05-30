import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Card } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { authVar } from '../../App/link';
import routes from '../../config/routes';
import { round } from '../../utils/common';
import { TimesheetPagingData, IInvoiceInput } from '../../interfaces/graphql.interface';
import { TimesheetQueryInput } from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader';
import InvoiceClientDetail from '../../components/InvoiceClientDetail';
import InvoiceForm from '../../components/InvoiceForm';

import styles from './style.module.scss';

const TIMESHEET = gql`
  query Timesheet($input: TimesheetQueryInput!) {
    Timesheet(input: $input) {
      data {
        id
        weekStartDate
        weekEndDate
        durationFormat
        totalExpense
        lastApprovedAt
        status
        user {
          fullName
        }
        client {
          id
          name
          email
          address {
            streetAddress
          }
        }
        projectItems {
          project_id
          totalExpense
          totalDuration
          totalHours
          hourlyRate
        }
      }
    }
  }
`;

const TimesheetInvoice = () => {
  const authData = authVar();
  const { timesheetId } = useParams();
  const [invoiceInput, setInvoiceInput] = useState<IInvoiceInput | undefined>();
  const company_id = authData.company?.id as string;

  const {
    data: timesheetData,
  } = useQuery<TimesheetPagingData, { input: TimesheetQueryInput }>(
    TIMESHEET, {
      fetchPolicy: 'cache-first',
      variables: {
        input: {
          query: {
            company_id,
            id: timesheetId,
          },
        },
      },
      onCompleted(response) {
        const timesheet = response?.Timesheet?.data?.[0];
        if(timesheet) {
          let totalAmount = 0;
          let totalQuantity = 0;
          const description = `${timesheet.weekStartDate} - ${timesheet.weekEndDate}`;

          const items = (timesheet?.projectItems ?? []).map((item) => {
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
            poNumber: '',
            totalAmount,
            subtotal: totalAmount,
            taxPercent: 0,
            notes: '',
            totalQuantity: round(totalQuantity, 2),
            items,
          }

          setInvoiceInput(invoice);
        }
      }
    },
  );

  const timesheet = timesheetData?.Timesheet?.data?.[0];

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
          !!timesheet?.client && (
            <>
              <InvoiceClientDetail client={timesheet.client} />
              { invoiceInput && <InvoiceForm client_id={timesheet.client.id} invoice={invoiceInput} /> }
            </>
          )
        }


      </Card>
    </div>
  );
}

export default TimesheetInvoice;
