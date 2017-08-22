import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as FiltersActions from '../../actions/filters';
import * as FilterSetsActions from '../../actions/filterSets';

class CollectionFiltersCheckbox extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  filterIsApplied() {
    const filters = this.props.filters;
    for (let i = 0; i < filters.length; i++) {
      if (filters[i].slug === this.props.filter.slug) {
        return i;
      }
    }
    return -1;
  }

  handleClick(event) {
    event.preventDefault();

    const filter = this.props.filter;
    if (this.props.filters.length === 0) {
      this.props.addToFilters(filter);
    } else {
      const index = this.filterIsApplied();
      if (index === -1) {
        this.props.addToFilters(filter);
      } else {
        this.props.removeFilterByIndex(index);
      }
    }
  }

  render() {
    const value = this.props.filter.displayValue;
    return (
      <button
        onClick={this.handleClick}
        //Temporary styling for dramatic effect.
        style={{background: value, color: 'white'}}>
        {value}{this.props.filter.applied ? ' (applied)' : ''}
      </button>
    );
  }
}

const mapStateToProps = state => {
  return {
    filters: state.filters,
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(Object.assign({},
    FiltersActions,
    FilterSetsActions,
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionFiltersCheckbox);