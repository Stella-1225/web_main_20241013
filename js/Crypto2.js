// AES-256-GCM 암호화 함수
export async function encryptAES_GCM(plainText, keyStr) {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96bit IV
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(keyStr.padEnd(32, '0')).slice(0, 32), // 32바이트 키
        "AES-GCM",
        false,
        ["encrypt"]
    );
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        keyMaterial,
        enc.encode(plainText)
    );
    // IV와 암호문을 합쳐서 base64로 반환
    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...result));
}

// AES-256-GCM 복호화 함수
export async function decryptAES_GCM(cipherText, keyStr) {
    const enc = new TextEncoder();
    const data = Uint8Array.from(atob(cipherText), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(keyStr.padEnd(32, '0')).slice(0, 32),
        "AES-GCM",
        false,
        ["decrypt"]
    );
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        keyMaterial,
        encrypted
    );
    return new TextDecoder().decode(decrypted);
}