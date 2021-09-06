import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { defaults } from 'react-chartjs-2';

// Disable animating charts by default.
defaults.animation = false;

const backgroundColors = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)',
];

const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
];


class PolicyDataPlot extends React.Component {
    constructor(props){
        super(props);
        this.plotType = this.props.plotType;
        this.data = this.props.data;
        this.columnNums= this.props.columnNums; //start and end columns
        this.plotOptions = {
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return (value*100).toFixed(0) + "%";
                        }
                    }
                }
             },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        this.createChartJsData = this.createChartJsData.bind(this);
        this.choosePlotType = this.choosePlotType.bind(this);
    }


    createChartJsData(data, plotType, column_start, column_end){
        var dat = data.values.slice(column_start,column_end+1);
        this.max = dat.reduce(function(a, b) {return Math.max(a, b);}, 0);
        console.log(this.max);
        console.log(this.plotOptions);
        var labs = data.labels.slice(column_start,column_end+1);

        var bg_colors = backgroundColors.slice(0, (column_end - column_start + 1));
        var border_colors = borderColors.slice(0, (column_end - column_start + 1));

        if(plotType === "pie"){
            dat.push((1-dat[0]));
            labs.push("Overall Probability of not surviving");
            bg_colors = backgroundColors.slice(0, (column_end - column_start + 2)); // do this so we get additional color for completment
            border_colors = borderColors.slice(0, (column_end - column_start + 2));

            this.plotOptions = {
                responsive: true,
                scales: {
                    y: {
                        ticks: {
                            display:false
                        },
                        grid: {
                            display:false,
                            drawBorder:false
                        }
                    },
                 },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            };

        }
        const chartData = {
            labels: labs,
            datasets: [
                {
                    data: dat,
                    backgroundColor: bg_colors,
                    borderColor: border_colors,
                    borderWidth: 1,
                }
            ]
        }
        // console.log("chartData: ", chartData)
        return chartData;
    }

    choosePlotType(){
        console.log("plotType ", this.plotType);
        switch(this.plotType){
            case "bar":
                return(<Bar data={this.createChartJsData(this.data, this.plotType, this.columnNums[0], this.columnNums[1])}
                    options={this.plotOptions} redraw={false}
                />)
            case "pie":
                return(<Pie data={this.createChartJsData(this.data, this.plotType, this.columnNums[0], this.columnNums[1])}
                options={this.plotOptions} redraw={false}
            />)
            default:
                return(null)
        }
    }

    render() {
        return(
            <React.Fragment>
                {this.choosePlotType()}
            </React.Fragment>
            
            
        )
    }
}

export default PolicyDataPlot;