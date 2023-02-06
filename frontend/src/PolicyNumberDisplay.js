import React from 'react';
import { Jumbotron } from 'reactstrap';

class PolicyNumberDisplay extends React.Component{
    constructor(props){
        super(props)
        this.data = this.props.data
        this.columnNums = this.props.columnNums
    }

    render(){
        return(
            
            <Jumbotron>
                <h1>{this.data.values.slice(this.columnNums[0],this.columnNums[1]+1).toLocaleString(undefined,
                    {   
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })}
                </h1>
                <p>
                    {this.data.labels.slice(this.columnNums[0], this.columnNums[1]+1)}
                </p>
            </Jumbotron>
        )
    }
}
export default PolicyNumberDisplay;