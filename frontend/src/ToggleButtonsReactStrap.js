import React, { useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';

function ButtonGroupReactStrap(props) {
  const [rSelected, setSelected] = useState("");
  const handleSelected = (newSelected) => {
    if(newSelected === null){
      setSelected("");
      props.onSelectChange("");
      props.toggleDisabled(true);
    } else{
      console.log("newSelected", newSelected);
      setSelected(newSelected);
      // also need to lift this information up through props
      props.onSelectChange(newSelected);
      props.toggleDisabled(false);
    }
  };

  return (
    <div>
      <ButtonGroup id="choices_button_group" className="me-2">
        <Button
          color="primary"
          outline
          onClick={() => handleSelected(1)}
          // onClick={handleSelected()}
          active={rSelected === 1}
        >
          Policy A
        </Button>
        <Button
          color="primary"
          outline
          onClick={() => handleSelected(-1)}
          active={rSelected === -1}
        >
          Policy B
        </Button>
        <Button
          color="primary"
          outline
          onClick={() => handleSelected(0)}
          active={rSelected === 0}
        >
          Indifferent
        </Button>
      </ButtonGroup>
    </div>
  );
}

export default ButtonGroupReactStrap;