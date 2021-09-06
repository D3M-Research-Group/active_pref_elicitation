import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

export default function ToggleButtons(props) {
  const [selected, setSelected] = React.useState("");

  const handleSelected = (event, newSelected) => {
    setSelected(newSelected);
    // also need to lift this information up through props
    props.onSelectChange(newSelected);
    props.toggleDisabled();
  };

  return (
    <ToggleButtonGroup
      value={selected}
      exclusive
      onChange={handleSelected}
      aria-label="policy choices"
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