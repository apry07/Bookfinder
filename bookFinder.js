const jobForm = document.getElementById('job-form');
const bookList = document.getElementById('book-list');
let jobCategories = {};
let currentQuery = ''; // 현재 검색 쿼리
let currentIndex = 0; // 현재 시작 인덱스
let isFetching = false; // 데이터를 가져오는 중인지 확인

// JSON 파일 로드
fetch('job.json')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        jobCategories = data;
        console.log("JSON 데이터 로드 성공:", jobCategories);
    })
    .catch(error => console.error('Error loading job data:', error));

// 책 데이터를 가져오는 함수
function fetchBooks(query) {
    if (isFetching) return; // 이미 데이터를 가져오는 중이면 실행하지 않음
    isFetching = true;

    const apiKey = 'AIzaSyCiwV0bCzsHesAM8hZcZ_MtAykX4xLkUO8';
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${currentIndex}&maxResults=10&key=${apiKey}`;

    bookList.innerHTML += '<p id="loading-text">추천 도서를 가져오는 중...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading-text').remove();
            isFetching = false;

            if (data.items && data.items.length > 0) {
                data.items.forEach(item => {
                    const book = item.volumeInfo;
                    const thumbnail = book.imageLinks ? book.imageLinks.thumbnail : null;
                    const description = book.description ? book.description.slice(0, 100) + '...' : '설명 없음';

                    const bookItem = document.createElement('div');
                    bookItem.classList.add('book-item');
                    bookItem.innerHTML = `
                        ${thumbnail ? `<img src="${thumbnail}" alt="${book.title}">` : '<div class="no-image">이미지 없음</div>'}
                        <div>
                            <h3>${book.title || '제목 없음'}</h3>
                            <p><strong>저자:</strong> ${book.authors ? book.authors.join(', ') : '저자 정보 없음'}</p>
                            <p><strong>출판사:</strong> ${book.publisher || '출판사 정보 없음'}</p>
                            <p><strong>출판일:</strong> ${book.publishedDate || '출판일 정보 없음'}</p>
                            <p>${description}</p>
                            <a href="${book.infoLink}" target="_blank">더 알아보기</a>
                        </div>
                    `;
                    bookList.appendChild(bookItem);
                });

                // 다음 페이지를 가져오기 위해 인덱스 업데이트
                currentIndex += 10;
            } else {
                bookList.innerHTML += '<p>더 이상 관련 도서를 찾을 수 없습니다.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            isFetching = false;
            document.getElementById('loading-text').remove();
            bookList.innerHTML += '<p>도서를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>';
        });
}

// 직업 폼 제출 이벤트
jobForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('job-input').value.trim().toLowerCase();

    let foundKeywords = null;

    for (const [job, details] of Object.entries(jobCategories)) {
        const { category, keywords } = details;

        if (
            job.toLowerCase() === searchQuery || category.toLowerCase() === searchQuery || keywords.some(keyword => keyword.toLowerCase().includes(searchQuery))
        ) {
            foundKeywords = keywords;
            break;
        }
    }

    if (foundKeywords) {
        // 검색 초기화
        currentQuery = foundKeywords[0];
        currentIndex = 0;
        bookList.innerHTML = '';
        fetchBooks(currentQuery);
    } else {
        bookList.innerHTML = '<p>관련 직업 또는 키워드를 찾을 수 없습니다.</p>';
    }
});

// 무한 스크롤 구현
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && currentQuery) {
        fetchBooks(currentQuery);
    }
});
