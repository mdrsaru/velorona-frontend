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
import {Typography} from "antd";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from "./style.module.scss";
import {IBarChart} from "../../../interfaces/IDashboard";

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
  title : string;
}

const Index = (props: IProps) => {
  const { averageHoursData, caption,title } = props;
  const options: ChartOptions<any> = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 60,
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
  return (
    <>
      <div className={styles['average-hours']}>
        <div className={styles['hours-title']}>
          <Typography.Title level={3}>{title}</Typography.Title>
          {/* <Typography.Title level={4} keyboard className={styles['no-margin']}>
            {caption}
          </Typography.Title> */}
        </div>
        <div className={
          averageHoursData?.length > 8 ?
            styles['chart-container-more']:
            styles['chart-container-less']}>
          <Bar options={options} data={data} plugins={[ChartDataLabels]}/>
        </div>
      </div>

    </>
  )
}

export default Index;