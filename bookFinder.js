const jobForm = document.getElementById('job-form');
const bookList = document.getElementById('book-list');
let jobCategories = {};

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
    const apiKey = 'AIzaSyCiwV0bCzsHesAM8hZcZ_MtAykX4xLkUO8';
    const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`;

    bookList.innerHTML = '<p>추천 도서를 가져오는 중...</p>';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            bookList.innerHTML = '';
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
            } else {
                bookList.innerHTML = '<p>관련 도서를 찾을 수 없습니다.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching books:', error);
            bookList.innerHTML = '<p>도서를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.</p>';
        });
}

// 검색 폼 제출 이벤트
jobForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('job-input').value.trim().toLowerCase();

    let foundKeywords = null;

    // JSON 데이터에서 검색어에 해당하는 키워드 찾기
    for (const [job, details] of Object.entries(jobCategories)) {
        const { category, keywords } = details;

        if (
            job.toLowerCase() === searchQuery || // 직업명 매칭
            category.toLowerCase() === searchQuery || // 카테고리 매칭
            keywords.some(keyword => keyword.toLowerCase().includes(searchQuery)) // 키워드 매칭
        ) {
            foundKeywords = keywords;
            break;
        }
    }

    if (foundKeywords) {
        // 키워드 중 하나를 Google Books API에 사용 (우선 첫 번째 키워드 선택)
        fetchBooks(foundKeywords[0]);
    } else {
        bookList.innerHTML = '<p>관련 직업 또는 키워드를 찾을 수 없습니다.</p>';
    }
});
