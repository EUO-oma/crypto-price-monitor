#!/usr/bin/env node

/**
 * 일별 암호화폐 가격 수집 스크립트
 * 매일 UTC 00:01 (한국시간 09:01)에 실행
 * 전일 정확한 일봉 데이터를 수집하여 Firebase에 저장
 */

// Firebase Admin SDK를 사용하지 않고 REST API로 직접 통신
const https = require('https');

// Firebase 설정
const FIREBASE_DATABASE_URL = 'https://crypto-monitor-84bdb-default-rtdb.firebaseio.com';
const FIREBASE_API_KEY = 'AIzaSyA6zB_snzOh_e5tG6_-uK64g6dwL5pzU4c';

// Binance API 설정
const BINANCE_API_URL = 'https://api.binance.com/api/v3/klines';
const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

// HTTP 요청 헬퍼 함수
function httpsRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// Firebase에 데이터 저장
async function saveToFirebase(path, data) {
    const url = `${FIREBASE_DATABASE_URL}/${path}.json?auth=${process.env.FIREBASE_AUTH_TOKEN || ''}`;
    
    return new Promise((resolve, reject) => {
        const dataString = JSON.stringify(data);
        const options = {
            hostname: 'crypto-monitor-84bdb-default-rtdb.firebaseio.com',
            path: `/${path}.json`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': dataString.length
            }
        };
        
        const req = https.request(options, (res) => {
            let response = '';
            res.on('data', (chunk) => response += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(response));
                } else {
                    reject(new Error(`Firebase 저장 실패: ${res.statusCode}`));
                }
            });
        });
        
        req.on('error', reject);
        req.write(dataString);
        req.end();
    });
}

// UTC 기준 날짜 문자열 생성
function getUTCDateString(date) {
    return date.toISOString().split('T')[0];
}

// 특정 날짜의 데이터 수집
async function collectDataForDate(date) {
    const dateStr = getUTCDateString(date);
    console.log(`[${new Date().toISOString()}] ${dateStr} 데이터 수집 시작...`);
    
    // UTC 0시 기준으로 시작/종료 시간 설정
    const startTime = date.getTime();
    const endTime = startTime + (24 * 60 * 60 * 1000) - 1;
    
    try {
        const dayData = {
            date: dateStr,
            collected_at: new Date().toISOString(),
            source: 'daily_cron_job'
        };
        
        // 각 심볼별로 데이터 수집
        for (const symbol of SYMBOLS) {
            const url = `${BINANCE_API_URL}?symbol=${symbol}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=1`;
            
            try {
                const klines = await httpsRequest(url);
                
                if (klines.length > 0) {
                    const kline = klines[0];
                    // [timestamp, open, high, low, close, volume, ...]
                    
                    const prefix = symbol.replace('USDT', '').toLowerCase();
                    dayData[prefix] = parseFloat(kline[4]); // 종가
                    dayData[`${prefix}_open`] = parseFloat(kline[1]); // 시가
                    dayData[`${prefix}_high`] = parseFloat(kline[2]); // 고가
                    dayData[`${prefix}_low`] = parseFloat(kline[3]); // 저가
                    dayData[`${prefix}_volume`] = parseFloat(kline[5]); // 거래량
                    
                    console.log(`✅ ${symbol}: 종가 $${dayData[prefix].toLocaleString()}`);
                }
            } catch (error) {
                console.error(`❌ ${symbol} 데이터 수집 실패:`, error.message);
            }
            
            // API 제한 방지를 위한 딜레이
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Firebase에 저장
        await saveToFirebase(`prices/${dateStr}`, dayData);
        console.log(`🔥 Firebase에 ${dateStr} 데이터 저장 완료`);
        
        return dayData;
        
    } catch (error) {
        console.error(`❌ ${dateStr} 데이터 처리 실패:`, error.message);
        return null;
    }
}

// 메인 함수
async function main() {
    console.log('=== 일별 암호화폐 가격 수집 시작 ===');
    console.log(`실행 시간: ${new Date().toISOString()}`);
    
    // UTC 기준 어제 날짜 계산
    const today = new Date();
    const yesterday = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - 1,
        0, 0, 0, 0
    ));
    
    try {
        const data = await collectDataForDate(yesterday);
        
        if (data) {
            console.log('\n=== 수집 완료 ===');
            console.log(`날짜: ${data.date}`);
            console.log(`BTC: $${data.btc?.toLocaleString()} (${((data.btc - data.btc_open) / data.btc_open * 100).toFixed(2)}%)`);
            console.log(`ETH: $${data.eth?.toLocaleString()} (${((data.eth - data.eth_open) / data.eth_open * 100).toFixed(2)}%)`);
            console.log(`SOL: $${data.sol?.toLocaleString()} (${((data.sol - data.sol_open) / data.sol_open * 100).toFixed(2)}%)`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('수집 중 오류 발생:', error);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { collectDataForDate, getUTCDateString };