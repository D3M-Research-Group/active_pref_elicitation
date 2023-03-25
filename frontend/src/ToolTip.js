import React, { useState } from 'react';
import { BsInfoCircleFill } from 'react-icons/bs';
import { Tooltip } from 'reactstrap';

function TooltipItem(props) {
  const { placement, text, id } = props;
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <span style={{verticalAlign: 'text-bottom'}}>
      <BsInfoCircleFill id={'Tooltip-' + id}/>
      <Tooltip
        placement={placement}
        isOpen={tooltipOpen}
        target={'Tooltip-' + id}
        toggle={toggle}
      >
        {text}
      </Tooltip>
    </span>
  );
}

// TooltipItem.propTypes = {
//   item: PropTypes.object,
//   id: PropTypes.string,
// };

// function TooltipExampleMulti(props) {
//   return (
//     <>
//       {[
//         {
//           placement: 'right',
//           text: 'Tooltip on Right',
//         },
//       ].map((tooltip, i) => {
//         // eslint-disable-next-line react/no-array-index-key
//         return <TooltipItem key={i} item={tooltip} id={i} />;
//       })}
//     </>
//   );
// }

export default TooltipItem;