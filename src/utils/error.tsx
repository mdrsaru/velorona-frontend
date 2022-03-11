import { message } from 'antd';

export function notifyGraphqlError(err: any) {
  let error = err?.graphQLErrors?.[0] ?? err?.networkError?.result?.errors?.[0];

  message.error(
    <>
      {error?.message ?? 'Whoops! Something happened. Please try again!'}
      {error?.details?.map((e: string, index: number) => (
        <span style={{ display: 'block' }} key={index}>
          {e}
        </span>
      ))}
    </>
  );
}

