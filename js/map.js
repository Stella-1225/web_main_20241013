// 마커를 담을 배열
var markers = [];

var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
var options = { //지도를 생성할 때 필요한 기본 옵션
    center: new kakao.maps.LatLng(37.379639, 126.928197), //지도의 중심좌표.
    level: 3 //지도의 레벨(확대, 축소 정도)
};

var map = new kakao.maps.Map(container, options); //지도 생성 및 객체 리턴

// 마커가 표시될 위치
var markerPosition  = new kakao.maps.LatLng(33.450701, 126.570667); 

// 마커를 생성함
var marker = new kakao.maps.Marker({
    position: markerPosition
});

// 지도에 마커를 표시
marker.setMap(map);


// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성
var mapTypeControl = new kakao.maps.MapTypeControl();

// 지도 타입 컨트롤을 지도에 표시
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 지도 확대 축소를 제어할 수 있는 줌 컨트롤을 생성
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

// 지도에 지형정보를 표시하도록 지도타입을 추가
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);

///////////////////////////////////////////////

// 지도에 클릭 이벤트를 등록
// 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    // 클릭한 위도, 경도 정보를 가져옴
    var latlng = mouseEvent.latLng;
    // 마커 위치를 클릭한 위치로 옮김
    marker.setPosition(latlng);
    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    var resultDiv = document.getElementById('clickLatlng');
    resultDiv.innerHTML = message;
});

////////////////////////////////////

// 장소 검색 객체를 생성
var ps = new kakao.maps.services.Places();  

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 키워드로 장소를 검색
searchPlaces();

// 키워드 검색을 요청하는 함수
function searchPlaces() {

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청
    ps.keywordSearch( keyword, placesSearchCB); 
}

// 장소검색이 완료됐을 때 호출되는 콜백함수
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출
        displayPlaces(data);

        // 페이지 번호를 표출
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

// 검색 결과 목록과 마커를 표출하는 함수
function displayPlaces(places) {

    var listEl = document.getElementById('placesList'), 
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createDocumentFragment(), 
    bounds = new kakao.maps.LatLngBounds(), 
    listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거
    removeMarker();
    
    for ( var i=0; i<places.length; i++ ) {

        // 마커를 생성하고 지도에 표시
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i), 
            itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 mouseover 했을때
        // 해당 장소에 인포윈도우에 장소명을 표시
        // mouseout 했을 때는 인포윈도우를 닫음
        (function(marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function() {
                displayInfowindow(marker, title);
            });

            kakao.maps.event.addListener(marker, 'mouseout', function() {
                infowindow.close();
            });

            itemEl.onmouseover =  function () {
                displayInfowindow(marker, title);
            };

            itemEl.onmouseout =  function () {
                infowindow.close();
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }

    // 검색결과 항목들을 검색결과 목록 Element에 추가
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정
    map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수
function getListItem(index, places) {

    var el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                 
      itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수 
function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씀
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage 
        });

    marker.setMap(map); // 지도 위에 마커를 표출
    markers.push(marker);  // 배열에 생성된 마커를 추가

    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거
function removeMarker() {
    for ( var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }   
    markers = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 

    // 기존에 추가된 페이지번호를 삭제
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }

    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

 // 검색결과 목록의 자식 Element를 제거하는 함수
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
}

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울 중심 좌표
        level: 3 // 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption);
var geocoder = new kakao.maps.services.Geocoder();

var marker = new kakao.maps.Marker({ 
    position: mapOption.center,
    clickable: true
});
marker.setMap(map);

var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 초기 위치 주소 표시
geocoder.coord2Address(mapOption.center.getLng(), mapOption.center.getLat(), function(result, status) {
    if (status === kakao.maps.services.Status.OK) {
        var detailAddr = result[0].road_address ? result[0].road_address.address_name : '';
        var jibunAddr = result[0].address.address_name;
        var address = detailAddr || jibunAddr;

        infowindow.setContent('<div style="padding:5px;">' + address + '</div>');
        infowindow.open(map, marker);

        document.getElementById('clickLatlng').innerHTML = 
          '위도: ' + mapOption.center.getLat() + ', 경도: ' + mapOption.center.getLng() + '<br>주소: ' + address;
    } else {
        document.getElementById('clickLatlng').innerHTML = '초기 주소를 찾을 수 없습니다.';
    }
});

