import {find, findIndex} from 'lodash';

const initState = {
  fetchStatus: 'init',
  ctors: [],
  error: null
};

const ctors = (state = initState, action) => {
  const nextState = {...state};

  switch (action.type) {
    case 'FETCH_CTORS_REQUEST':
      nextState.fetchStatus = 'request';
      return nextState;

    case 'FETCH_CTORS_FAILURE':
      nextState.fetchStatus = 'error';
      nextState.error = action.error;
      return nextState;

    case 'FETCH_CTORS_SUCCESS':
      nextState.fetchStatus = 'success';
      action.ctors.forEach(ctor => {
        switch (ctor.ctor_name) { // Temporary block until image management implemented
          case 'Simple ICO':
            ctor.image = 'contract-ico.jpg';
            break;
          case 'ERC20 token':
            ctor.image = 'contract-erc20.jpg';
            break;
          case 'Equity token':
            ctor.image = 'contract-equity.jpg';
            break;
          case 'Multisignature wallet':
            ctor.image = 'contract-multisig.jpg';
            break;
          case 'Simple voting':
            ctor.image = 'contract-voting.jpg';
            break;
          default:
        }
        const i = findIndex(nextState.ctors, {ctor_id: ctor.ctor_id});
        if (i >= 0) {
          nextState.ctors[i] = Object.assign(nextState.ctors[i], ctor);
        } else {
          nextState.ctors.push(ctor);
        }
      });
      return nextState;

    case 'FETCH_CTOR_PARAMS_REQUEST':
      let ctor = find(nextState.ctors, {ctor_id: action.ctorId});
      if (ctor) {
        ctor.fetchStatus = 'request';
      } else {
        nextState.ctors.push({
          ctor_id: action.ctorId,
          fetchStatus: 'request'
        });
      }
      return nextState;

    case 'FETCH_CTOR_PARAMS_FAILURE':
      ctor = find(nextState.ctors, {ctor_id: action.ctorId});
      ctor.fetchStatus = 'error';
      ctor.error = action.error;
      return nextState;

    case 'FETCH_CTOR_PARAMS_SUCCESS':
      let i = findIndex(nextState.ctors, {ctor_id: action.ctorId});
      if (i >= 0) {
        nextState.ctors[i] = Object.assign(
          nextState.ctors[i],
          action.ctorParams,
          {
            ctor_id: action.ctorId,
            fetchStatus: 'success'
          }
        );
      }
      return nextState;

    default:
      return state;
  }
};

export default ctors;
