import { session_set, session_get, session_get2, session_check } from './js_session.js';
import { encrypt_text, decrypt_text } from './js_crypto.js';
import { generateJWT, checkAuth } from './js_jwt_token.js';
import { encryptAES_GCM } from './Crypto2.js';

function init(){ // 로그인 폼에 쿠키에서 가져온 아이디 입력
    const emailInput = document.getElementById('typeEmailX');
    const idsave_check = document.getElementById('idSaveCheck');
    let get_id = getCookie("id");
    if(get_id) {
        emailInput.value = get_id;
        idsave_check.checked = true;
    }
    session_check(); // 세션 유무 검사
    init_failed_state(); // 실패 상태 초기화
}

document.addEventListener('DOMContentLoaded', () => {
    init(); 
});

const check_xss = (input) => {
    // DOMPurify 라이브러리 로드 (CDN 사용)
    const DOMPurify = window.DOMPurify;
    // 입력 값을 DOMPurify로 sanitize
    const sanitizedInput = DOMPurify.sanitize(input);
    
    // Sanitized된 값과 원본 입력 값 비교
    if (sanitizedInput !== input) {
        // XSS 공격 가능성 발견 시 에러 처리
        alert('XSS 공격 가능성이 있는 입력값을 발견했습니다.');
        return false;
    }
    // Sanitized된 값 반환
    return sanitizedInput;
};

function setCookie(name, value, expiredays) {
    var date = new Date();
    date.setDate(date.getDate() + expiredays);
    document.cookie = `${escape(name)}=${escape(value)}; expires=${date.toUTCString()}; path=/`;
}
    
function getCookie(name) {
    var cookie = document.cookie;
    console.log("쿠키를 요청합니다.");
    if (cookie !== "") {
        var cookieArray = cookie.split("; ");
        for (var index in cookieArray) {
            var cookiePair = cookieArray[index].split("=");
            if (cookiePair[0] === name) {
                return unescape(cookiePair[1]);
            }
        }
    }
    return null;
}

const BLOCK_TIME = 5 * 60 * 1000; // 5분 (밀리초 단위)

function login_failed() {
    let failCount = parseInt(getCookie('failCount')) || 0; // 실패 횟수 가져오기
    let lastFailTime = parseInt(getCookie('lastFailTime')) || 0; // 마지막 실패 시간 가져오기

    const now = new Date().getTime();

    // 블록 시간이 지났으면 실패 횟수 초기화
    if (lastFailTime && (now - lastFailTime) > BLOCK_TIME) {
        failCount = 0;
        setCookie('failCount', failCount, 1); // 실패 횟수 초기화
        setCookie('lastFailTime', now, 1); // 마지막 실패 시간 초기화
    }

    failCount += 1; // 실패 횟수 증가

    // 실패 횟수와 마지막 실패 시간 쿠키에 저장
    setCookie('failCount', failCount, 1);
    setCookie('lastFailTime', now, 1);

    const statusElement = document.getElementById('status');
    const loginButton = document.getElementById('login_btn');

    if (failCount >= 3) {
        // 로그인 제한 메시지 출력
        statusElement.innerText = `로그인이 제한되었습니다. (실패 횟수: ${failCount})`;
        statusElement.style.color = 'red';
        // 로그인 버튼 비활성화
        loginButton.disabled = true;

        // 5분 뒤 버튼 활성화
        setTimeout(() => {
            loginButton.disabled = false;
            statusElement.innerText = '로그인 제한이 해제되었습니다. 다시 시도하세요.';
            statusElement.style.color = 'green';

            // 실패 횟수 초기화
            setCookie('failCount', 0, 1);
            setCookie('lastFailTime', 0, 1);
        }, BLOCK_TIME);
    } else {
        // 로그인 실패 메시지 출력
        statusElement.innerText = `로그인 실패! (실패 횟수: ${failCount})`;
        statusElement.style.color = 'red';
    }
}

function init_failed_state() {
    const failCount = parseInt(getCookie('failCount')) || 0;
    const lastFailTime = parseInt(getCookie('lastFailTime')) || 0;
    const now = new Date().getTime();
    const statusElement = document.getElementById('status');
    const loginButton = document.getElementById('login_btn');

    if (failCount >= 3 && (now - lastFailTime) <= BLOCK_TIME) {
        const remainingTime = Math.ceil((BLOCK_TIME - (now - lastFailTime)) / 60000);
        statusElement.innerText = `로그인이 제한되었습니다. ${remainingTime}분 후 다시 시도하세요.`;
        statusElement.style.color = 'red';
        loginButton.disabled = true;

        setTimeout(() => {
            loginButton.disabled = false;
            statusElement.innerText = '로그인 제한이 해제되었습니다. 다시 시도하세요.';
            statusElement.style.color = 'green';
            setCookie('failCount', 0, 1);
            setCookie('lastFailTime', 0, 1);
        }, BLOCK_TIME - (now - lastFailTime));
    }
}

