import './Loader.scss';


const Loader = (props) => (
  <>
  <div class="loading">
    <div></div>
    <div></div>
    <div></div>
  </div>
  <div class="text-center">
    {props.wrapup ? 
    <h1>Loading next response, please do not refresh the page</h1> :
    <h1>Submitting your responses, please do not refresh the page</h1>
    }
    
  </div>
  
  </>
  
);

export default Loader;