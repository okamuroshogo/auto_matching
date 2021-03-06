import Cookies from 'js-cookie';

function fetchApi(endpoint, params, options) {
    // const domain = 'https://wqcgcdtbn5.execute-api.ap-northeast-1.amazonaws.com/dev';
    // const domain = 'https://75n6tmmj4d.execute-api.ap-northeast-1.amazonaws.com/dev';
    // const domain = '';

    const domain = 'https://kamatte.cc';
    const paramStr = Object.keys(params).map((key) => `${key}=${params[key]}`).join('&');
    return fetch(`${domain}/api/v1/${endpoint}?${paramStr}`, { ...options, mode: 'cors' })
        .then((res) => res.json());
}

export const getMatchingCount = ({ commit }) => {
    fetchApi('matching_count', {})
        .then((data) => {
          console.log(data);
            commit('setMatchingCount', {
                count: data.count
            });
        });
};

export const getDetailData = ({ commit }, params) => {
    const matching_id = params.matchingId;
    fetchApi('reservation', { matching_id })
        .then((data) => {
            const item = data.matching.Item;
            // console.log('data: ', item);
            // if (!item) {
            //     reject();
            // }
            item.shopImageUrl = item.shopImageUrl || "https://imgfp.hotp.jp/IMGH/05/41/P027280541/P027280541_480.jpg"
            commit('setDetailData', { data: item });
            // commit('setDetailData', {
            //     id: "fb294d07-011f-49d8-a23d-670228aca7c5",
            //     screenName1: "ttsh_ymmt",
            //     screenName2: "doubutukyushutu",
            //     shopAddress: "東京都豊島区西池袋１-4-5　佐々木ビル1階",
            //     shopName: "モンパルナス Montparnasse",
            //     shopReservationUrl: "https://www.hotpepper.jp/strJ001155250/yoyaku",
            //     shopUrl: "https://www.hotpepper.jp/strJ001155250/?vos=nhppalsa000016",
            //     shopImageUrl: "https://imgfp.hotp.jp/IMGH/05/41/P027280541/P027280541_480.jpg",
            //     tweetID1: "916803619877355520",
            //     tweetID2: "916803810567249920",
            //     userID1: "871270181225381889",
            //     userID2: "281961139",
            //     userImageUrl1: "http://pbs.twimg.com/profile_images/871274938321129473/XVkuCOON_normal.jpg",
            //     userImageUrl2: "http://pbs.twimg.com/profile_images/1360865951/Image002_normal.jpg",
            //     userStatus1: 0,
            //     userStatus2: 0
            // });
        }).catch(() => {
            // location.href = '/';
        });
};

export const getUserId = ({ commit }) => {
    // Cookies.set('user_id', '11111');
    return commit('setUserId', {
        userId: Cookies.get('user_id'),
    });
};

export const postReservation = ({ commit }, params) => {
    // console.log(params);
    const matching_id = params.matchingId;
    const user_id = params.userId;
    // let childWindow = window.open('about:blank');

    commit('setBtnState', { btnState: { isReserveBtnActive: false } });
    fetchApi('reservation', {}, { method: 'post', body: JSON.stringify({ matching_id, user_id }) })
        .then((data) => {
            // console.log(data);
            if (!data.success) Promise.reject();
            if (data.location) {
                location.href = data.location;
                // childWindow.close();
                // childWindow = null;
            }
            if (data.reservationURL) {
                location.href = data.reservationURL;
                // open(data.reservationURL, '_blank');
                // childWindow.location.href = data.reservationURL;
                // childWindow = null;
            }
            // commit('setDetailData', data);
        }).catch(() => {
            // location.href = '/';
            // childWindow.close();
            // childWindow = null;
        });
};

export const postLike = ({ commit }, params) => {
    // console.log(params);
    const matching_id = params.matchingId;
    const user_id = params.userId;
    commit('setBtnState', { btnState: { isIkitaiBtnActive: false } });
    fetchApi('like', {}, { method: 'post', body: JSON.stringify({ matching_id, user_id }) })
        .then((data) => {
            // console.log(data);
            if (!data.success) Promise.reject();
            if (data.location) {
                location.href = data.location;
            }
        }).catch(() => {
            // location.href = '/';
        });
};