function login_count() {
    let count = parseInt(getCookie("login_cnt")) || 0;
    count += 1;
    setCookie("login_cnt", count, 7); // 7일 저장
    console.log("로그인 횟수:", count);
}

const check_input = () => {
    const loginForm = document.getElementById('login_form');
    const loginBtn = document.getElementById('login_btn');
    const emailInput = document.getElementById('typeEmailX');
    const passwordInput = document.getElementById('typePasswordX');

    const c = '아이디, 패스워드를 체크합니다';
    alert(c);

    const emailValue = emailInput.value.trim();
    const passwordValue = passwordInput.value.trim();
    const sanitizedPassword = check_xss(passwordValue);
    const sanitizedEmail = check_xss(emailValue);
    const idsave_check = document.getElementById('idSaveCheck');
    const payload = {
        id: emailValue,
        exp: Math.floor(Date.now() / 1000) + 3600 // 1시간 (3600초)
    };
    const jwtToken = generateJWT(payload);

    if (emailValue === '') {
        alert('이메일을 입력하세요.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    if (passwordValue === '') {
        alert('비밀번호를 입력하세요.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    if (emailValue.length < 5 || emailValue.length > 10) {
        alert('아이디는 최소 5글자 이상, 10글자 이하로 입력해야 합니다.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    if (passwordValue.length < 12 || passwordValue.length > 15) {
        alert('비밀번호는 반드시 12글자 이상, 15글자 이하로 입력해야 합니다.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    const hasSpecialChar = passwordValue.match(/[!,@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/) !== null;

    if (!hasSpecialChar) {
        alert('패스워드는 특수문자를 1개 이상 포함해야 합니다.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    const hasUpperCase = passwordValue.match(/[A-Z]+/) !== null;
    const hasLowerCase = passwordValue.match(/[a-z]+/) !== null;

    if (!hasUpperCase || !hasLowerCase) {
        alert('패스워드는 대소문자를 1개 이상 포함해야 합니다.');
        login_failed(); // 로그인 실패 처리
        return false;
    }

    //3글자 이상 반복 입력 검사
    const threeCharRepeat = /(.{3,}?).*\1/.test(passwordValue);

    if (threeCharRepeat) {
        alert('3글자 이상 반복 입력은 허용되지 않습니다.');
        login_failed();
        return false;
    }

    //2글자 이상 반복 입력 검사
    const twoDigitNumberRepeat = /(\d{2}).*\1/.test(passwordValue);

    if (twoDigitNumberRepeat) {
        alert('연속되는 숫자 2개 이상 반복 입력은 허용되지 않습니다.');
        login_failed();
        return false;
    }


    if (!sanitizedEmail) {
        return false;
    }
    if (!sanitizedPassword) {
        return false;
    }

    // 검사 마무리 단계 쿠키 저장, 최하단 submit 이전
    if (idsave_check.checked == true) { // 아이디 체크 o
        alert("쿠키를 저장합니다.", emailValue);
        setCookie("id", emailValue, 1); // 1일 저장
        alert("쿠키 값 :" + emailValue);
    } else { // 아이디 체크 x
        setCookie("id", emailValue.value, 0); // 날짜를 0 - 쿠키 삭제
    }

    console.log('이메일:', emailValue);
    console.log('비밀번호:', passwordValue);

    //암호화 후 세션스토리지에 저장
    const sessionValue = emailValue + ':' + passwordValue; // 예시
    const key = "아무거나32글자"; // 실제 서비스에서는 안전하게 관리
    encryptAES_GCM(sessionValue, key).then(enc => {
        sessionStorage.setItem("Session_Storage_pass2", enc);
    });

    // 로그인 성공 처리
    const statusElement = document.getElementById('status');
    statusElement.innerText = '로그인 성공!';
    statusElement.style.color = 'green';

    login_count();

    session_set(); // 세션 생성
    localStorage.setItem('jwt_token', jwtToken);

    //회원가입 정보 복호화 및 콘솔 출력
    const user = session_get2();
    if (user) {
        console.log("복호화된 회원가입 정보:", user);
    } else {
        console.log("회원가입 세션이 없습니다.");
    }

    loginForm.submit();
};

function init_logined(){
    if(sessionStorage){
        decrypt_text(); // 복호화 함수
    }
    else{
        alert("세션 스토리지 지원 x");
    }
}

document.addEventListener('DOMContentLoaded', function() {
const loginBtn = document.getElementById("login_btn");

    if (loginBtn) {
        loginBtn.addEventListener('click', check_input);
    }
});