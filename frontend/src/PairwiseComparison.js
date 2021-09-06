import React from 'react';
import SelectableCardList from "./Card";
import Alert from 'react-bootstrap/Alert';
import Loader from "./Loader";
import BottomNavBar from './NavBar';
import { Col, Container, Row } from 'reactstrap';
import PolicyDataBarChart from './PolicyDataBarChart';
import PolicyComparisonSection from './PolicyComparisonSection';
import './PolicyComparisonSection'

// function SelectionErrorAlert(props) {
//     // const [show, setShow] = useState(false);
  
//     if (!props.showError) {
//       return null
//     }
//     return (
//       <div class="d-flex justify-content-center">
//         <Alert variant="danger" className="text-center" onClose={() => props.updateShowError(false)} dismissible>
//           <Alert.Heading>Error</Alert.Heading>
//           <p>
//             Please select one of the three options before clicking Next.
//           </p>
//         </Alert>
//       </div>
//     );
    
//   }

class PairwiseComparison extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            showError: false,
            selected: -1
        }
        this.title = this.props.title;
        this.loading = this.props.loading
        this.cardContents = this.props.cardContents;
        this.graphData = this.props.graphData;
        this.policy_ids = this.props.policy_ids;
        this.userChoices = this.props.userChoices;
        this.stepNum = this.props.stepNum;

        this.incrementStep = this.props.incrementStep;

        this.onListChanged = this.onListChanged.bind(this);
        this.updateShowError = this.updateShowError.bind(this);
        this.prepareCardData = this.prepareCardData.bind(this);


        // lift up state function
        this.pushBackChoice = this.pushBackChoice.bind(this);
        
        // go to next step or end function
        this.next = this.props.next;

        this.sectionInfo = [{
            plotType : "bar",
            columnNums: [0,5],
            sectionName: "CCU Probability"
          },
          {
            plotType : "bar",
            columnNums: [9,14],
            sectionName: "Survival Probability"
          },
          {
            plotType : "number",
            columnNums: [7,7],
            sectionName: "Life Years Saved"
          }
        ]

    }

    pushBackChoice(selected){
        this.userChoices.push(selected);
    }

    onListChanged(selected) {
        this.setState({
        selected: selected,
        }, function(){console.log(this.state.selected)});
        this.updateShowError(false);
    }

    updateShowError(show){
        this.setState({
        showError: show
        })
    }

    submitChoice = (e) => {
        e.preventDefault();
        if(this.state.selected === ""){
          console.log("somehow got here, but we shouldn't be able to if we have button disabled?")
            // this.setState({
            // showError: true
            // })
            
        } else{
            this.incrementStep();
            // hide the error message
            // this.setState({
            // showError: false
            // }); 
            // record the choice made
            this.pushBackChoice(this.state.selected);
            
            
        }
    }

    prepareCardData(cardData,graphData,policy_ids){
        var dat = cardData
        for(var i=0; i < policy_ids.length; i++){
            dat[i]['graphData'] = graphData[policy_ids[i]]
        }
        return dat;
    }


    render() {
        // cardContents contains title, description, and graph data
        // we will use the policy ids to population the graph data element in cardContents
      return (
        // <div className="column">
        <React.Fragment>
          {this.loading ? <Loader /> : null}

            {this.loading ? null : 
            <div>
            <Container fluid={false}>
              <h1 className="title">Query {this.stepNum}</h1>
              {
                this.sectionInfo.map((section, index) => {
                  return(
                    <PolicyComparisonSection
                      key={index}
                      plotType={section.plotType}
                      policyData={this.prepareCardData(this.cardContents,this.graphData, this.policy_ids)}
                      sectionNum={index+1}
                      columnNums={section.columnNums}
                      title={section.sectionName}  
                    />
                  )
                })
              }
                
            </Container>
            <BottomNavBar 
              sectionNames={this.sectionInfo.map((x,idx)=> x.sectionName)} 
              onSelectChange={this.onListChanged}
              submitChoice={this.submitChoice}
            />
            </div>
            }
            
        </React.Fragment>
        );
    }
  }

  export default PairwiseComparison;