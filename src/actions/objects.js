import axios from 'axios';
import * as ActionTypes from '../constants';

const setObjects = (objects) => {
  return {
    type: ActionTypes.SET_OBJECTS,
    payload: objects
  };
}

export const getObjects = () => {
  return (dispatch) => {
    axios.get('/api/search', {
      params: {
        q: 'highlight:true'
      }
    }).then((response) => {
      const objects = response.data.hits.hits.map(object => object._source);
      console.log(objects);
      dispatch(setObjects(objects));
    });
  }
};

export const findObjectsByKeyword = (query) => {
  return (dispatch) => {
    axios.get('/api/search', {
      params: {
        q: `_all:${query}`
      }
    }).then((response) => {
      const objects = response.data.hits.hits.map(object => Object.assign({}, object._source, { id: object._id }));
      console.log(objects);
      dispatch(setObjects(objects));
    });
  }
}