export const setMatchingCount = (state, { count }) => {
    state.matchingCount = count;
};

export const setDetailData = (state, data) => {
    console.log(data);
    state.detailData = data;
};
