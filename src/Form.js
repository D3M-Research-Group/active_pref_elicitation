import React from 'react';
import SelectableCardList from "./Card"
import './Form.css';

class MasterForm extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        currentStep: 1,
        userChoices: [],
        selected: -1
      }
      this.maxSteps = 3;
      this.updateSelected = this.updateSelected.bind(this);
      this.submitChoice = this.submitChoice.bind(this);

      this.graphData = [
        {year: 1980, efficiency: 24.3, sales: 8949000},
      
        {year: 1985, efficiency: 27.6, sales: 10979000},
      
        {year: 1990, efficiency: 28, sales: 9303000},
      
        {year: 1991, efficiency: 28.4, sales: 8185000},
      
        {year: 1992, efficiency: 27.9, sales: 8213000},
      
        {year: 1993, efficiency: 28.4, sales: 8518000},
      
        {year: 1994, efficiency: 28.3, sales: 8991000},
      
        {year: 1995, efficiency: 28.6, sales: 8620000},
      
        {year: 1996, efficiency: 28.5, sales: 8479000},
      
        {year: 1997, efficiency: 28.7, sales: 8217000},
      
        {year: 1998, efficiency: 28.8, sales: 8085000},
      
        {year: 1999, efficiency: 28.3, sales: 8638000},
      
        {year: 2000, efficiency: 28.5, sales: 8778000},
      
        {year: 2001, efficiency: 28.8, sales: 8352000},
      
        {year: 2002, efficiency: 29, sales: 8042000},
      
        {year: 2003, efficiency: 29.5, sales: 7556000},
      
        {year: 2004, efficiency: 29.5, sales: 7483000},
      
        {year: 2005, efficiency: 30.3, sales: 7660000},
      
        {year: 2006, efficiency: 30.1, sales: 7762000},
      
        {year: 2007, efficiency: 31.2, sales: 7562000},
      
        {year: 2008, efficiency: 31.5, sales: 6769000},
      
        {year: 2009, efficiency: 32.9, sales: 5402000},
      
        {year: 2010, efficiency: 33.9, sales: 5636000},
      
        {year: 2011, efficiency: 33.1, sales: 6093000},
      
        {year: 2012, efficiency: 35.3, sales: 7245000},
      
        {year: 2013, efficiency: 36.4, sales: 7586000},
      
        {year: 2014, efficiency: 36.5, sales: 7708000},
      
        {year: 2015, efficiency: 37.2, sales: 7517000},
      
        {year: 2016, efficiency: 37.7, sales: 6873000},
      
        {year: 2017, efficiency: 39.4, sales: 6081000},
      
      ]
    
      this.choiceData = [
        [{
          title: "FC Barcelona",
          description: "Spain",
          data: this.graphData
        }, {
          title: "Bayern Munich",
          description: "Germany",
          data: this.graphData
        }],
        [{
          title: "Apple",
          description: "Cupertino, CA",
          data: this.graphData
        }, {
            title: "Microsoft",
            description: "Redmond, WA",
            data: this.graphData
        }],
        [{
          title: "Apples",
            description: "some text",
            data: this.graphData
        },{
            title: "Oranges",
            description: "Cara cara",
            data: this.graphData
        }]
      ];
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

    _restart = () => {
      this.setState({
        currentStep: 1,
        userChoices: [],
        selected: -1
      })
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
            restart={this._restart}
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

          <button 
            className="btn btn-primary" 
            type="button" onClick={props.restart}>
            Take again
            </button>                  
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