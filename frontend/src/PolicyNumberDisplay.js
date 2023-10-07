import React from 'react';
import { Jumbotron } from 'reactstrap';

class PolicyNumberDisplay extends React.Component{
    constructor(props){
        super(props)
        this.data = this.props.data
        this.columnNums = this.props.columnNums
    }

    render(){if((this.data.values.slice(this.columnNums[0], this.columnNums[1]+1) < 1) &&
    (this.data.values.slice(this.columnNums[0], this.columnNums[1]+1) > 0.0) ){
        return(
            <Jumbotron>
                <h1>{this.data.values.slice(this.columnNums[0],this.columnNums[1]+1).toLocaleString(undefined,
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                        style: 'percent'
                    })}
                </h1>
            </Jumbotron>
        )}
        else{
        return(
            <Jumbotron>
                <h1>{this.data.values.slice(this.columnNums[0],this.columnNums[1]+1).toLocaleString(undefined,
                    {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,

                    })}
                </h1>
            </Jumbotron>
        )}
    }
}
export default PolicyNumberDisplay;