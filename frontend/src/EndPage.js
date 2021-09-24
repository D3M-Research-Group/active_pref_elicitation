import React from 'react';
import {
    Container
} from 'reactstrap';

class EndPage extends React.Component {
    // constructor(props){
    //     super(props)
    // }

    render(){
        if(!this.props.showEndPage){
            return null;
        }

        return(
            
            <React.Fragment>
                <Container>
                <h2>Thank you for taking the quiz!</h2>
                <p className="lead">
                    You may now close this page.
                </p>
                </Container>
            </React.Fragment>
            
            
        )
    }
}
export default EndPage;