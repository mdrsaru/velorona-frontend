import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { message, Dropdown, Menu, Table } from 'antd';
import {
  PlusCircleFilled,
  MoreOutlined,
} from '@ant-design/icons';

import { authVar } from '../../../../App/link';
import { notifyGraphqlError } from "../../../../utils/error";
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import { AttachedTimesheet, MutationAttachedTimesheetDeleteArgs } from '../../../../interfaces/generated';
import { ATTACHED_TIMESHEET_FIELDS } from '../../../../gql/timesheet.gql'

import ModalConfirm from '../../../../components/Modal';
import AttachNewTimesheetModal from '../../../../components/AddAttachedTimesheet';
import DeleteBody from '../../../../components/Delete/index';
import EditAttachedTimesheet from '../../../../components/EditAttachedTimesheet';
import ApprovedTimesheetAttachment from "../../../../components/ApprovedTimesheetAttachment";

import deleteImg from '../../../../assets/images/delete_btn.svg';
import styles from './style.module.scss';

export const ATTACHED_TIMESHEET = gql`
  ${ATTACHED_TIMESHEET_FIELDS}
  query AttachedTimesheet($input: AttachedTimesheetQueryInput!) {
    AttachedTimesheet(input: $input){
      data {
        ...attachedTimesheetFields
      }
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }     
    }
  }

`;

export const ATTACHED_TIMESHEET_DELETE = gql`
  mutation AttachedTimesheetDelete($input: DeleteInput!) {
    AttachedTimesheetDelete(input: $input) {
      id
    }
  }
`;

interface IProps {
  timesheet_id: string;
  isEmployee: boolean; 
}

const Attachments = (props: IProps) => {
  const authData = authVar()
  const [deleteVisibility, setDeleteVisibility] = useState<boolean>(false);
  const [attachedTimesheet, setAttachedTimesheet] = useState<any>()
  const [viewAttachment, setViewAttachment] = useState(false);
  const [attachedTimesheetAttachment, setAttachedTimesheetAttachment] = useState<any>();
  const [editAttachedVisibility, setEditAttachedVisibility] = useState<boolean>(false);
  const [showAttachTimeEntry, setAttachTimeEntry] = useState(false);
  const [fileData, setFile] = useState({
    id: "",
    name: "",
    url:""
  });
  

  const { data: attachedTimesheetData ,refetch:refetchAttachedTimesheet} = useQuery(ATTACHED_TIMESHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          timesheet_id: props.timesheet_id
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
    onCompleted(response){
      setFile({
        id:  response?.AttachedTimesheet?.data[0]?.attachments?.id,
        name: response?.AttachedTimesheet?.data[0]?.attachments?.name as string,
        url: response?.AttachedTimesheet?.data[0]?.attachments?.url as string,
      });
    }
  });

  const [attachedTimesheetDelete] = useMutation<GraphQLResponse<'AttachedTimesheetDelete', AttachedTimesheet>, MutationAttachedTimesheetDeleteArgs>(ATTACHED_TIMESHEET_DELETE, {
    onCompleted() {
      message.success({
        content: `Attached Timesheet is deleted successfully!`,
        className: "custom-message",
      });
      setDeleteVisibility(false);
    },
    onError(err) {
      setDeleteVisibility(false);
      notifyGraphqlError(err);
    },

    update(cache) {
      const normalizedId = cache.identify({ id: attachedTimesheet?.id, __typename: "AttachedTimesheet" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const deleteAttachedTimesheet = () => {
    attachedTimesheetDelete({
      variables: {
        input: {
          id: attachedTimesheet?.id
        }
      }
    })
  }

  const handleAttachmentView = (data: any) => {
    setViewAttachment(!viewAttachment);
    setAttachedTimesheetAttachment(data);
  }

  const attachNewTimesheet = () => {
    setAttachTimeEntry(!showAttachTimeEntry)
  }

  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="edit">
        <div onClick={() => {
          setEditAttachedVisibility(true);
          setAttachedTimesheet(data);
        }}>
          Edit Attachments
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4">
        <div onClick={() => {
          setDeleteVisibility(true);
          setAttachedTimesheet(data);
        }}
        >
          Delete Attachments
        </div>
      </Menu.Item>

    </Menu>
  );

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (date: any) => {
        return (
          <span>{date.split('T')?.[0]}</span>
        )
      }
    },
    {
      title: 'Attachment Type',
      dataIndex: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: (amount: any) => {
        return (
          <span>{amount ?? '-' }</span>
        )
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date: any) => {
        return (
          <span>{date?.split('T')?.[0] ?? '-' }</span>
        )
      }
    }, 
    {
      title: 'Attachment',
      key: 'attachments',
      dataIndex: 'attachments',
      render: (attachments: any) => {
        return (
          <span className={styles['table-attachment']}
            onClick={() => handleAttachmentView(attachments)}>
            {attachments?.name}
          </span>
        )
      }
    },
    {
      title: '',
      key: "actions",
      render: (attachedTimesheet: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          {props.isEmployee &&
            (<Dropdown
              overlay={menu(attachedTimesheet)}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
                style={{ paddingLeft: "1rem" }}
              >
                <MoreOutlined />
              </div>
            </Dropdown>
        )}
      </div>
      ),
    },
  ];


  return (
    <>
      <Table
        dataSource={attachedTimesheetData?.AttachedTimesheet?.data}
        columns={columns}
        pagination={false}
      />
      {
        props.isEmployee &&
        <>
          <p className={styles['attach-new-timesheet']} onClick={attachNewTimesheet}>
            <PlusCircleFilled />
            <span style={{ marginLeft: '1rem' }}> Add New Attachment
            </span>
          </p>
        </>
      }

      <AttachNewTimesheetModal
        visibility={showAttachTimeEntry}
        setVisibility={setAttachTimeEntry}
        timesheet_id={props.timesheet_id}
        refetch={refetchAttachedTimesheet} 
      />

      <EditAttachedTimesheet
        visibility={editAttachedVisibility}
        setVisibility={setEditAttachedVisibility}
        data={attachedTimesheet}
        setFile={setFile}
        fileData = {fileData}
        refetch= {refetchAttachedTimesheet}
      />

      <ApprovedTimesheetAttachment
        visible={viewAttachment}
        setVisible={setViewAttachment}
        attachment={attachedTimesheetAttachment}
      />

      <ModalConfirm
        visibility={deleteVisibility}
        setModalVisibility={setDeleteVisibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        closable
        modalBody={
          <DeleteBody
            title={
              <>
                Are you sure you want to delete it?{" "}
                {/* <strong> {project?.name}</strong> */}
              </>
            }
            subText={`All the data associated with this will be deleted permanently.`}
          />
        }
        onOkClick={deleteAttachedTimesheet}
      />
  </>
  )
}

export default Attachments;
