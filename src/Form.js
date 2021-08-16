import React from 'react';
import logo from './logo192.png';
import SelectableCardList from "./Card"
import './Form.css';

class MasterForm extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        currentStep: 1,
        userChoices: [],
        email:  '',
        username: '',
        password: '', 
        selected: -1
      }
      this.maxSteps = 3;
      this.updateSelected = this.updateSelected.bind(this);
      this.submitChoice = this.submitChoice.bind(this);
    
      this.choiceData = [
        [{
          title: "FC Barcelona",
          description: "Spain"
        }, {
          title: "Bayern Munich",
          description: "Germany"
        }],
        [{
          title: "Apple",
          description: "Cupertino, CA"
        }, {
            title: "Microsoft",
            description: "Redmond, WA"
        }],
        [{
          title: "Apples",
            description: "some text"
        },{
            title: "Oranges",
            description: "Cara cara"
        }]
      ];
      this.teams = [{
        title: "FC Barcelona",
        description: "Spain"
      }, {
        title: "Bayern Munich",
        description: "Germany"
      }];
    this.techCompanies = [{
        title: "Apple",
        description: "Cupertino, CA"
    }, {
        title: "Microsoft",
        description: "Redmond, WA"
    }];
    this.fruit = [{
      title: "Apples",
      description: "some text"
    },{
      title: "Oranges",
      description: "Cara cara"
    }];
    }
  
    handleChange = event => {
      const {name, value} = event.target
      this.setState({
        [name]: value
      })    
    }
     
    handleSubmit = event => {
      event.preventDefault()
      const { email, username, password } = this.state
      alert(`Your registration detail: \n 
             Email: ${email} \n 
             Username: ${username} \n
             Password: ${password}`)
    }
    
    // _next = () => {
    _next(){
      let currentStep = this.state.currentStep;
      currentStep = currentStep >= 2? this.maxSteps: currentStep + 1
      this.setState({
        currentStep: currentStep
      })
    }

    _goToEnd(){
      let currentStep = this.state.currentStep;
      if(currentStep === this.maxSteps){
        // update current step to go to end page
        this.setState({
          currentStep: this.maxSteps + 1
        })
      }
    }

    updateSelected(selected){
        this.setState({
        selected: selected
        })
    }

    finalSubmit(){
        let [choice1, choice2, choice3] = this.state.userChoices;
        alert(`Your choices: \n 
             Choice 1: ${this.choiceData[0][choice1]['title']} \n 
             Choice 2: ${this.choiceData[1][choice2]['title']} \n
             Choice 3: ${this.choiceData[2][choice3]['title']} \n
        This is where we will send the results back to the server`);
        this._goToEnd();
    }

    displayChoices = () => {
      let [choice1, choice2, choice3] = this.state.userChoices;
        return(
          <ul>
            <li>
              Choice 1: {this.choiceData[0][choice1]['title']}
            </li>
            <li>
              Choice 2: {this.choiceData[1][choice2]['title']}
            </li>
            <li>
              Choice 3: {this.choiceData[2][choice3]['title']}
            </li>
            
          </ul>
          
          );
    }

    submitChoice = () => {
        console.log(this.state.selected);
        this.state.userChoices.push(this.state.selected);
        console.log(this.state.userChoices);
        if(this.state.currentStep === this.maxSteps){
          // then we want to submit the results
          this.finalSubmit();
        } else{
          // move to next question
          this._next();
        }
        
    }

    _chooseA = () => {
        alert(
            `You chose option A!`
        )
    }

    _chooseB = () => {
        alert(
            `You chose option B!`
        )
    }
      
    nextButton(){
        let currentStep = this.state.currentStep;
        if(currentStep <3){
        return (
            <button 
            className="btn btn-primary float-right" 
            type="button" onClick={this._next}>
            Next
            </button>        
        )
        }
        return null;
    }
    
    render() {    
      return (
        <React.Fragment>
        <h1>Active Preference Elicitation 🔮 </h1>
        <p>Step {this.state.currentStep} </p> 
  
        {/* <form onSubmit={this.handleSubmit}> */}
        {/* <form> */}
        {/* 
          render the form steps and pass required props in
        */}
          <Step1 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            email={this.state.email}
            data={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
          />
          <Step2 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            username={this.state.username}
            data={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
          />
          <Step3 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            password={this.state.password}
            data={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
          />

          <EndPage
            currentStep={this.state.currentStep}
            displayChoices={this.displayChoices}
            maxSteps={this.maxSteps}
          />
          {/* {this.previousButton()} */}
          {/* {this.nextButton()} */}
  
        {/* </form> */}
        </React.Fragment>
      );
    }
  }
  
  function Step1(props) {
    if (props.currentStep !== 1) {
      return null
    } 
    return(
        <div className="container">
            {/* <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                className="form-control"
                id="email"
                name="email"
                type="text"
                placeholder="Enter email"
                value={props.email}
                onChange={props.handleChange}
                />    
            </div> */}
            <Example title="Pick a team" cardContents={props.data} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected} />
        </div>
        
            
      
      
    );
  }
  
  function Step2(props) {
    if (props.currentStep !== 2) {
      return null
    } 
    return(
        <div className="container">
            <Example title="Pick a company" cardContents={props.data} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected} />
        </div>
      
    );
  }
  
  function Step3(props) {
    if (props.currentStep !== 3) {
      return null
    } 
    return(
      <div className="container">
        <Example title="Pick a fruit" cardContents={props.data} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected} />
      </div>
    )
  }

  function EndPage(props) {
    console.log(props.currentStep)
    if (props.currentStep !== props.maxSteps + 1) {
      return null
    } 
    return(
        <div className="container">
          <h1 className="title">All done!</h1>
          <p>
            Thanks for particpating here are the choices you made:
          </p>
          {props.displayChoices()}
      </div>
      
      
    )
  }

  class Example extends React.Component {
    onListChanged(selected) {
        this.setState({
        selected: selected
        });
        this.props.updateSelected(selected);
    }
    render() {
      return (
        <div className="column">
            <h1 className="title">{this.props.title}</h1>
            <SelectableCardList 
              multiple={this.props.multiple}
              maxSelectable={this.props.maxSelectable}
              contents={this.props.cardContents}
              onChange={this.onListChanged.bind(this)}/>
              {/* On click we want to move to the next choice and store this information.
              I think we can use _next but we need to add in the info for the choices */}
            <button className="card" onClick={this.props.submitChoice}>
              Choose option
            </button>
        </div>);
    }
  }
  

    
  
//   ReactDOM.render(<MasterForm />, document.getElementById('root'))
export default MasterForm;