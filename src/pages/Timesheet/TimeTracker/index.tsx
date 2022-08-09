import { Card, Col, Collapse, Form, Input, message, Row, Select } from "antd"
import { useMemo, useState } from "react"
import { authVar } from "../../../App/link"
import TimeEntry from "../TimeEntry"
import { TimeEntryPagingResult, TimeEntry as ITimeEntry, EntryType } from '../../../interfaces/generated';


import styles from '../style.module.scss'
import TimerCard from "../../../components/TimerCard";
import { useStopwatch } from "react-timer-hook";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { useMutation, useQuery } from "@apollo/client";
import moment from "moment";
import { computeDiff, CREATE_TIME_ENTRY, TIME_ENTRY, TIME_WEEKLY } from "..";
import { PROJECT } from "../../Project";
import { UPDATE_TIME_ENTRY } from "../EditTimesheet";
import NoContent from "../../../components/NoContent";
import { notifyGraphqlError } from "../../../utils/error";
import { findIndex } from "lodash";
import _ from "lodash";


type ITodayGroupedEntries = {
	description: string | null | undefined;
	project_id: string;
	entries: ITimeEntry[];
};


const { Panel } = Collapse;

export const getTotalTimeForADay = (entries: any) => {
	let sum = 0;
	if (entries) {
		const durations = entries.map((data: any) => data?.duration)
		sum = durations.reduce((entry1: any, entry2: any) => {
			return entry1 + entry2;
		}, 0);
	};
	return sum
}

