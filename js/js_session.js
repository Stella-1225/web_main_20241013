import { encrypt_text, decrypt_text } from './js_crypto.js';
// function session_set() { //세션 저장
//     let session_id = document.querySelector("#typeEmailX");
//     if (sessionStorage) {
//         sessionStorage.setItem("Session_Storage_test", session_id.value);
//     } else {
//         alert("로컬 스토리지 지원 x");
//     }
// }

export function session_set(){ //세션 저장(객체)
    let id = document.querySelector("#typeEmailX");
    let password = document.querySelector("#typePasswordX");
    let random = new Date(); // 랜덤 타임스탬프

    const obj = { // 객체 선언
    id : id.value,
    otp : random
    }
    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체-> JSON 문자열 변환
        let en_text = encrypt_text(objString); // 암호화
        sessionStorage.setItem("Session_Storage_id", id.value);
        sessionStorage.setItem("Session_Storage_object", objString);
        sessionStorage.setItem("Session_Storage_pass", en_text);
    } else {
        alert("세션 스토리지 지원 x");
    }
}

 export function session_set2(obj){ //세션 저장(객체)
    let id = document.querySelector("#typeEmailX");
    let password = document.querySelector("#typePasswordX");
    let random = new Date(); // 랜덤 타임스탬프

    if (sessionStorage) {
        const objString = JSON.stringify(obj); // 객체-> JSON 문자열 변환
        let en_text = encrypt_text(objString); // 암호화
        sessionStorage.setItem("Session_Storage_join", objString);
    } else {
        alert("세션 스토리지 지원 x");
    }
}


export function session_get() { //세션 읽기
    if (sessionStorage) {
    return sessionStorage.getItem("Session_Storage_pass");
    } else {
        alert("세션 스토리지 지원 x");
    }
}

// 복호화해서 객체 반환
export function session_get2() { // 회원가입 정보 복호화 반환
    if (sessionStorage) {
        const en_text = sessionStorage.getItem("Session_Storage_join");
        if (!en_text) return null;
        const objString = decrypt_text(en_text); // 복호화
        if (!objString) return null;
        return JSON.parse(objString); // 객체로 변환
    } else {
        alert("세션 스토리지 지원 x");
        return null;
    }
}

export function session_check() { //세션 검사
    if (sessionStorage.getItem("Session_Storage_id")) {
        alert("이미 로그인 되었습니다.");
        location.href='../login/index_login.html'; // 로그인된 페이지로 이동
    }
}

export function session_del() {//세션 삭제
    if (sessionStorage) {
        sessionStorage.removeItem("Session_Storage_test");
        alert('로그아웃 버튼 클릭 확인 : 세션 스토리지를 삭제합니다.');
    } else {
        alert("세션 스토리지 지원 x");
    }
}

function logout() {
    // JWT 토큰 삭제
    localStorage.removeItem('jwt_token');
    // 세션스토리지 삭제
    sessionStorage.clear();
    // 쿠키 삭제 (예시: id 쿠키)
    document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // 로그아웃 후 메인 페이지로 이동
    window.location.href = "../index.html";
}