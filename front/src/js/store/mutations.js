export const setMatchingCount = (state, { count }) => {
    state.matchingCount = count;
};

export const setMatchingId = (state, { matchingId }) => {
    state.matchingId = matchingId;
};

export const setDetailData = (state, data) => {
    state.detailData = data;
};

export const setBtnState = (state, { btnState }) => {
    state.btnState = {...state.btnState, btnState};
};

export const setUserId = (state, { userId }) => {
    state.userId = userId;
};
