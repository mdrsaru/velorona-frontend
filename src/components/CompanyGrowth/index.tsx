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
import {IBarChart} from "../../interfaces/IDashboard";
import styles from "../Dashboard/TotalExpenses/style.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {
  totalExpensesData: IBarChart[];
  caption: string;
}

const CompanyGrowth = (props: IProps) => {
  const {totalExpensesData, caption} = props;
  const options: ChartOptions<any> = {
    scales: {
      y: {
        display: false,
        grid: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 600,
      },
      x: {
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
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
      datalabels: {
        anchor: 'end',
        align: 'top',
        color: 'black',
        font: {
          size: 15,
        },
        padding: {
          bottom: 15,
        },
        formatter: function (value: any, context: any) {
          return + value
        },
      },
    },
  };

  const data = {
    labels: totalExpensesData.map((avgHr: IBarChart) => (avgHr.label)),
    datasets: [
      {
        data: totalExpensesData.map((avgHr: IBarChart) => (avgHr.value)),
        backgroundColor: '#3A43AF',
        barThickness: 30,
        borderRadius: 20,
      }
    ],
  }
  return (
    <>
      <div className={styles['chart']}>
        <div className={styles['chart-title']}>
          <Typography.Title level={3}>Total Expenses Per Week</Typography.Title>
          {/* <Typography.Title level={4} keyboard className={styles['no-margin']}>
            {caption}
          </Typography.Title> */}
        </div>
        <Bar options={options} data={data} plugins={[ChartDataLabels]}/>
      </div>

    </>
  )
}

export default CompanyGrowth;