import React from 'react';
import './Loader.scss';

class Loader extends React.Component{
  constructor(props){
    super(props);
    this.wrapup = this.props.wrapup
  }

  render(){
    if(!this.props.loading){
      return(null);
    }
    return(
      <>
    <div class="loading">
      <div></div>
      <div></div>
      <div></div>
    </div>
    <div  class="text-center">
      {this.wrapup ? 
      <h1>Submitting your responses, please do not refresh the page</h1>:
      <h1>Loading next response, please do not refresh the page</h1>
      
      }
      
    </div>
    
    </>
    )
  }
}

// function Loader(props){
//   const loading = props.loading;
//   if(!loading){
//     return null;
//   }
//     return(
//       <>
//     <div class="loading">
//       <div></div>
//       <div></div>
//       <div></div>
//     </div>
//     <div  class="text-center">
//       {props.wrapup ? 
//       <h1>Submitting your responses, please do not refresh the page</h1>:
//       <h1>Loading next response, please do not refresh the page</h1>
      
//       }
      
//     </div>
    
//     </>
//     )
// }; 

export default Loader;