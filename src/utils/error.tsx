import { message } from 'antd';
import { CloseCircleOutlined } from "@ant-design/icons";

export function notifyGraphqlError(err: any, key?: string) {
  let error = err?.graphQLErrors?.[0] ?? err?.networkError?.result?.errors?.[0];

  message.error({
    key: key ?? '',
    content: (
      <div>
        {
          error?.details 
            ? error?.details?.map((detail: string, index: number) => (
              <div style={{ display: 'block' }} key={index}>
                {detail}
              </div>
            )) 
            : error?.message ?? 'Whoops! Something happened. Please try again!'
        }
      </div>
    ), 
    duration: '5',
    icon:<div><CloseCircleOutlined/></div>
  });
}

