import { session_set2 } from './js_session.js';

function join(){ // 회원가입 기능
    let form = document.querySelector("#join_form"); // 로그인 폼 식별자
    let name = document.querySelector("#form3Example1c");
    let email = document.querySelector("#form3Example3c");
    let password = document.querySelector("#form3Example4c");
    let re_password= document.querySelector("#form3Example4cd");
    let agree = document.querySelector("#form2Example3c");
    const nameRegex = /^[가-힣]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    
    form.action= "../index.html"; // 로그인 성공 시 이동
    form.method= "get"; // 전송 방식

    if(name.value.length=== 0 || email.value.length=== 0 || password.value.length=== 0 || re_password.length=== 0){
        alert("회원가입 폼에 모든 정보를 입력해주세요.");
    }
    if (!nameRegex.test(name.value)) { // 이름 검사
        alert("이름은 한글만 입력 가능합니다.");
        name.focus();
        return;
    }
    if (!emailRegex.test(email.value)) { // 이메일 검사
        alert("이메일 형식이 올바르지 않습니다.");
        email.focus();
        return;
    }
    else{
        const newSignUp = new SignUp(name.value, email.value, password.value, re_password.value); // 회원가입정보객체생성
        session_set2(newSignUp); // 세션 저장 및 객체 전달
        form.submit(); // 폼 실행s
    }
}

class SignUp {
    constructor(name, email, password, re_password) {
        // 생성자 함수: 객체 생성 시 회원 정보 초기화
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    // 전체 회원 정보를 한 번에 설정하는 함수
    setUserInfo(name, email, password, re_password) {
        this._name = name;
        this._email = email;
        this._password = password;
        this._re_password = re_password;
    }

    // 전체 회원 정보를 한 번에 가져오는 함수
    getUserInfo() {
        return {
            name: this._name,
            email: this._email,
            password: this._password,
            re_password: this._re_password
        };
    }
 }

document.getElementById("join_btn").addEventListener('click', join); // 이벤트 리스너