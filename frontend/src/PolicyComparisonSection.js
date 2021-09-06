import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import PolicyDataBarChart from './PolicyDataBarChart';
import PolicyNumberDisplay from './PolicyNumberDisplay';
import './PolicyComparisonSection.css'

class PolicyComparisonSection extends React.Component{
    constructor(props){
        super(props)
        this.plotType = this.props.plotType;
        this.policyData = this.props.policyData;
        this.columnNums = this.props.columnNums;
        console.log("Policy data: ", this.policyData);
        this.sectionNum = this.props.sectionNum;
        this.title=this.props.title

        this.generatePlotColumn = this.generatePlotColumn.bind(this);

    }

    choosePlotType(plotType, data, columnNums, idx){
        switch(plotType){
            case "bar":
                return( <PolicyDataBarChart key={idx} data={data['graphData']} columnNums={columnNums} />);
            case "number":
                return(<PolicyNumberDisplay key={idx} data={data['graphData']} columnNums={columnNums} />);
            default:
                return(null);
        }
    }

    generatePlotColumn(policyData){
        return(
            policyData.map((data, idx) => {
                return(
                    <React.Fragment>
                        <Col lg="6" className="text-center">
                            <h3> Policy {(idx + 1) % 2 === 0 ? "B" : "A" }</h3>
                            {this.choosePlotType(this.plotType, data, this.columnNums, idx)}
                        </Col>
                    </React.Fragment>
                )
            })
        )
        
    }

    render() {
        return(
                <div className="section_container text-center" id={"section_"+this.sectionNum}>
                    <h2>
                        {this.title}
                    </h2>
                    <Container fluid={true} style={{marginBottom: "5rem"}}>
                        <Row>
                            {this.generatePlotColumn(this.policyData)}
                        </Row>    
                    </Container>
                    
                </div>
        );
    }
}

export default PolicyComparisonSection;