document.getElementById("search_btn").addEventListener('click', search_message);

// function search_message(){
// alert("검색을 수행합니다!");
// }

function search_message() {
    let str = ("검색을 수행합니다!");
    alert(str);
}

function googleSearch(){
    const prohibitedWords=["바보", "멍청이"];
    //기본브라우저객체구조
    const searchTerm = document.getElementById("search_input").value; // 검색어로 설정
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`;

    for(let word of prohibitedWords) {
        if(searchTerm.includes(word)) {
            alert("검색어에 부적절한 단어가 포함되어 있습니다다."); // 금지어가 포함된 경우 경고창 표시
            return false; // 함수 종료
        }
    }

    if (searchTerm === "") {
        alert("검색어를 입력하세요."); // 검색어가 비어있을 경우 경고창 표시
        return false; // 함수 종료
    }

    // 새 창에서 구글 검색을 수행
    window.open(googleSearchUrl, "_blank"); // 새로운 창에서 열기.
    return false;
}

// const search_message = () => {
//     const c = '검색을 수행합니다';
//     alert(c);
//     };
    