import React from 'react';
import PolicyComparisonSection from './PolicyComparisonSection';
import BottomNavBar from './NavBar';
import {Container} from 'reactstrap';


class QuestionContainer extends React.Component {
    render(){
        return(
            <>
            <Container id="policy_comparison_container" fluid={false}>

                <h1 className="title">Question {this.props.stepNum} / {this.props.maxSteps}</h1>
                {
                this.props.sectionInfo.map((section, index) => {
                    const prepped_dat = this.props.prepareCardData(this.props.graphData, this.props.policy_ids, section.columnNums);
                    return(
                    <PolicyComparisonSection
                        key={index.toString()}
                        idx_key={index.toString()}
                        plotType={section.plotType}
                        sectionType={section.sectionType}
                        policyData={prepped_dat['dat']}
                        maxYVal={prepped_dat['maxYVal']}
                        sectionNum={index+1}
                        columnNums={section.columnNums}
                        title={section.sectionName}  
                        description={section.sectionDescription}
                    />
                    )
                })
                }
                
            </Container>
            <BottomNavBar 
            sectionNames={this.props.sectionInfo.map((x)=> x.sectionName)} 
            onSelectChange={this.props.onListChanged}
            submitChoice={this.props.submitChoice}
            />
            </>
        )
        
    }
}

export default QuestionContainer;