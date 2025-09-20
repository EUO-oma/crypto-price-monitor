/**
 * 🪙 코인 이미지 데이터베이스
 * 익명 채팅용 아바타 이미지 컬렉션
 * CoinGecko API 및 안정적인 CDN 링크 사용
 */

const COIN_IMAGES_DB = {
    // 메이저 코인들
    bitcoin: {
        name: "Bitcoin",
        symbol: "BTC",
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        color: "#f7931a"
    },
    ethereum: {
        name: "Ethereum", 
        symbol: "ETH",
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
        color: "#627eea"
    },
    solana: {
        name: "Solana",
        symbol: "SOL", 
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        color: "#00FFA3"
    },
    ripple: {
        name: "XRP",
        symbol: "XRP",
        image: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
        color: "#23292f"
    },
    cardano: {
        name: "Cardano",
        symbol: "ADA",
        image: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
        color: "#0033ad"
    },
    polkadot: {
        name: "Polkadot",
        symbol: "DOT",
        image: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
        color: "#e6007a"
    },
    dogecoin: {
        name: "Dogecoin",
        symbol: "DOGE",
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        color: "#c2a633"
    },
    avalanche: {
        name: "Avalanche",
        symbol: "AVAX",
        image: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
        color: "#e84142"
    },
    chainlink: {
        name: "Chainlink",
        symbol: "LINK",
        image: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
        color: "#2a5ada"
    },
    polygon: {
        name: "Polygon",
        symbol: "MATIC",
        image: "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
        color: "#8247e5"
    },
    
    // 알트코인들
    litecoin: {
        name: "Litecoin",
        symbol: "LTC",
        image: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
        color: "#bfbbbb"
    },
    bitcoin_cash: {
        name: "Bitcoin Cash",
        symbol: "BCH",
        image: "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash-circle.png",
        color: "#8dc351"
    },
    stellar: {
        name: "Stellar",
        symbol: "XLM",
        image: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png",
        color: "#000000"
    },
    vechain: {
        name: "VeChain",
        symbol: "VET",
        image: "https://assets.coingecko.com/coins/images/1167/large/VeChain-Logo-Icon.png",
        color: "#15bdff"
    },
    theta: {
        name: "Theta",
        symbol: "THETA",
        image: "https://assets.coingecko.com/coins/images/2538/large/theta-token-logo.png",
        color: "#2ab8e6"
    },
    filecoin: {
        name: "Filecoin",
        symbol: "FIL",
        image: "https://assets.coingecko.com/coins/images/12817/large/filecoin.png",
        color: "#0090ff"
    },
    tron: {
        name: "TRON",
        symbol: "TRX",
        image: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
        color: "#ff060a"
    },
    eos: {
        name: "EOS",
        symbol: "EOS",
        image: "https://assets.coingecko.com/coins/images/738/large/eos-eos-logo.png",
        color: "#000000"
    },
    monero: {
        name: "Monero",
        symbol: "XMR",
        image: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png",
        color: "#ff6600"
    },
    aave: {
        name: "Aave",
        symbol: "AAVE",
        image: "https://assets.coingecko.com/coins/images/12645/large/AAVE.png",
        color: "#b6509e"
    },
    
    // 디파이 토큰들
    uniswap: {
        name: "Uniswap",
        symbol: "UNI",
        image: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
        color: "#ff007a"
    },
    compound: {
        name: "Compound",
        symbol: "COMP",
        image: "https://assets.coingecko.com/coins/images/10775/large/COMP.png",
        color: "#00d395"
    },
    maker: {
        name: "Maker",
        symbol: "MKR",
        image: "https://assets.coingecko.com/coins/images/1364/large/Mark_Maker.png",
        color: "#1aab9b"
    },
    yearn_finance: {
        name: "Yearn.finance",
        symbol: "YFI",
        image: "https://assets.coingecko.com/coins/images/11849/large/yfi-192x192.png",
        color: "#006ae3"
    },
    
    // 밈코인들
    shiba_inu: {
        name: "Shiba Inu",
        symbol: "SHIB",
        image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
        color: "#ffa409"
    },
    pepe: {
        name: "Pepe",
        symbol: "PEPE",
        image: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg",
        color: "#4caf50"
    },
    
    // 스테이블코인들
    tether: {
        name: "Tether",
        symbol: "USDT",
        image: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
        color: "#26a17b"
    },
    usd_coin: {
        name: "USD Coin",
        symbol: "USDC",
        image: "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
        color: "#2775ca"
    },
    
    // 게임/NFT 토큰들
    axie_infinity: {
        name: "Axie Infinity",
        symbol: "AXS",
        image: "https://assets.coingecko.com/coins/images/13029/large/axie_infinity_logo.png",
        color: "#0055d4"
    },
    decentraland: {
        name: "Decentraland",
        symbol: "MANA",
        image: "https://assets.coingecko.com/coins/images/878/large/decentraland-mana.png",
        color: "#ff2d55"
    },
    the_sandbox: {
        name: "The Sandbox",
        symbol: "SAND",
        image: "https://assets.coingecko.com/coins/images/12129/large/sandbox_logo.jpg",
        color: "#00adef"
    },
    
    // 기타 인기 코인들
    cosmos: {
        name: "Cosmos",
        symbol: "ATOM",
        image: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png",
        color: "#2e3148"
    },
    algorand: {
        name: "Algorand",
        symbol: "ALGO",
        image: "https://assets.coingecko.com/coins/images/4380/large/download.png",
        color: "#000000"
    },
    fantom: {
        name: "Fantom",
        symbol: "FTM",
        image: "https://assets.coingecko.com/coins/images/4001/large/Fantom.png",
        color: "#13b5ec"
    },
    near_protocol: {
        name: "NEAR Protocol",
        symbol: "NEAR",
        image: "https://assets.coingecko.com/coins/images/10365/large/near_icon.png",
        color: "#00ec97"
    },
    internet_computer: {
        name: "Internet Computer",
        symbol: "ICP",
        image: "https://assets.coingecko.com/coins/images/14495/large/Internet_Computer_logo.png",
        color: "#29abe2"
    }
};

// 코인 배열로 변환 (랜덤 선택용)
const COIN_IMAGES_ARRAY = Object.entries(COIN_IMAGES_DB).map(([key, coin]) => ({
    id: key,
    ...coin
}));

// 랜덤 코인 선택 함수
function getRandomCoins(count = 6) {
    const shuffled = [...COIN_IMAGES_ARRAY].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 특정 코인 검색 함수
function getCoinById(id) {
    return COIN_IMAGES_DB[id] || null;
}

// 심볼로 코인 검색
function getCoinBySymbol(symbol) {
    return COIN_IMAGES_ARRAY.find(coin => coin.symbol.toLowerCase() === symbol.toLowerCase()) || null;
}

// Firebase에 저장할 데이터 형태로 변환
function getCoinImageDataForFirebase() {
    return {
        coins: COIN_IMAGES_DB,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
    };
}

// 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        COIN_IMAGES_DB,
        COIN_IMAGES_ARRAY, 
        getRandomCoins,
        getCoinById,
        getCoinBySymbol,
        getCoinImageDataForFirebase
    };
}