 # 
HTML 프로젝트- 깃허브
새로운 시작! 웹 서비스 개발의 세계로 떠나보아요~
 ## Getting Started
 This project is a starting point for a Web application.- [프로젝트 메인 주소](https://github.com/
본인아이디/WEB_MAIN) 
 ## 2주차 수업 메인화면 개발 완료! (문제 포함)
 ## 3주차 수업 부트스트랩 적용 완료! (문제 제외)
 ## 4주차 수업 테이블 개발 완료 및 네비게이션 바, 검색창, 메인 이미지(반응형) 적용 완료! (문제 제외)
 ## 5주차 수업 검색창(확장) 개발 완료 및 팝업창 개발 완료! (문제 제외)
 ## 6주차 수업 팝업창 기능 추가(날짜, 시간) 및 이미지 호버 기능 개발 완료! (문제 제외)
 ## 7주차 수업 네비게이션 바 수정 및 로그인 기능 개발 완료! (문제 제외)
 ## 9주차 수업 로그인 폼(XSS 방지 기능) 및 쿠키(팝업창-x일 보지 않기) 개발 완료! (문제 제외)
 ## 10주차 수업 쿠키(id 저장하기) 및 세션(로그인) 개발 완료! (문제 3주차~6주차, 10주차 완료!)
 
 ## 6주차 로그인 후 화면 및 로그아웃 처리
 - 로그인 후 이동되는 index_login.html에서 이미지 호버가 작동되지 않는 문제가 발생 -> js_popup.js 파일에 ../ 상위 폴더 가는 방식 추가 -> 로그인 후 창에서도 이미지 호버가 정상적으로 작동. 
 - 또한 로고 이미지 등 이미지들이 깨지는 문제 발생 -> index_login.html에 img src 부분에 ../ 추가 -> 정상적으로 이미지가 나옴.
 - index_login.html에서 다른 js 파일에 접근하지 못하는 문제 발생 -> js 파일 연결하는 코드 부분에 ../ 추가 -> 오류 사라짐.
 - index_login.html에서 팝업창 js 연결을 삭제해서 body 태그 안에 onload="pop_up(); 이 코드에서 오류가 발생 -> 삭제 -> 오류 사라짐.
 - 로그아웃 버튼을 부트스트랩 디자인으로 가져옴.
 - 로그아웃을 누르면 index.html로 이동하도록 <a> 태그 안에 로그아웃을 넣고, href를 ../index.html로 연결함.

 ## 10주차 로그인 제한
 - 쿠키에서 로그인 실패한 횟수를 받아오는 변수를 만들고, 현재 시간을 가져오는 변수, 마지막으로 실패한 시간을 가져오는 변수를 만든 뒤, 횟수보다 큰지 작은지를 비교하고 로그인 제한을 시켰음.

 ## 11주차 세션(암호화/복호화) 및 로그인 후 화면 개발 완료(문제 포함)
 로그인 후 페이지인 index_iogin.html에서 login_btn이 없어서 login.js에 있는 이벤트가 null를 가르켜서 오류 발생. 이 오류를 해결하기 위해 login.js에 있는 document.getElementById("login_btn").addEventListener('click', check_input); 이 코드를 버튼이 있을 때만 안전하게 이벤트가 연결되게 조건문을 만들어서 바꿔줌. 

 ## 12주차 모듈화 및 회원가입 기능 개발 완료(문제 포함)
11주차 응용 문제를 위해 만든 세션에 encryptAES_GCM 이 함수를 Import 하지 않아서 정상적으로 인식하지 못하는 문제 발생. -> encryptAES_GCM 이 함수를 만든 파일을 Import 해서 해결함.
로그아웃 버튼이 먹히지 않는 문제가 발생해서 document.addEventListener('DOMContentLoaded', function() 이 부분에 // 로그아웃 버튼 이벤트 추가 (const logoutBtn = document.getElementById("logout_btn");)
로그인 후 페이지에서 이미지 호버가 되지 않는 문제가 발생하여 index_login.html에 <script src="../js/js_popup.js"></script> 코드를 추가함.