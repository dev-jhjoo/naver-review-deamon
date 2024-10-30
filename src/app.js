import dotenv from 'dotenv';
import axios from 'axios';
import xlsx from 'xlsx';

import { naverReview } from './query/query_set.js';

// sleep 함수: 주어진 시간(ms) 만큼 대기하는 Promise 반환
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 3~6초 사이의 랜덤 시간 생성
// 반복요청 reject 회피를 위함
const getRandomSleepTime = () => {
    const min = 3000;
    const max = 6000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function sendPostRequest(url, totalCount) {
    // 리뷰 요청당 개수
    const size = 10;

    // 엑셀 워크북 생성
    const workbook = xlsx.utils.book_new();

    // 워크시트에 넣을 데이터
    const worksheetData = [
        ['id','reviewId','author_id','author_nickname','author_url',
        'author_review_totalCount','author_review_imageCount',
        'author_review_avgRating','author_followerCount','body','media',
        'visitCount','visited','created']
    ];

    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalCount / 10);
    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {

        const sleepTime = getRandomSleepTime();
        console.log(`${currentPage} page Sleeping for ${sleepTime / 1000} seconds...`);

        await sleep(sleepTime);

        try{
            const data = [{
                operationName:"getVisitorReviews",
                variables:{
                    input:{
                        "businessId":"1134852005",
                        "businessType":"hairshop",
                        "item":"4707321",
                        "bookingBusinessId":"686522",
                        "page":currentPage,
                        // Test진행시 페이지당 최대 size는 50으로 확인
                        "size":size, 
                        "isPhotoUsed":false,
                        "sort":"recent",
                        "includeContent":true,
                        "getUserStats":true,
                        "includeReceiptPhotos":true,
                        "cidList":["223267","223268","223288","1005133"],
                        "getReactions":true,
                        "getTrailer":true
                    },
                    id:"1134852005"
                },
                query: naverReview
            }];
    
            const response = await axios.post(
                url,
                data,
            )
    
            // parsing response data
            const resData = response.data;
            const items = resData[0].data.visitorReviews.items;
    
            for (const item of items){
                const reviewData = [
                    item.id,item.reviewId,item.author.id,item.author.nickname,item.author.url,
                    item.author.review.totalCount,item.author.review.imageCount,
                    item.author.review.avgRating,item.author.followerCount,item.body,
                    JSON.stringify(item.media),
                    item.visitCount,item.visited,item.created
                ]
                worksheetData.push(reviewData)
            }
    
        }catch(error){
            console.log('MyError:', error)
        }
    }

    // 워크시트 생성
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

    // 워크북에 워크시트 추가
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 엑셀 파일 저장
    const excelFilePath = './src/data/reviews.csv';
    xlsx.writeFile(workbook, excelFilePath);
}

// dotenv config set
dotenv.config();

// 환경 변수 사용
const url = process.env.ENV_URL; // naver place 주소
const totalCount = +process.env.ENV_TOTALCOUNT; // 총 review 개수

console.log('url, totalCount=', url, totalCount)

if(url && totalCount){
    await sendPostRequest(url, totalCount)
} else {
    console.log('Please check env!')
}
