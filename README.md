# naver-review-daemon
Naver 리뷰 크롤링 프로젝트

이 프로젝트는 Naver에서 리뷰를 크롤링하여 데이터를 수집하는 Node.js 기반의 데몬입니다. 수집된 데이터는 데이터 분석을 위해 CSV 파일 형식으로 저장됩니다.

## 설치 방법

1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/dev-jhjoo/naver-review-deamon.git
   cd naver-review-daemon
   ```

2. 필요한 패키지를 설치합니다:
   ```bash
   npm install
   ```

## 환경 설정

1. `.env` 파일을 생성하고 다음과 같은 환경 변수를 설정합니다:
   ```
   ENV_URL=your_naver_place_url
   ENV_TOTALCOUNT=total_number_of_reviews
   ```

## 실행 방법

1. 크롤러를 실행합니다:
   ```bash
   npm start
   ```

2. 크롤링이 완료되면, 결과는 `src/data/reviews.csv` 파일에 저장됩니다.

## 사용 예시

크롤러를 실행한 후, `src/data/reviews.csv` 파일을 열어 수집된 리뷰 데이터를 확인할 수 있습니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.