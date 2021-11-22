import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { defaults } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';



// Disable animating charts by default.
defaults.animation = false;
defaults.font.size=16;

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
        this.key = this.props.key;
        this.plotType = this.props.plotType;
        this.updateMaxYVal = this.props.updateMaxYVal;
        this.maxYVal = this.props.maxYVal;
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
                tooltip:{
                    enabled: false
                },
                legend: {
                    display: false
                },
                datalabels: {
                    display: true,
                    color: "black",
                    // align: "end",
                    // anchor: "end",
                    clamp:true,
                    font: { size: "16" },
                    formatter: function(value, context) {
                        return Math.round(value*100).toFixed(0) + '%';
                      }
                  }
            }
        };
        this.createChartJsData = this.createChartJsData.bind(this);
        this.choosePlotType = this.choosePlotType.bind(this);
        this.cleanAxisLabels = this.cleanAxisLabels.bind(this);
    }



    cleanAxisLabels(labels){
        const reg_exp = /.*_/i
        var cleaned_labels = labels.map((label) => {
            if(label === "Overall survival probability"){
                label = "Survived";
            }
            return(label.replace(reg_exp,""));
        })
        return(cleaned_labels);
    }


    createChartJsData(data, plotType, column_start, column_end){
        var dat = data.values.slice(column_start,column_end+1);
        this.plotOptions.scales.y.suggestedMax =this.maxYVal;
        var labs = this.cleanAxisLabels(data.labels.slice(column_start,column_end+1));

        var bg_colors = backgroundColors.slice(0, (column_end - column_start + 1));
        var border_colors = borderColors.slice(0, (column_end - column_start + 1));

        if(plotType === "pie"){
            dat.push((1-dat[0]));
            labs.push("Deceased");
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
                    tooltip:{
                        enabled: false
                    },
                    legend: {
                        display: true,
                        labels: {
                            font :{
                                size : 20
                            }
                        }
                    },
                    datalabels: {
                        display: true,
                        color: "black",
                        clamp:true,
                        // align: "end",
                        // anchor: "end",
                        font: { size: "16" },
                        formatter: function(value, context) {
                            return Math.round(value*100).toFixed(0) + '%';
                          }
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
        switch(this.plotType){
            case "bar":
                return(<Bar key={this.key} data={this.createChartJsData(this.data, this.plotType, this.columnNums[0], this.columnNums[1])}
                    options={this.plotOptions} redraw={false} plugins={[ChartDataLabels]}
                />)
            case "pie":
                return(<Pie key={this.key} data={this.createChartJsData(this.data, this.plotType, this.columnNums[0], this.columnNums[1])}
                options={this.plotOptions} redraw={false} plugins={[ChartDataLabels]}
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