import React from 'react';
import SelectableCardList from "./Card";
import Alert from 'react-bootstrap/Alert';
import Loader from "./Loader";

function SelectionErrorAlert(props) {
    // const [show, setShow] = useState(false);
  
    if (!props.showError) {
      return null
    }
    return (
      <div class="d-flex justify-content-center">
        <Alert variant="danger" className="text-center" onClose={() => props.updateShowError(false)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>
            Please select one of the three options before clicking Next.
          </p>
        </Alert>
      </div>
    );
    
  }

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
        this.onListChanged = this.onListChanged.bind(this);
        this.updateShowError = this.updateShowError.bind(this);
        this.userChoices = this.props.userChoices;
        this.incrementStep = this.props.incrementStep;
        this.prepareCardData = this.prepareCardData.bind(this);


        // lift up state function
        this.pushBackChoice = this.pushBackChoice.bind(this);
        
        // go to next step or end function
        this.next = this.props.next;
    }

    pushBackChoice(selected){
        this.userChoices.push(selected);
    }

    onListChanged(selected) {
        this.setState({
        selected: selected,
        });
        this.updateShowError(false);
    }

    updateShowError(show){
        this.setState({
        showError: show
        })
    }

    submitChoice = (e) => {
        e.preventDefault();
        if(this.state.selected === -1){
            this.setState({
            showError: true
            })
            
        } else{
            this.incrementStep();
            // hide the error message
            this.setState({
            showError: false
            }); 
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
        <div className="column">
          {this.loading ? <Loader /> : null}

            {this.loading ? null : <div>
              <h1 className="title">{this.props.title}</h1>
              <SelectableCardList 
                contents={this.prepareCardData(this.cardContents,this.graphData, this.policy_ids)}
                onChange={this.onListChanged}/>
                {/* On click we want to move to the next choice and store this information.
                I think we can use _next but we need to add in the info for the choices */}
                <SelectionErrorAlert showError={this.state.showError} updateShowError={this.updateShowError}  />
                <button className="card" onClick={e => {
                  this.submitChoice(e);
                }}>
                  Submit selection
                </button>
            </div>}
            
        </div>);
    }
  }

  export default PairwiseComparison;