function addMapClickListener(map, marker, infoDivId) {
    var geocoder = new kakao.maps.services.Geocoder();
    var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    // 초기 중심 기준 행정동 주소 표시
    geocoder.coord2RegionCode(map.getCenter().getLng(), map.getCenter().getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var adminRegion = result[0].region_1depth_name + ' ' + result[0].region_2depth_name + ' ' + result[0].region_3depth_name;
            document.getElementById(infoDivId).innerHTML = '지도 중심 기준 행정동 주소: ' + adminRegion;
        } else {
            document.getElementById(infoDivId).innerHTML = '지도 중심 주소를 찾을 수 없습니다.';
        }
    });

    // 지도 클릭 시 처리
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        var latlng = mouseEvent.latLng; // 클릭한 위도, 경도 정보를 가져옴
        marker.setPosition(latlng); // 마커 위치를 클릭한 위치로 옮김
        var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
        message += '경도는 ' + latlng.getLng() + ' 입니다';
        var resultDiv = document.getElementById('clickLatlng');
        resultDiv.innerHTML = message;

        // 클릭 위치 법정동 주소 출력 (마커 위에)
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var roadAddr = result[0].road_address ? result[0].road_address.address_name : '도로명주소 없음';
                var jibunAddr = result[0].address.address_name ? result[0].address.address_name : '지번주소 없음';
                var legalAddr = result[0].address.region_1depth_name + ' ' + result[0].address.region_2depth_name + ' ' + result[0].address.region_3depth_name;

                var content = '<div style="padding:5px; max-width:250px; word-wrap:break-word;">' +
                              '<b>법정도 주소정보</b><br>' +
                              '<b>도로명주소:</b> ' + roadAddr + '<br>' +
                              '<b>지번 주소:</b> ' + jibunAddr + '<br>' +
                              '<b>법정동:</b> ' + legalAddr +
                              '</div>';

                infowindow.setContent(content);
                infowindow.open(map, marker);
            } else {
                infowindow.close();
            }
        });

        // 클릭한 좌표 기준 행정동 주소를 아래 div에 표시
        geocoder.coord2RegionCode(latlng.getLng(), latlng.getLat(), function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var adminRegion = result[0].region_1depth_name + ' ' + result[0].region_2depth_name + ' ' + result[0].region_3depth_name;
                document.getElementById(infoDivId).innerHTML = '<b>지도중심기준 행정동 주소정보<br></b>'+ adminRegion;
            } else {
                document.getElementById(infoDivId).innerHTML = '주소를 찾을 수 없습니다.';
            }
        });
    });

        kakao.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map, marker);

        // 클릭된 마커 위치 기준 주소 다시 가져와서 오른쪽 하단에 표시
        var latlng = marker.getPosition();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
            if (status === kakao.maps.services.Status.OK) {
                var roadAddr = result[0].road_address ? result[0].road_address.address_name : '도로명주소 없음';
                var jibunAddr = result[0].address.address_name ? result[0].address.address_name : '지번주소 없음';
                var legalAddr = result[0].address.region_1depth_name + ' ' + result[0].address.region_2depth_name + ' ' + result[0].address.region_3depth_name;

                document.getElementById('clickLatlng').innerHTML = 
                    '<b>마커 클릭 위치 정보</b><br>' +
                    '도로명주소: ' + roadAddr + '<br>' +
                    '지번주소: ' + jibunAddr + '<br>' +
                    '법정동: ' + legalAddr;
            } else {
                document.getElementById('clickLatlng').innerHTML = '주소를 찾을 수 없습니다.';
            }
        });
    });
}

addMapClickListener(map, marker, 'clickLatlng');

// 페이지 로드 후 실행
window.addEventListener('load', function() {
    // 초기 좌표 메시지 설정
    var initialMessage = '클릭한 위치의 위도는 37.538327547286166 이고, 경도는 126.99805383634843 입니다';
    
    // "지도를 클릭해주세요!" 문구 찾기
    var clickPromptElem = document.querySelector('p em');
    if (clickPromptElem && clickPromptElem.textContent === '지도를 클릭해주세요!') {
        // 좌표 정보를 표시할 요소 생성
        var coordInfoElem = document.createElement('p');
        coordInfoElem.id = 'outside-coords';
        coordInfoElem.textContent = initialMessage;
        
        // "지도를 클릭해주세요!" 문구 다음에 추가
        clickPromptElem.parentNode.after(coordInfoElem);
    }
    
    // 지도 클릭 이벤트에 추가 처리
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        var latlng = mouseEvent.latLng;
        var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, 경도는 ' + latlng.getLng() + ' 입니다';
        
        // 지도 밖 좌표 정보 업데이트
        var outsideCoordsElem = document.getElementById('outside-coords');
        if (outsideCoordsElem) {
            outsideCoordsElem.textContent = message;
        }
    });
});