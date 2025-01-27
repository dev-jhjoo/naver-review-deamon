import dotenv from 'dotenv';
import axios from 'axios';
import xlsx from 'xlsx';

import { naverReview } from './query/query_set.js';

// sleep 함수: 주어진 시간(ms) 만큼 대기하는 Promise 반환
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 3~6초 사이의 랜덤 시간 생성
// 반복요청 reject 회피를 위함
const getRandomSleepTime = () => {
    const min = 2000;
    const max = 3000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function sendPostRequest(url, totalCount, fileName) {
    // 리뷰 요청당 개수
    const size = 50;
    // 전체 페이지 수 계산
    const totalPages = Math.ceil(totalCount / size);

    // 엑셀 워크북 생성
    let workbook;

    // 엑셀 파일 저장경로
    const excelFilePath = `./src/data/${fileName}.csv`;

    try {
        workbook = xlsx.readFile(excelFilePath);
    } catch (error) {
        workbook = xlsx.utils.book_new();
        const worksheetData = [
            ['id', 'reviewId', 'author_id', 'author_nickname', 'author_url', 
                'author_review_totalCount', 'author_review_imageCount', 
                'author_review_avgRating', 'author_followerCount', 'body', 'bookingItemName', 'media', 
                'visitCount', 'visited', 'created']
        ];
        const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        xlsx.writeFile(workbook, excelFilePath);
    }

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {

        const sleepTime = getRandomSleepTime();
        console.log(`${currentPage} page Sleeping for ${sleepTime / 1000} seconds...`);

        await sleep(sleepTime);

        try{
            // const data = [{
            //     operationName:"getVisitorReviews",
            //     variables:{
            //         input:{
            //             "businessId":"1134852005",
            //             "businessType":"hairshop",
            //             "item":"4707321",
            //             "bookingBusinessId":"686522",
            //             "page":currentPage,
            //             // Test진행시 페이지당 최대 size는 50으로 확인
            //             "size":size, 
            //             "isPhotoUsed":false,
            //             "sort":"recent",
            //             "includeContent":true,
            //             "getUserStats":true,
            //             "includeReceiptPhotos":true,
            //             "cidList":["223267","223268","223288","1005133"],
            //             "getReactions":true,
            //             "getTrailer":true
            //         },
            //         id:"1134852005"
            //     },
            //     query: naverReview
            // }];

            const data = [{
                operationName:"getVisitorReviews",
                variables:{
                    input:{
                        "businessId":"1205494930",
                        "businessType":"hairshop",
                        "item":"0",
                        "bookingBusinessId":"866308",
                        "page":currentPage,
                        "size":size,
                        "isPhotoUsed":false,
                        "includeContent":true,
                        "getUserStats":true,
                        "includeReceiptPhotos":true,
                        "cidList":["223267","223268","223288","223445"],
                        "getReactions":true,
                        "getTrailer":true
                    },
                    "id":"1205494930"
                },
                "query": naverReview
            }];
    
            const response = await axios.post( url, data )
            const resData = response.data;
            const items = resData[0].data.visitorReviews.items;
    
            if(items){
                const worksheetData = items.map(item => [
                    item.id, item.reviewId, item.author.id, item.author.nickname, item.author.url,
                    item.author.review.totalCount, item.author.review.imageCount,
                    item.author.review.avgRating, item.author.followerCount, item.body, item.bookingItemName,
                    JSON.stringify(item.media), item.visitCount, item.visited, item.created
                ]);
    
                // 기존 워크북에서 시트 가져오기
                const worksheet = workbook.Sheets['Sheet1'];
                const existingData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
                // 기존 데이터에 새 데이터 추가
                const updatedData = existingData.concat(worksheetData);
                const updatedWorksheet = xlsx.utils.aoa_to_sheet(updatedData);
    
                // 기존 워크북에 업데이트된 시트 적용
                workbook.Sheets['Sheet1'] = updatedWorksheet;
                xlsx.writeFile(workbook, excelFilePath);
            }
    
        }catch(error){
            console.log('MyError:', error)
        }
    }
}

// dotenv config set
dotenv.config();

// 환경 변수 사용
// naver place 주소
const url = process.env.ENV_URL; 
// 총 review 개수
const totalCount = 1734; 
const fileName = '콤브헤어 서울대입구점.csv';

console.log('url, totalCount=', url, totalCount)

if(url && totalCount){
    await sendPostRequest(url, totalCount, fileName)
} else {
    console.log('Please check env!')
}
