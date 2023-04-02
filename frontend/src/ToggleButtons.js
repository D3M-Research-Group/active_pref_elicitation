import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React from 'react';

export default function ToggleButtons(props) {
  const [selected, setSelected] = React.useState("");

  const handleSelected = (event, newSelected) => {
    if(newSelected === null){
      //they deselected the current option
      
      setSelected("");
      props.onSelectChange("");
      props.toggleDisabled(true);
    } else {
      console.log("newSelected", newSelected);
      setSelected(newSelected);
      // also need to lift this information up through props
      props.onSelectChange(newSelected);
      props.toggleDisabled(false);
    }
    
  };

  return (
    <ToggleButtonGroup
      value={selected}
      exclusive
      onChange={handleSelected}
      aria-label="policy choices"
      id="choices_button_group"
      size='small'
    >
      <ToggleButton className="bottom_navbar" value="1" >
        Policy A
      </ToggleButton>
      <ToggleButton className="bottom_navbar" value="-1" >
        Policy B
      </ToggleButton>
      <ToggleButton className="bottom_navbar" value="0">
        Indifferent
      </ToggleButton>
    </ToggleButtonGroup>
  );
}