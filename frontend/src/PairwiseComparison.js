import React from 'react';
// import Alert from 'react-bootstrap/Alert';
import Loader from "./Loader";
import BottomNavBar from './NavBar';
import { Container} from 'reactstrap';
// import PolicyDataBarChart from './PolicyDataBarChart';
import PolicyComparisonSection from './PolicyComparisonSection';
import './PolicyComparisonSection'
import axios from 'axios';

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

const SERVER_URL = "http://localhost:3004";

class PairwiseComparison extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            showError: false,
            selected: -1,
            loading : false
        }
        this.title = this.props.title;
        // this.loading = this.props.loading
        this.toggleLoading = this.props.toggleLoading;
        this.cardContents = this.props.cardContents;
        this.graphData = this.props.graphData;
        this.policy_ids = this.props.policy_ids;
        this.userChoices = this.props.userChoices;
        this.stepNum = this.props.stepNum;
        this.updatePolicyIDs=this.props.updatePolicyIDs

        this.incrementStep = this.props.incrementStep;

        this.onListChanged = this.onListChanged.bind(this);
        this.updateShowError = this.updateShowError.bind(this);
        this.prepareCardData = this.prepareCardData.bind(this);


        // lift up state function
        this.pushBackChoice = this.pushBackChoice.bind(this);
        
        // go to next step or end function
        this.next = this.props.next;

        this.sectionInfo = [{
          sectionType : "number",
          columnNums: [7,7],
          sectionName: "Life Years Saved",
          sectionDescription: ""
        },{
          sectionType : "plot",
          plotType : "pie",
          columnNums: [8,8],
          sectionName: "Overall Survival Probability",
          sectionDescription: "Among Those Who Contracted COVID-19 and Needed Critical Care"
        },
        {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [0,5],
            sectionName: "Chance of Receiving Critical Care by Age Group",
            sectionDescription: "Among People Who Need It",
          },
          {
            sectionType : "plot",
            plotType : "bar",
            columnNums: [9,14],
            sectionName: "Survival Probability",
            sectionDescription: "Chance of Surviving by Age Group"
          }
          
          
        ]

    }

    pushBackChoice(selected){
        this.userChoices.push(selected);
        console.log("userChoices", this.userChoices);
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
            // get next query
            // this.getNextQuery(this.stepNum, this.state.selected);
            // this.incrementStep();
            // record the choice made
            // console.log(this.state.selected);
            // this.pushBackChoice(this.state.selected);
            // this.toggleLoading();
            // this.toggleLoading();  

            this.setState({loading: true}, () => {
              axios.get(`${SERVER_URL}/next_query/${this.stepNum}`, {})
              .then((response) => {
                console.log(response.data);
                this.updatePolicyIDs(response.data.policy_ids);
                this.incrementStep();
                console.log("selected", this.state.selected);
                this.pushBackChoice(this.state.selected);
                
                this.setState({loading: false});
              })
              .catch((err) => {
                console.log("got error: ", err.data)
              })
          })
            
            
            
        }
    }

    prepareCardData(cardData,graphData,policy_ids, columnNums){
        var maxVals = []
        var dat = cardData
        for(var i=0; i < policy_ids.length; i++){
            dat[i]['graphData'] = graphData[policy_ids[i]];
            // for each policy take the max of the column values
            maxVals.push(graphData[policy_ids[i]]['values'].slice(columnNums[0], columnNums[1]).reduce(
              function(a, b) {return Math.max(a, b);}, 0));
        }
        return {"dat": dat, "maxYVal": maxVals.reduce(function(a, b) {return Math.max(a, b);}, 0)};
    }


    render() {
        // cardContents contains title, description, and graph data
        // we will use the policy ids to population the graph data element in cardContents
      return (
        // <div className="column">
        <React.Fragment>
          {this.state.loading ? <Loader /> : null}

            {this.state.loading ? null : 
            <div>
            <Container fluid={false}>
              <h1 className="title">Query {this.stepNum}</h1>
              {
                this.sectionInfo.map((section, index) => {
                  const prepped_dat = this.prepareCardData(this.cardContents,this.graphData, this.policy_ids, section.columnNums);
                  return(
                    <PolicyComparisonSection
                      key={index}
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
              sectionNames={this.sectionInfo.map((x,idx)=> x.sectionName)} 
              onSelectChange={this.onListChanged}
              submitChoice={this.submitChoice}
              toggleLoading={this.toggleLoading}
            />
            </div>
            }
            
        </React.Fragment>
        );
    }
  }

  export default PairwiseComparison;