// 디버깅 로거 모듈
export class DebugLogger {
    constructor(supabaseClient, source = 'unknown') {
        this.supabase = supabaseClient;
        this.source = source;
        this.sessionId = this.generateSessionId();
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async log(level, message, data = null) {
        try {
            const logEntry = {
                level: level,
                source: this.source,
                message: message,
                data: data,
                user_agent: navigator.userAgent,
                session_id: this.sessionId
            };

            // 콘솔에도 출력
            console.log(`[${level.toUpperCase()}] ${this.source}: ${message}`, data || '');

            // Supabase에 저장
            const { error } = await this.supabase
                .from('debug_logs')
                .insert([logEntry]);

            if (error) {
                console.error('디버그 로그 저장 실패:', error);
            }
        } catch (err) {
            console.error('디버그 로거 오류:', err);
        }
    }

    async info(message, data = null) {
        await this.log('info', message, data);
    }

    async warning(message, data = null) {
        await this.log('warning', message, data);
    }

    async error(message, data = null) {
        await this.log('error', message, data);
    }

    async success(message, data = null) {
        await this.log('success', message, data);
    }

    // 최근 로그 조회
    async getRecentLogs(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('debug_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('로그 조회 실패:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('로그 조회 오류:', err);
            return [];
        }
    }

    // 특정 소스의 로그 조회
    async getLogsBySource(source, limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('debug_logs')
                .select('*')
                .eq('source', source)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('로그 조회 실패:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('로그 조회 오류:', err);
            return [];
        }
    }

    // 에러 로그만 조회
    async getErrorLogs(limit = 50) {
        try {
            const { data, error } = await this.supabase
                .from('debug_logs')
                .select('*')
                .eq('level', 'error')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('에러 로그 조회 실패:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('에러 로그 조회 오류:', err);
            return [];
        }
    }
}