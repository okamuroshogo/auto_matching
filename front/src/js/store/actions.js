// const domain = 'https://wqcgcdtbn5.execute-api.ap-northeast-1.amazonaws.com/dev';
// const domain = 'https://75n6tmmj4d.execute-api.ap-northeast-1.amazonaws.com/dev';
const domain = '';

export const getMatchingCount = ({ commit }) => {
    fetch(domain + '/api/v1/matching_count', { mode: 'cors' })
        .then((data) => {
            commit('setMatchingCount', {
                count: data.count
            });
        });
};

export const getDetailData = ({ commit }, params) => {
    const id = params.id;
    fetch(domain + `/api/v1/reservation_status?matching_id=${id}`, { mode: 'cors' })
        .then((res) => res.json())
        .then((data) => {
            const item = data.matching.Item;
            console.log('data: ', item);
            item.shopImageUrl = item.shopImageUrl || "https://imgfp.hotp.jp/IMGH/05/41/P027280541/P027280541_480.jpg"
            commit('setDetailData', item);
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
        });
};
