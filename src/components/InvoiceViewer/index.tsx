import { useQuery, gql } from '@apollo/client'
import { Document, Page, pdfjs } from 'react-pdf';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { QueryInvoicePdfArgs } from '../../interfaces/generated';
import { authVar } from '../../App/link';

import Loader from '../../components/Loader';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const INVOICE_PDF = gql`
  query($input: InvoicePDFInput!) {
    InvoicePDF(input: $input) 
  }
`;

interface IProps {
  id: string;
}

function InvoiceViewer(props: IProps) {
  const authData = authVar();
  const company_id = authData?.company?.id as string;

  const { data: InvoicePDFData, loading } = useQuery<
    GraphQLResponse<'InvoicePDF', string>, 
    QueryInvoicePdfArgs
  >(INVOICE_PDF, {
    variables: {
      input: {
        company_id,
        id: props.id
      },
    },
  });

  if(loading) {
    return <Loader />
  }

  if(!InvoicePDFData?.InvoicePDF) {
    return null;
  }

  return (
    <Document 
      file={`data:application/pdf;base64,${InvoicePDFData.InvoicePDF}`}
      onLoadError={console.log}
    >
      <Page pageNumber={1} scale={1.5} />
    </Document>
  );
}

export default InvoiceViewer;