const TimeTracker = () => {

	const { Option } = Select
	const authData = authVar()
	const [form] = Form.useForm()

	const [timeEntryForm] = Form.useForm()
	let stopwatchOffset = new Date()

	const company_id = authData?.company?.id;
	const entryType = authData?.user?.entryType;
	const afterStart = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');


	const [showDetailTimeEntry, setDetailVisible] = useState<boolean>(false)
	const {
		seconds,
		minutes,
		hours,
		isRunning,
		reset
	} = useStopwatch({
		autoStart: showDetailTimeEntry,
		offsetTimestamp: new Date()
	});

	const [newTimeEntry, setTimeEntry] = useState({
		id: '',
		name: '',
		project: '',
		description: '',
		client: ''
	});

	/* eslint-disable no-template-curly-in-string */
	const validateMessages = {
		required: '${label} is required!',
		types: {
			email: '${label} is not a valid email!',
			number: '${label} is not a valid number!',
		},
		number: {
			range: '${label} must be between ${min} and ${max}',
		},
	};

	const startTimer = (id: string, date: string) => {
		const offset = new Date();
		const now = moment();
		const diff = now.diff(moment(date), 'seconds');
		const time = offset.setSeconds(offset.getSeconds() + diff)
		reset(new Date(time))
	}

	const {  data: timeEntryData } = useQuery<GraphQLResponse<'TimeEntry', TimeEntryPagingResult>>(TIME_ENTRY, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				query: {
					company_id,
					afterStart,
					entryType,
				},
				paging: {
					order: ['startTime:DESC']
				}
			}
		},
		onCompleted: (timeEntry) => {
			if (timeEntry?.TimeEntry?.activeEntry) {
				setDetailVisible(true)
				stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + computeDiff(timeEntry?.TimeEntry?.activeEntry?.startTime))
				setTimeEntry({
					id: timeEntry?.TimeEntry?.activeEntry?.id,
					name: timeEntry?.TimeEntry?.activeEntry?.company?.name,
					project: timeEntry?.TimeEntry?.activeEntry?.project?.name,
					description: timeEntry?.TimeEntry?.activeEntry?.description ?? '',
					client: timeEntry?.TimeEntry?.activeEntry?.project?.client?.name
				})
				// reset(stopwatchOffset)
				if (timeEntry.TimeEntry.activeEntry) {
					let startTime = timeEntry.TimeEntry.activeEntry?.startTime;
					if (startTime) {
						startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss');
						startTimer(timeEntry.TimeEntry.activeEntry.id, startTime);
					}
				}
			}
		},
	});

	const { data: projectData } = useQuery(PROJECT, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				query: {
					company_id,
					client_id: '',
					user_id:authData.user.id
				},
				paging: {
					order: ['updatedAt:DESC']
				}
			}
		}
	});

	const {
		refetch: refetchTimeWeekly 
	  } = useQuery(TIME_WEEKLY, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
		  input: {
			query: {
			  company_id,
			},
			paging: {
			  order: ['weekStartDate:DESC']
			}
		  }
		}
	  });
	  
	const todayGroupedEntries: ITodayGroupedEntries[] = useMemo(() => {
		const entries = timeEntryData?.TimeEntry?.data ?? [];
		return groupByDescriptionAndProject(entries)
	}, [timeEntryData?.TimeEntry?.data]);

	const [createTimeEntry, { loading: creatingTimeEntry }] = useMutation(CREATE_TIME_ENTRY, {
		onCompleted: (response: any) => {
			// start();
			const id = response.TimeEntryCreate.id;
			let startTime = response.TimeEntryCreate.startTime;
			startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss')
			startTimer(id, startTime);

			setTimeEntry({
				id: response?.TimeEntryCreate?.id,
				name: response?.TimeEntryCreate?.company?.name,
				project: response?.TimeEntryCreate?.project?.name,
				description: response?.TimeEntryCreate?.description,
				client: response?.TimeEntryCreate?.project?.client?.name
			});
			setDetailVisible(true)
		}
	});

	const [updateTimeEntry, { loading: updatingTimeEntry }] = useMutation(UPDATE_TIME_ENTRY, {
		update: (cache, result: any) => {
			const data: any = cache.readQuery({
				query: TIME_ENTRY,
				variables: {
					input: {
						query: {
							company_id,
							afterStart,
							entryType,
						},
						paging: {
							order: ['startTime:DESC']
						}
					}
				},
			});

			const entries = data?.TimeEntry?.data ?? [];
			const newEntry = result.data.TimeEntryUpdate;

			cache.writeQuery({
				query: TIME_ENTRY,
				variables: {
					input: {
						query: {
							company_id,
							entryType,
							afterStart,
						},
						paging: {
							order: ['startTime:DESC']
						}
					}
				},
				data: {
					TimeEntry: {
						activeEntry: null,
						data: [...entries, newEntry]
					}
				}
			});
		},
		onCompleted: () => {
			reset(undefined, false)
			setDetailVisible(false);
			refetchTimeWeekly({
				input: {
					query: {
						company_id,
					},
					paging: {
						order: ['weekStartDate:DESC']
					}
				}
			})
			form.resetFields();
			message.success({
				content: `Time Entry is updated successfully!`,
				className: 'custom-message'
			});
		},
		onError: notifyGraphqlError,
	});


	const createTimeEntries = (values: any) => {
		stopwatchOffset = new Date()
		createTimeEntry({
			variables: {
				input: {
					startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
					description: values.description,
					project_id: values.project,
					company_id,
				}
			}
		}).then((response) => {
			if (response.errors) {
				return notifyGraphqlError((response.errors))
			}
		}).catch(notifyGraphqlError)
	}

	const submitStopTimer = () => {
		stopwatchOffset = new Date()
		updateTimeEntry({
			variables: {
				input: {
					id: newTimeEntry?.id,
					endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
					company_id,
				}
			}
		})
	}


	const getStartTime = (entries: any): any => {
		const minStartDate = entries.map((entry: any) => { return entry?.startTime })
		return _.min(minStartDate)
	}

	const getEndTime = (entries: any): any => {
		const maxEndDate = entries.map((entry: any) => { return entry?.endTime })
		return _.max(maxEndDate)
	}

	const clickPlayButton = (entry: ITimeEntry) => {
		form.resetFields()
		!isRunning ? createTimeEntries({ description: entry.description, project: entry?.project?.id }) : submitStopTimer();
	}

	const onSubmitForm = (values: any) => {
		!isRunning ? createTimeEntries(values) : submitStopTimer();
	}
	return (
		<>
			{
				authData?.user?.entryType !== 'CICO' && (
					<Card
						bordered={false}
						className={styles['form-row']}>
						<Form
							form={form}
							layout="vertical"
							onFinish={onSubmitForm}>

							{showDetailTimeEntry ?
								<Row>
									<Col className={styles['form-col-header']} xs={24} sm={24} md={12} lg={12}>
										<b>
											<span>
												{newTimeEntry?.name ?? timeEntryData?.TimeEntry?.activeEntry?.description}
											</span> :
											&nbsp;
											{newTimeEntry?.project ?? timeEntryData?.TimeEntry?.activeEntry?.project?.name}
										</b>
									</Col>
								</Row> :
								<Row>
									<Col className={styles['form-col']} xs={24} sm={24} md={12} lg={12}>
										<Form.Item
											name="project"
											label="Project"
											rules={[{
												required: true,
												message: 'Choose the project'
											}]}>
											<Select
												placeholder="Select Project"
											>
												{
													projectData && projectData?.Project?.data.map((project: any, index: number) => (
														<Option
															value={project?.id}
															key={index}>
															{project?.name}
														</Option>
													))
												}
											</Select>
										</Form.Item>
									</Col>
								</Row>}

							<Row>
								<Col className={styles['description-col']} xs={24} sm={24} md={12} lg={12} xl={16}>
									<Form.Item
										name="description"
										label="Description"
										rules={[{
											required: !showDetailTimeEntry,
											message: 'Description is required'
										}]}
									>
										{
											showDetailTimeEntry ? (
												<div className={styles['timesheet-description']}>
													{newTimeEntry?.description}
												</div>
											) : <Input />
										}
									</Form.Item>
								</Col>
								<Col className={styles['time-start-col']} xs={24} sm={24} md={12} lg={12} xl={8}>
									<TimerCard
										hours={hours}
										minutes={minutes}
										seconds={seconds}
										isRunning={isRunning}
										disabled={creatingTimeEntry ?? updatingTimeEntry}
									/>
								</Col>
							</Row>
						</Form>
					</Card>
				)
			}

			<br />

			{/* Today's TimeEntries Listing */}
			<Card
				bordered={false}
				className={styles['task-card']}>
				<Row>
					<Col
						xs={24}
						sm={24}
						md={12}
						lg={12}
						className={styles['form-col']}>
						<span className={styles['date-view']}>
							{moment(new Date()).format('LL')}
						</span>
					</Col>
				</Row>
				<Row className={styles['task-div-header']}>
					{
						entryType !== EntryType.Cico && (
							<Col
								xs={24}
								sm={24}
								md={6}
								lg={6}
								xl={6}
								className={styles['task-header']}
							>
								Description
							</Col>
						)
					}
					<Col
						xs={0}
						sm={0}
						md={entryType !== EntryType.Cico ? 7 : 13}
						lg={entryType !== EntryType.Cico ? 7 : 13}
						xl={entryType !== EntryType.Cico ? 7 : 13}
						className={styles['client-header']}>
						Client: Project
					</Col>
					<Col
						xs={0}
						sm={0}
						md={3}
						lg={3}
						xl={3}
						className={styles['start-header']}>
						Start Time
					</Col>
					<Col
						xs={0}
						sm={0}
						md={3}
						lg={3}
						xl={3}
						className={styles['end-header']}>
						End Time
					</Col>
					<Col
						xs={0}
						sm={0}
						md={3}
						lg={3}
						xl={3}
						className={styles['total-header']}>
						Total
					</Col>
					<Col
						xs={0}
						sm={0}
						md={2}
						lg={2}
						xl={2}></Col>
				</Row>

				{timeEntryData?.TimeEntry?.data?.length === 0
					&&
					<NoContent
						title='Time entry Not Added!'
						subtitle='There are no entries added at the moment' />}

				<Form
					form={timeEntryForm}
					validateMessages={validateMessages}
				>
					<div className={styles['task-row']}>
						{
							todayGroupedEntries.map((groupedEntry, index: number) => (
								groupedEntry.entries.length > 1 ? (
									<Collapse
										ghost
										key={`${groupedEntry.project_id} - ${groupedEntry.description}`}
										collapsible="header"
										className={styles['task-div-list']}
									>
										<Panel
											key={`${groupedEntry.project_id} - ${groupedEntry.description}`}
											showArrow={false}
											header={
												<TimeEntry
													rowClassName="filter-task-list"
													length={groupedEntry.entries?.length}
													clickPlayButton={() => clickPlayButton(groupedEntry.entries[0])}
													timeEntry={groupedEntry.entries[0]}
													minStartTime={getStartTime(groupedEntry.entries)}
													maxEndTime={getEndTime(groupedEntry.entries)}
													totalDuration={getTotalTimeForADay(groupedEntry.entries)}
												/>
											}
										>
											{
												groupedEntry.entries.map((entry: any, entryIndex: number) => {
													return (
														<TimeEntry
															key={entry.id}
															rowClassName="filter-task-list"
															timeEntry={entry}
															length={entry?.length}
															clickPlayButton={() => clickPlayButton(entry)}
														/>
													)
												})
											}
										</Panel>
									</Collapse>
								) : (
									<span key={index}>
										<TimeEntry
											rowClassName={'task-div'}
											length={groupedEntry.entries?.length}
											clickPlayButton={() => clickPlayButton(groupedEntry.entries[0])}
											timeEntry={groupedEntry.entries[0]}
											minStartTime={groupedEntry.entries[0]?.startTime}
											maxEndTime={groupedEntry.entries[0]?.endTime}
										/>
									</span>
								)
							))
						}
					</div>
				</Form>
			</Card>
		</>
	)

}

function groupByDescriptionAndProject(entries: ITimeEntry[]) {
	const grouped: ITodayGroupedEntries[] = [];

	for (let entry of entries) {
		const project_id = entry.project_id;
		const description = entry.description;

		const foundIndex = findIndex(grouped, {
			description,
			project_id,
		});

		if (foundIndex >= 0) {
			grouped[foundIndex].entries.push(entry);
		} else {
			grouped.push({
				description,
				project_id,
				entries: [entry],
			});
		}
	}

	return grouped;
}


export default TimeTracker;


