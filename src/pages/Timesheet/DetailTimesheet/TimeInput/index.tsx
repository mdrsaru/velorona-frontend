import moment from 'moment';
import isNil from 'lodash/isNil';
import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Input, message, Modal, InputRef } from 'antd';

import { getTimeFormat, getDurationFromTimeFormat } from '../../../../utils/common';
import { TimeEntry, MutationTimeEntriesBulkUpdateArgs, Timesheet } from '../../../../interfaces/generated';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';

import NewTimeEntry from './NewTimeEntry'

const BULK_UPDATE = gql`
  mutation BulkUpdate($input: TimeEntryBulkUpdateInput!) {
    TimeEntriesBulkUpdate(input: $input)
  }
`;

interface IProps {
  status: string;
  date: string;
  project_id: string;
  entries: TimeEntry[];
  duration: number | undefined; // no time entry(ies) if duration is undefined
  timesheet_id: string;
  refetch: any;
  timesheet:Timesheet;
}

const TimeInput = (props: IProps) => {
  const _timeFormat = !isNil(props.duration) ? getTimeFormat(props.duration) : '-';
  const [timeFormat, setTimeFormat] = useState(_timeFormat);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const ref = useRef<InputRef>(null)

  const [bulkUpdate] = useMutation<
    GraphQLResponse<'TimeEntriesBulkUpdate', boolean>,
    MutationTimeEntriesBulkUpdateArgs
  >(BULK_UPDATE, {
    onCompleted(response) {
      if(response.TimeEntriesBulkUpdate) {
        message.success('Time entry updated')
        props.refetch().then(() => {
          setTimeFormat(getTimeFormat(props.duration))
        });
      }
    }
  })

  // Needed as props(props.duration) is being used for the managing the input state
  useEffect(() => {
    setTimeFormat((prev) => {
      if(prev !== _timeFormat) {
        return _timeFormat;
      }

      return prev;
    })
  }, [_timeFormat])

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTimeFormat(e.target.value);
  }

  const onClick = () => {
    if(isNil(props.duration)) {
      setShowEntryModal(true)
      ref.current?.blur();
    }
  }

  const onCancel = () => {
    setShowEntryModal(false);
  }

  const updateTimeEntry = () => {
    if(timeFormat === _timeFormat) {
      return;
    }

    const parsedTimeFormat = moment(timeFormat, 'HH:mm:ss').format('HH:mm:ss');
    const duration = getDurationFromTimeFormat(parsedTimeFormat)

    bulkUpdate({
      variables: {
        input: {
          date: props.date, 
          duration,
          project_id: props.project_id,
          timesheet_id: props.timesheet_id,
        }
      }
    })
  }

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if(e.key === 'Enter') {
      ref.current?.blur();
    }
  }

  return (
    <>
      <Input 
        ref={ref}
        value={timeFormat}
        onChange={onChange}
        onBlur={updateTimeEntry}
        onKeyPress={onKeyPress}
        onClick={onClick}
      />

      <Modal
        centered
        footer={null}
        destroyOnClose
        visible={showEntryModal}
        onCancel={onCancel}
        title={<h2>Add time entry</h2>}
      >
        <NewTimeEntry
          date={props.date}
          onHideModal={onCancel}
          project_id={props.project_id}
          timesheet_id={props.timesheet_id}
          refetch={props.refetch}
          timesheet = {props.timesheet}
        />
      </Modal>
    </>
  )

}

export default TimeInput;
