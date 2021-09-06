import React from 'react';
import { Bar } from 'react-chartjs-2';
import { defaults } from 'react-chartjs-2';

// Disable animating charts by default.
defaults.animation = false;

class PolicyDataBarChart extends React.Component {
    constructor(props){
        super(props);
        this.data = this.props.data;
        this.columnNums= this.props.columnNums; //start and end columns
        this.plotOptions = {
            responsive: true,
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                  },
                },
              ],
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        this.createChartJsData = this.createChartJsData.bind(this);
    }


    createChartJsData(data, column_start, column_end){
        // need data in the form
        // const data = {
        //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        //     datasets: [
        //       {
        //         label: '# of Votes',
        //         data: [12, 19, 3, 5, 2, 3],
        //         backgroundColor: [
        //           'rgba(255, 99, 132, 0.2)',
        //           'rgba(54, 162, 235, 0.2)',
        //           'rgba(255, 206, 86, 0.2)',
        //           'rgba(75, 192, 192, 0.2)',
        //           'rgba(153, 102, 255, 0.2)',
        //           'rgba(255, 159, 64, 0.2)',
        //         ],
        //         borderColor: [
        //           'rgba(255, 99, 132, 1)',
        //           'rgba(54, 162, 235, 1)',
        //           'rgba(255, 206, 86, 1)',
        //           'rgba(75, 192, 192, 1)',
        //           'rgba(153, 102, 255, 1)',
        //           'rgba(255, 159, 64, 1)',
        //         ],
        //         borderWidth: 1,
        //       },
        //     ],
        //   };
        const chartData = {
            labels: data.labels.slice(column_start,column_end+1),
            datasets: [
                {
                    data: data.values.slice(column_start,column_end+1),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                }
            ]
        }
        // console.log("chartData: ", chartData)
        return chartData;
    }

    render() {
        return(
            <Bar data={this.createChartJsData(this.data, this.columnNums[0], this.columnNums[1])}
            options={this.plotOptions} redraw={false}
            />
        )
    }
}

export default PolicyDataBarChart;