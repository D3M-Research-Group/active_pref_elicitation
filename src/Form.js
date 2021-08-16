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
      this._chooseA = this._chooseA.bind(this);
      this._chooseB = this._chooseB.bind(this);
      this.updateSelected = this.updateSelected.bind(this);
      this.submitChoice = this.submitChoice.bind(this);
    

      this.teams = [{
        title: "FC Barcelona",
        description: "Spain"
      }, {
        title: "Real Madrid",
        description: "Spain"
      }, {
        title: "Bayern Munich",
        description: "Germany"
      }, {
        title: "Juventus",
        description: "Italy"
      }];
    this.techCompanies = [{
        title: "Google",
        description: "Mountain View, CA"
    }, {
        title: "Apple",
        description: "Cupertino, CA"
    }, {
        title: "Microsoft",
        description: "Redmond, WA"
    }, {
        title: "Facebook",
        description: "Menlo Park, CA"
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
      let currentStep = this.state.currentStep
      currentStep = currentStep >= 2? 3: currentStep + 1
      this.setState({
        currentStep: currentStep
      })
    }

    updateSelected(selected){
        this.setState({
        selected: selected
        })
    }

    submitChoice = () => {
        console.log(this.state.selected);
        this.state.userChoices.push(this.state.selected);
        // window.alert("Selected: " + this.state.selected);
        console.log(this.state.userChoices);
        
        // let currentStep = this.props.currentStep;
        // currentStep = currentStep >= 2? 3: currentStep + 1;
        // this.props.setState({
        //     currentStep: currentStep
        // })
        this._next();
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
            teams={this.teams}
            userChoices={this.state.userChoices}
            updateSelected={this.updateSelected}
            _next={this._next}
            submitChoice={this.submitChoice}
            selected={this.state.selected}

          />
          <Step2 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            username={this.state.username}
            companies={this.techCompanies}
          />
          <Step3 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            password={this.state.password}
          />
          {/* {this.previousButton()} */}
          {this.nextButton()}
  
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
            <Example title="Pick a team" cardContents={props.teams} userChoices={props.userChoices}
                     _next={props._next} currentStep={props.currentStep} submitChoice={props.submitChoice}
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
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                className="form-control"
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={props.username}
                onChange={props.handleChange}
                />
            </div>
            <Example title="Pick a team" cardContents={props.companies} />
        </div>
      
    );
  }
  
  function Step3(props) {
    if (props.currentStep !== 3) {
      return null
    } 
    return(
      <React.Fragment>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          className="form-control"
          id="password"
          name="password"
          type="password"
          placeholder="Enter password"
          value={props.password}
          onChange={props.handleChange}
          />      
      </div>
      <button className="btn btn-success btn-block">Sign up</button>
      </React.Fragment>
    );
  }

  class Example extends React.Component {
    onListChanged(selected) {
        console.log("list changed")
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