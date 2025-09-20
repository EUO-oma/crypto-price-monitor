/**
 * Netlify Functions: Supabase API 프록시
 * 환경변수를 서버사이드에서만 사용하여 보안 강화
 */

const { createClient } = require('@supabase/supabase-js');

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

exports.handler = async (event, context) => {
  // CORS preflight 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // 환경 변수에서 Supabase 설정 읽기
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Supabase 환경 변수가 설정되지 않았습니다.',
          details: {
            url: !!supabaseUrl,
            key: !!supabaseKey
          }
        }),
      };
    }

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 요청 파싱
    const { action, table, data, filter, auth } = JSON.parse(event.body || '{}');

    // 인증 토큰이 있으면 설정
    if (auth && auth.token) {
      supabase.auth.setAuth(auth.token);
    }

    let result;

    // 작업별 처리
    switch (action) {
      case 'select':
        let query = supabase.from(table).select(data.select || '*');
        
        // 필터 적용
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (key === 'eq') {
              query = query.eq(value.column, value.value);
            } else if (key === 'order') {
              query = query.order(value.column, { ascending: value.ascending !== false });
            } else if (key === 'limit') {
              query = query.limit(value);
            }
          });
        }
        
        result = await query;
        break;

      case 'insert':
        result = await supabase.from(table).insert(data);
        break;

      case 'update':
        let updateQuery = supabase.from(table).update(data.values);
        if (data.match) {
          Object.entries(data.match).forEach(([key, value]) => {
            updateQuery = updateQuery.eq(key, value);
          });
        }
        result = await updateQuery;
        break;

      case 'delete':
        let deleteQuery = supabase.from(table);
        if (data.match) {
          Object.entries(data.match).forEach(([key, value]) => {
            deleteQuery = deleteQuery.eq(key, value);
          });
        }
        result = await deleteQuery.delete();
        break;

      case 'auth_check':
        // 인증 상태 확인
        const { data: { session } } = await supabase.auth.getSession();
        result = { data: { session }, error: null };
        break;

      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: '지원하지 않는 작업입니다.' }),
        };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Supabase 프록시 오류:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: '서버 오류가 발생했습니다.',
        message: error.message,
      }),
    };
  }
};