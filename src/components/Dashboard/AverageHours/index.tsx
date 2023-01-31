import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend, ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Col, Empty, Select, Typography } from "antd";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from "./style.module.scss";
import { IBarChart } from "../../../interfaces/IDashboard";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {
  averageHoursData: IBarChart[];
  caption: string;
  title: string;
  setDate?: any;
  employee?: boolean;
}


const { Option } = Select;

const Index = (props: IProps) => {
  const { averageHoursData, title, employee } = props;

  const options: ChartOptions<any> = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax : employee ? 120 : 1000,
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'black',
          font: {
            size: 15,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      title: {
        display: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'right',
        color: 'black',
        font: {
          size: 15,
        },
        padding: {
          left: 15,
        },
        formatter: function (value: any, context: any) {
          return value + ' hrs'
        },
      }
    },
  };

  const data = {
    labels: averageHoursData.map((avgHr: IBarChart) => (avgHr.label)),
    datasets: [
      {
        data: averageHoursData.map((avgHr: IBarChart) => (avgHr.value)),
        backgroundColor: '#3A43AF',
        barThickness: 30,
        borderRadius: 20,
      }
    ],
  }

  const months = moment.monthsShort();

  const handleChange = (month: number) => {
    const year = moment().year()
    props.setDate(`${year}/${month}/01`)
  }

  let month = new Date().getMonth();
  return (
    <>
      <div className={styles['average-hours']}>
        <div className={styles['hours-title']}>
          <Typography.Title level={3}>{title}</Typography.Title>
          {/* <Typography.Title level={4} keyboard className={styles['no-margin']}>
            {caption}
          </Typography.Title> */

          }
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={7}>
            <Select onSelect={handleChange} placeholder='Select Month' defaultValue={month + 1}>
              {months.map((month, index) => (
                <Option value={index + 1} >{month}</Option>
              ))}
            </Select>
          </Col>
        </div>
        {data?.labels?.length ?
          <div className={
            averageHoursData?.length > 8 ?
              styles['chart-container-more'] :
              styles['chart-container-less']}>
            <Bar options={options} data={data} plugins={[ChartDataLabels]} />
          </div>
          :
          <div style={{ marginTop: '1.5rem' }}>
            <Empty description={'Nothing Tracked yet'} />
          </div>
        }
      </div>

    </>
  )
}

export default Index;