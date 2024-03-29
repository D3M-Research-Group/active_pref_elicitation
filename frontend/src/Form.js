import React from 'react';
import SelectableCardList from "./Card";
import Alert from 'react-bootstrap/Alert'
import UserInfoForm from './UserInfoForm';
import { v4 as uuidv4 } from 'uuid';
// import axios from "axios";
import './Form.css';
import './Loader.scss';


const Loader = () => (
  <div class="loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
);

const delay = ms => new Promise(res => setTimeout(res, ms));

class MasterForm extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        currentStep: 0,
        userChoices: [],
        selected: -1,
        showError: false,
        loading: false,
        UserInfoError: false,
        userInfo: {
          name: "",
          email: "",
          gender: "",
          complete: false
        }
      }
      this.maxSteps = 3;
      this.updateSelected = this.updateSelected.bind(this);
      this.submitChoice = this.submitChoice.bind(this);
      this.updateShowError = this.updateShowError.bind(this);
      this.updateUserInfoError = this.updateUserInfoError.bind(this);
      this.updateUserInfo = this.updateUserInfo.bind(this);
      this.uuid = uuidv4();
      this.mturk = false;
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
            {
            query_title : "Pick a team",
            data: [{
              title: "FC Barcelona",
              description: "Spain",
              data: this.graphData
            },{
              title: "Bayern Munich",
              description: "Germany",
              data: this.graphData
            },{
              title: "Indifferent 🤷‍♀️ ",
              description: "I don't like either option more than the other",
              data: []
            }]
          },
          {
            query_title : "Pick a company",
            data: [{
              title: "Apple",
              description: "Cupertino, CA",
              data: this.graphData
            },{
                title: "Microsoft",
                description: "Redmond, WA",
                data: this.graphData
            },{
              title: "Indifferent 🤷‍♀️ ", 
              description: "I don't like either option more than the other",
              data: []
            }]   
          },
          {
            query_title : "Pick a fruit",
            data: [
              {
                title: "Apples",
                  description: "some text",
                  data: this.graphData
              },{
                  title: "Oranges",
                  description: "Cara cara are the best",
                  data: this.graphData
              },{
                title: "Indifferent 🤷‍♀️ ", 
                description: "I don't like either option more than the other",
                data: []
              }
            ]

          }
      ]
    }

  

  async componentDidMount() {
    
    // get IP info
    const response = await fetch('https://geolocation-db.com/json/');
    const data = await response.json();
    this.setState({ ip: data.IPv4 })
    // parse query string info
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    // only want param mturk
    if(params['mturk']){
      this.mturk = true;
    }

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
    _start_questions = (e) => {
      e.preventDefault();
      if(this.state.userInfo.complete){
        let currentStep = this.state.currentStep;
        currentStep = currentStep >= this.maxSteps-1? this.maxSteps: currentStep + 1
        this.setState({
          currentStep: currentStep
        })
      } else {
        this.setState({
          UserInfoError: true
        });
      }
      
        

      
    }

    updateUserInfo(info) {
      // handle formValues somehow ending up in parent state?
      var toUpdate = info;
      if(toUpdate['formObj'].formValues){
        delete toUpdate['formObj'].formValues;
      }
      console.log(Object.keys(toUpdate['errors']).length);

      if(Object.keys(toUpdate['errors']).length === 0){
        toUpdate['formObj']['complete'] = true;
      }

      this.setState(
        {
          userInfo: toUpdate['formObj'],
          
        }, function(){
        console.log("state in parent");
        console.log(this.state.userInfo);
        console.log("size of errors object");
        console.log(Object.keys(toUpdate['errors']).length);
      });
    }

    showLoading = async () => {
      await delay(5000);
      this.setState({
        loading: false
      });
    }

    post_request(){
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'React POST Request Example' })
      };
      fetch('https://jsonplaceholder.typicode.com/posts', requestOptions)
          .then(response => {
            // const data = response.json();
            // delay(2000);
            this.setState({loading: false });
          } );
    }

    scrollTop = () =>{
      window.scrollTo({top: 0, behavior: 'smooth'});
    };

    _next(){
      // update current step and selected in state
      let currentStep = this.state.currentStep;
      currentStep = currentStep >= this.maxSteps-1? this.maxSteps: currentStep + 1
      this.setState({
        currentStep: currentStep,
        selected: -1
      });
      
      // wait two seconds, show loading then stop showing loading
      
      this.setState({
        loading: true
      }, function(){
        this.showLoading();  
      });
      
      

      // scroll up to the top of the container
      this.scrollTop();
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
        currentStep: 0,
        userChoices: [],
        selected: -1
      })
    }

    updateSelected(selected){
        this.setState({
        selected: selected
        })
    }

    updateShowError(show){
      this.setState({
      showError: show
      })
    }
    updateUserInfoError(show){
      this.setState({
      UserInfoError: show
      })
    }

    finalSubmit(){
      // We want to lop over each of the choices made and post each of them to the db
        let [choice1, choice2, choice3] = this.state.userChoices;
        alert(`Your choices: \n 
             Choice 1: ${this.choiceData[0]['data'][choice1]['title']} \n 
             Choice 2: ${this.choiceData[1]['data'][choice2]['title']} \n
             Choice 3: ${this.choiceData[2]['data'][choice3]['title']} \n
             Your IP: ${this.state.ip} \n
             Your UUID: ${this.uuid} \n
             MTurk worker: ${this.mturk}\n
        This is where we will send the results back to the server`);
        this._goToEnd();
    }

    displayChoices = () => {
      let [choice1, choice2, choice3] = this.state.userChoices;
      console.log(this.mturk);
        return(
          <div>
            <ul>
              <li>
                Choice 1: {this.choiceData[0]['data'][choice1]['title']}
              </li>
              <li>
                Choice 2: {this.choiceData[1]['data'][choice2]['title']}
              </li>
              <li>
                Choice 3: {this.choiceData[2]['data'][choice3]['title']}
              </li>
              
            </ul>
            <p>
              Your IP: {this.state.ip}
            </p>
            <p>
              Your UUID: {this.uuid}
            </p>
            <p>
              MTurk worker: {this.mturk.toString()}
            </p>

          </div>
          );
    }

    onSubmitDecision(e){
      e.preventDefault();
      if(this.state.selected === -1){
        alert("Please choose an option!")
      }
    }

    

    submitChoice = (e) => {
      
      e.preventDefault();
      if(this.state.selected === -1){
        // alert("Please choose an option!")
        this.setState({
          showError: true
        })
          
      } else{
        // hide the error message
        this.setState({
          showError: false
        }); 
        // record the choice made
        this.state.userChoices.push(this.state.selected);
        // console.log(this.state.userChoices);


          if(this.state.currentStep === this.maxSteps){
            // then we want to submit the results
            this.finalSubmit();
          } else{
            // move to next question
            this._next();
          }
        }
      }
        
        
    


    
    render() { 
      var numSteps = Array(this.maxSteps).fill().map((element,index) => index+1);
      return (
        <React.Fragment>
        <h1>Active Preference Elicitation <span role="img" aria-label="crystal ball">🔮</span> </h1>
        {/* Only show the step once current step > 0 */}
        <p>Step {this.state.currentStep} </p> 
  
        {/* <form onSubmit={this.handleSubmit}> */}
        {/* <form> */}
        {/* 
          render the form steps and pass required props in
        */}
          <StartPage
            currentStep={this.state.currentStep} 
            _start_questions={this._start_questions}
            formInfo={this.state.userInfo}
            updateUserInfo={this.updateUserInfo}
            UserInfoError={this.state.UserInfoError}
            updateUserInfoError={this.updateUserInfoError}
          />
    
          {/* <Steps 
            currentStep={this.state.currentStep} 
            maxSteps={this.maxSteps}
            handleChange={this.handleChange}
            choiceData={this.choiceData}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
            currently_selected={this.state.selected}
            default_selected={-1}

            showError={this.state.showError}
            updateShowError={this.updateShowError}
          /> */}
          {/* Is there some way that we can dynamically create these steps and be able to update selected? */}
          {/* <Step
              currentStep={this.state.currentStep} 
              maxSteps={this.maxSteps}
              handleChange={this.handleChange}
              choiceData={this.choiceData}
              updateSelected={this.updateSelected}
              submitChoice={this.submitChoice}
              currently_selected={this.state.selected}
              selectedCard={this.state.selectedCard}
              resetCard={this.state.resetCard}
              updateResetCard={this.updateResetCard}
  
              showError={this.state.showError}
              updateShowError={this.updateShowError} 
              _reset_selected={this._reset_selected}
              /> */}
          {/* {numSteps.map((element, idx) => { 
            return(
              <Step element={element}
              currentStep={this.state.currentStep} 
              maxSteps={this.maxSteps}
              handleChange={this.handleChange}
              choiceData={this.choiceData}
              updateSelected={this.updateSelected}
              submitChoice={this.submitChoice}
              currently_selected={this.state.selected}
  
              showError={this.state.showError}
              updateShowError={this.updateShowError} /> 
              )
          })
            }
           */}
          <Step1 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            data={this.choiceData[this.state.currentStep -1]}
            choiceData={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
            currently_selected={this.state.selected}

            showError={this.state.showError}
            updateShowError={this.updateShowError}
            loading={this.state.loading}
          />
          <Step2 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            data={this.choiceData[this.state.currentStep -1]}
            choiceData={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
            currently_selected={this.state.selected}

            showError={this.state.showError}
            updateShowError={this.updateShowError}
            loading={this.state.loading}
          />
          <Step3 
            currentStep={this.state.currentStep} 
            handleChange={this.handleChange}
            data={this.choiceData[this.state.currentStep -1]}
            choiceData={this.choiceData[this.state.currentStep -1]}
            updateSelected={this.updateSelected}
            submitChoice={this.submitChoice}
            currently_selected={this.state.selected}

            showError={this.state.showError}
            updateShowError={this.updateShowError}
            loading={this.state.loading}
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

  // function Steps(props){
  //   var numSteps = Array(props.maxSteps).fill().map((element,index) => index+1);
  //   var allSteps =  numSteps.map((element, idx) => {
  //       return(Step(props, element))
  //   });
  //   // console.log(props.currentStep)
  //   if(props.currentStep < 1 | props.currentStep > props.maxSteps){
  //     return null
  //   }
  //   return(allSteps[ props.currentStep - 1 ])
  
    
  // }

  // function Step(props){
  //   if(props.currentStep < 1 | props.currentStep > props.maxSteps){
  //       return null
  //     }
  //   return(
  //       <div className="container">
  //           <Example title= {props.choiceData[(props.currentStep)-1]['query_title']} 
  //           cardContents={props.choiceData[props.currentStep-1]['data']} 
  //           submitChoice={props.submitChoice}
  //           updateSelected={props.updateSelected}
  //           showError={props.showError} 
  //           updateShowError={props.updateShowError}
  //           default_selected={props.default_selected}
  //           _reset_selected={props._reset_selected}
  //           selectedCard={props.selectedCard}
  //           resetCard={props.resetCard}
  //           updateResetCard={props.updateResetCard}
  //           />
  //       </div>
  //   )
  // }
  
  function Step1(props) {
    if (props.currentStep !== 1) {
      return null
    } 
    return(
        <div className="container">
            <Example 
            title={props.choiceData['query_title']}
            cardContents={props.choiceData['data']} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected}
            showError={props.showError} 
            updateShowError={props.updateShowError}
            loading={props.loading}
            />
        </div>
        
            
      
      
    );
  }
  
  function Step2(props) {
    if (props.currentStep !== 2) {
      return null
    } 
    return(
        <div className="container">
            <Example 
            title={props.choiceData['query_title']}
            cardContents={props.choiceData['data']} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected}
            showError={props.showError} 
            updateShowError={props.updateShowError}
            loading={props.loading}
            />
        </div>
      
    );
  }
  
  function Step3(props) {
    if (props.currentStep !== 3) {
      return null
    } 
    return(
      <div className="container">
        <Example 
            title={props.choiceData['query_title']}
            cardContents={props.choiceData['data']} 
            submitChoice={props.submitChoice}
            updateSelected={props.updateSelected}
            showError={props.showError} 
            updateShowError={props.updateShowError}
            loading={props.loading}
            />
      </div>
    )
  }

  function StartPage(props){
    if (props.currentStep !== 0) {
      return null
    } 
    return(
      <div className="container">
          <h1 className="title">Welcome!</h1>
          <p>
            Click on the "Start" button to start answering the questions
          </p>
          <div className="col-lg-6 offset-lg-3 ">
            <div className="row justify-content-center">
            <UserInfoForm initialState={props.formInfo} updateUserInfo={props.updateUserInfo} />
            </div>

          </div>
          
          <UserInfoFormError showError={props.UserInfoError} updateShowError={props.updateUserInfoError} />
          <button 
            className="btn btn-primary" form='user-info'
            type="submit" value="submit" onClick={props._start_questions}>
            Start
            </button>                  
      </div>
    )
  }

  function EndPage(props) {
    // console.log(props.currentStep)
    if (props.currentStep !== props.maxSteps + 1) {
      return null
    } 
    return(
        <div className="container">
          <h1 className="title">All done!</h1>
          <p>
            Thanks for participating here are the choices you made:
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

  function UserInfoFormError(props) {
    // const [show, setShow] = useState(false);
  
    if (!props.showError) {
      return null
    }
    return (
      <div class="d-flex justify-content-center">
        <Alert variant="danger" className="text-center" onClose={() => props.updateShowError(false)} dismissible>
          <Alert.Heading>Form Error</Alert.Heading>
          <p>
            Please enter information for all fields.
          </p>
        </Alert>
      </div>
    );
    
  }

  function AlertDismissibleExample(props) {
    // const [show, setShow] = useState(false);
  
    if (!props.showError) {
      return null
    }
    return (
      <div class="d-flex justify-content-center">
        <Alert variant="danger" className="text-center" onClose={() => props.updateShowError(false)} dismissible>
          <Alert.Heading>Error</Alert.Heading>
          <p>
            Please click/tap on one of the three options.
          </p>
        </Alert>
      </div>
    );
    
  }
  class Example extends React.Component {
    onListChanged(selected) {
        this.setState({
        selected: selected,
        });
        this.props.updateSelected(selected);
        this.props.updateShowError(false);
    }


    render() {
      return (
        <div className="column">
          {this.props.loading ? <Loader /> : null}

            {this.props.loading ? null : <div>
              <h1 className="title">{this.props.title}</h1>
              <SelectableCardList 
                multiple={this.props.multiple}
                maxSelectable={this.props.maxSelectable}
                contents={this.props.cardContents}
                onChange={this.onListChanged.bind(this)}/>
                {/* On click we want to move to the next choice and store this information.
                I think we can use _next but we need to add in the info for the choices */}
                <AlertDismissibleExample showError={this.props.showError} updateShowError={this.props.updateShowError}  />
                <button className="card" onClick={e => {
                  this.props.submitChoice(e);
                }}>
                  Submit selection
                </button>
            </div>}
            
        </div>);
    }
  }
  

export default MasterForm;