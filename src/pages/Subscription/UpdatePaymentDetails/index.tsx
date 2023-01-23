import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Form, Button, message } from 'antd';

import styles from '../style.module.scss'
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { useMutation, useQuery } from '@apollo/client';
import { CompanyPagingResult, MutationCompanyUpdateArgs, QueryCompanyArgs } from '../../../interfaces/generated';
import { ICompany } from '../../../interfaces/ICompany';
import { notifyGraphqlError } from '../../../utils/error';
import { COMPANY, COMPANY_UPDATE } from '../../Company';
import { collection_method } from '../../../config/constants';

interface IProps {
  clientSecret: string;
  hidePaymentUpdateModal: () => void;
  companyId:string;
}

const UpdatePaymentDetails = (props: IProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const {
    data: companyData,
  } = useQuery<GraphQLResponse<'Company', CompanyPagingResult>, QueryCompanyArgs>(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    variables: {
      input: {
        query: {
          id: props?.companyId,
        }
      },
    },
  });

  const [updateCompany] = useMutation<
    GraphQLResponse<'CompanyUpdate', ICompany>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted: (response) => {
      if (response?.CompanyUpdate) {
        message.success("The subscription has been successfully charged through automatic payments.")
      }
    },
    onError: notifyGraphqlError,
  })

  
  const onFinish = async () => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.log(error)
      } else {
        props.hidePaymentUpdateModal();
        window.location.reload()
        message.info({content:'The change will take some time to appear on Stripe.',duration: 15})
        
        // message.success('Payment details updated.')
      }
      updateCompany({
        variables: {
          input: {
            collectionMethod: collection_method?.[0]?.value,
            id: props.companyId
          }
        }
      })
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onFinish={onFinish} >
      <PaymentElement />
      <div className={styles['autopay-checkbox']}>
        {
          companyData?.Company?.data?.[0]?.collectionMethod !== collection_method?.[0]?.value &&
          <>
            <input type='checkbox' />  <span className={styles['autopay-title']}>You authorize regularly scheduled charges to your card.</span>
            <p className={styles['autopay-description']}>You will be charged the amount indicated in your invoice for each billing period until it is cancel.
              A receipt for each payment will be provided to you and the charge will appear on your card statement.
            </p>
          </>
        }
      </div>
      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>

    </Form>
  )
}

export default UpdatePaymentDetails;
