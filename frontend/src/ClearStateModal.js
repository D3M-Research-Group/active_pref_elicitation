import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter
} from 'reactstrap';

class ClearStateModal extends React.Component {
    render(){
        console.log(this.props)
        return (
            <Modal
            toggle={this.props.toggle}
            isOpen={this.props.isOpen}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered>
                <ModalHeader>
                    <h4>Are you sure?</h4>
                </ModalHeader>
                <ModalBody>
                
                <p>
                    If you click the "Remove Progress" button, your questionnaire will reset
                     and you will need to re-enter your information.
                </p>
                </ModalBody>
                <ModalFooter>
                <Button onClick={this.props.toggle}>Cancel</Button>
                <Button color="danger" onClick={this.props.removeStateAndRestart}>Remove Progress</Button>
                </ModalFooter>
            </Modal>
        );
    }
    
}

// const ClearStateModal = (props) => {
//     return (
//       <Modal
//         {...props}
//         size="lg"
//         aria-labelledby="contained-modal-title-vcenter"
//         centered
//       >
//         <ModalHeader closeButton>
//           <Modal.Title id="contained-modal-title-vcenter">
//             Modal heading
//           </Modal.Title>
//         </ModalHeader>
//         <ModalBody>
//           <h4>Centered Modal</h4>
//           <p>
//             Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
//             dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
//             consectetur ac, vestibulum at eros.
//           </p>
//         </ModalBody>
//         <ModalFooter>
//           <Button onClick={props.onHide}>Close</Button>
//         </ModalFooter>
//       </Modal>
//     );
//   }
  
export default ClearStateModal;