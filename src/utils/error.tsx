import { message } from 'antd';
import { CloseCircleOutlined } from "@ant-design/icons";

export function notifyGraphqlError(err: any) {
  let error = err?.graphQLErrors?.[0] ?? err?.networkError?.result?.errors?.[0];

  message.error(
    {content:  <div>
        {error?.message ?? 'Whoops! Something happened. Please try again!'}
        {error?.details?.map((e: string, index: number) => (
          <div style={{ display: 'block' }} key={index}>
          {e}
        </div>
        ))}
      </div>, duration: '5', icon:<div><CloseCircleOutlined/></div>}
  );
}

