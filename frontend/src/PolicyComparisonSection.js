import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import './PolicyComparisonSection.css';
import PolicyDataPlot from './PolicyDataPlots';
import PolicyNumberDisplay from './PolicyNumberDisplay';
import TooltipItem from './ToolTip';

class PolicyComparisonSection extends React.Component{
    constructor(props){
        super(props)
        this.key = this.props.idx_key;
        this.sectionType = this.props.sectionType;
        this.plotType = this.props.plotType;
        this.policyData = this.props.policyData;
        this.columnNums = this.props.columnNums;
        // console.log("Policy data: ", this.policyData);
        this.sectionNum = this.props.sectionNum;
        this.title=this.props.title;
        this.description=this.props.description;
        this.toolTipText=this.props.toolTipText;
        this.maxYVal = this.props.maxYVal;
        this.generatePlotColumn = this.generatePlotColumn.bind(this);
        

    }

    choosePlotType(sectionType, plotType, data, columnNums, key){
        switch(sectionType){
            case "plot":
                return( <PolicyDataPlot key={key} plotType={plotType}
                     data={data['graphData']} columnNums={columnNums} 
                     maxYVal={this.maxYVal}/>);
            case "number":
                return(<PolicyNumberDisplay key={key} data={data['graphData']} columnNums={columnNums} />);
            default:
                return(null);
        }
    }

    generatePlotColumn(policyData, key){
        return(
            policyData.map((data, idx) => {
                return(
                    <React.Fragment>
                        <Col lg={this.plotType === "pie"? "4" : "6"}
                        className="text-center" id={`section_${this.sectionNum}_policy_${(idx + 1) % 2 === 0 ? "B" : "A"}`}>
                            <h3> Policy {(idx + 1) % 2 === 0 ? "B" : "A" }</h3>
                            {this.choosePlotType(this.sectionType, this.plotType, data, this.columnNums, key)}
                        </Col>
                    </React.Fragment>
                )
            })
        )
        
    }

    render() {
        return(
                <div className="section_container text-center" id={"section_"+this.sectionNum}>
                    <div>
                        <h2 style={{ display: "inline"}}>
                            {this.title}
                        </h2>
                        {
                        this.toolTipText.length > 0 ?
                        <TooltipItem key={this.sectionNum} placement={'right'} text={this.toolTipText} id={this.sectionNum} /> :
                        null
                        }
                        
                    </div>
                    <p>{this.description}</p>
                    <Container fluid={true} style={{marginBottom: "5rem"}} key={this.key}>
                        {this.plotType === "pie"? 
                        <Row className="justify-content-center" key={this.key}>
                            {this.generatePlotColumn(this.policyData, this.key)}
                        </Row>: 
                        <Row key={this.key}>
                            {this.generatePlotColumn(this.policyData, this.key)}
                        </Row>    
                        }
                        
                    </Container>
                    
                </div>
        );
    }
}

export default PolicyComparisonSection;