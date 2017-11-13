import * as types from '../actions/dataActionTypes';

export default function dataReducer(state = {}, action) {
    switch (action.type) {
        case types.DATA__FETCH_DATA_PENDING:
            return Object.assign({}, action.data, {pending: true});
        case types.DATA__FETCH_DATA_SUCCESS:
            return Object.assign({}, action.data, {pending: false});
        default:
            return state;
    }
}