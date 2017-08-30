import * as ActionTypes from '../constants';

const initialState = {
  colors: [],
  line: {
    composition: null,
    linearity: null
  },
  line: null,
  space: null,
  ordered: []
};

const filters = (state = initialState, action) => {
  switch(action.type) {
    case ActionTypes.ADD_COLOR_FILTER:
      return Object.assign({}, state, {colors: [...state.colors, action.filter], ordered: [...state.ordered, action.filter]});
    case ActionTypes.REMOVE_COLOR_FILTER:
      let modifiedState = Object.assign({}, state);

      const removeSlug = state.ordered[action.index].slug;
      const removeColorIndex = findIndexBySlug(state.colors, removeSlug);

      modifiedState.ordered = [
        ...modifiedState.ordered.slice(0, action.index),
        ...modifiedState.ordered.slice(action.index + 1)
      ];

      modifiedState.colors = [
        ...modifiedState.colors.slice(0, removeColorIndex),
        ...modifiedState.colors.slice(removeColorIndex + 1)
      ];

      return modifiedState;
    case ActionTypes.REMOVE_FILTER_BY_INDEX:

      return [...state.slice(0, action.index), ...state.slice(action.index + 1)];
    case ActionTypes.REMOVE_FILTER_BY_SLUG:
      const index = findIndexBySlug(state, action.slug);
      return [...state.slice(0, index), ...state.slice(index+1)];
    case ActionTypes.CLEAR_ALL_FILTERS:
      return [];
    default:
      return state;
  }
}

function findIndexBySlug(filters, slug) {
  for (let i = 0; i < filters.length; i++) {
    if (filters[i].slug === slug) {
      return i;
    }
  }
  return -1;
}

export default filters;
