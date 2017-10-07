export const getMatchingCount = ({ commit }) => {
    fetch('/api/count.json', {})
        .then(() => {
            commit('setMatchingCount', {
                count: 10
            });
        });
};
