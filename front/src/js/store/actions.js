export const getMatchingCount = ({ commit }) => {
    fetch('/api/count.json', {})
        .then(() => {
            commit('setMatchingCount', {
                count: 10
            });
        });
};

export const getDetail = ({ commit }, params) => {
    const token = params.token;
    fetch(`/api/detail.json?token=${token}`, {})
        .then(() => {
            commit('setMatchingCount', {
                count: 10
            });
        });
};
