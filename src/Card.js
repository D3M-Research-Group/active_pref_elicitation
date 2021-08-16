import React from 'react';
import BarChart from './BarChart';
import './Card.scss'

class Card extends React.Component {
    render() {
      return (<div className="card">{this.props.children}</div>)
    }
  }
  
  class SelectableCard extends React.Component {
  
    render() {
      var isSelected = this.props.selected ? "selected" : "";
      var className = "selectable " + isSelected;
      return (
        <Card>
          <div className={className} onClick={this.props.onClick}>
            {this.props.children}
            <div className="check"><span className="checkmark">✔</span></div>
          </div>
        </Card>
      );
    }
  }
  
  class SelectableTitleCard extends React.Component {
  
    render() {
      var {
        title,
        description,
        selected,
        data
      } = this.props;
      return (
        
          <div className="col-lg-6">
            <SelectableCard onClick={this.props.onClick}
              selected={selected}>
              <div className="content">
                <h1 className="title">{title}</h1>
                <p className="description">{description}</p>
                <BarChart data={data}/>
              </div>
            </SelectableCard>
          </div>
        
      );
    }
  }
  
  class SelectableCardList extends React.Component {
  
    constructor(props) {
      super(props);
      var selected = props.multiple ? [] : -1;
      var initialState = {
        selected: selected
      };
      this.state = initialState;
    }
  
    onItemSelected(index) {
      this.setState((prevState, props) => {
        if (props.multiple) {
          var selectedIndexes = prevState.selected;
          var selectedIndex = selectedIndexes.indexOf(index);
          if (selectedIndex > -1) {
            selectedIndexes.splice(selectedIndex, 1);
            props.onChange(selectedIndexes);
          } else {
            if (!(selectedIndexes.length >= props.maxSelectable)) {
              selectedIndexes.push(index);
              props.onChange(selectedIndexes);
            }
          }
          return {
            selected: selectedIndexes
          };
        } else {
          props.onChange(index);
          return {
            selected: index
          }
        }
      });
    }
  
    render() {
      var {
        contents,
        multiple
      } = this.props;
  
      var content = contents.map((cardContent, i) => {
        var {
          title,
          description,
          data,
          selected
        } = cardContent;
        var selected = multiple ? this.state.selected.indexOf(i) > -1 : this.state.selected === i;
        return (
          
            <SelectableTitleCard key={i} 
            title={title} description={description} data={data}
            selected={selected} 
            onClick={(e) => this.onItemSelected(i)} />
          
        );
      });
      return (
          <div className="cardlist">
            <div className="row">
              {content}
            </div>
          </div>
      );
    }
  }
  
//   class Example extends React.Component {
//     onListChanged(selected) {
//       this.setState({
//         selected: selected
//       });
//     }
//     submit() {
//       window.alert("Selected: " + this.state.selected);
//     }
//     render() {
//       return (
//         <div className="column">
//             <h1 className="title">{this.props.title}</h1>
//             <SelectableCardList 
//               multiple={this.props.multiple}
//               maxSelectable={this.props.maxSelectable}
//               contents={this.props.cardContents}
//               onChange={this.onListChanged.bind(this)}/>
//             <button className="card" onClick={(e) => this.submit() }>
//               Get selected
//             </button>
//         </div>);
//     }
//   }
  
  
//   var teams = [{
//     title: "FC Barcelona",
//     description: "Spain"
//   }, {
//     title: "Real Madrid",
//     description: "Spain"
//   }, {
//     title: "Bayern Munich",
//     description: "Germany"
//   }, {
//     title: "Juventus",
//     description: "Italy"
//   }];
  
//   var genres = [{
//     title: "Google",
//     description: "Mountain View, CA"
//   }, {
//     title: "Apple",
//     description: "Cupertino, CA"
//   }, {
//     title: "Microsoft",
//     description: "Redmond, WA"
//   }, {
//     title: "Facebook",
//     description: "Menlo Park, CA"
//   }];
  
//   class App extends React.Component {
//     render() {
//       return (
//         <div>
//           <Example title="Pick a team" cardContents={teams} />
//           <Example title="Choose brands (3 max)" cardContents={genres} multiple maxSelectable={3} />
//         </div>
//       );
//     }
//   }
export default SelectableCardList;