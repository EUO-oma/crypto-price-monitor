/**
 * Netlify Functions API 클라이언트
 * Supabase 호출을 서버사이드 프록시를 통해 처리
 */

class NetlifyAPI {
    constructor() {
        this.baseUrl = '/.netlify/functions';
    }

    async request(functionName, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${functionName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Netlify API 오류 (${functionName}):`, error);
            throw error;
        }
    }

    // Supabase 프록시 메서드들
    async supabaseSelect(table, options = {}) {
        return this.request('supabase-proxy', {
            action: 'select',
            table,
            data: { select: options.select },
            filter: options.filter,
            auth: options.auth
        });
    }

    async supabaseInsert(table, data, options = {}) {
        return this.request('supabase-proxy', {
            action: 'insert',
            table,
            data,
            auth: options.auth
        });
    }

    async supabaseUpdate(table, values, match, options = {}) {
        return this.request('supabase-proxy', {
            action: 'update',
            table,
            data: { values, match },
            auth: options.auth
        });
    }

    async supabaseDelete(table, match, options = {}) {
        return this.request('supabase-proxy', {
            action: 'delete',
            table,
            data: { match },
            auth: options.auth
        });
    }

    async checkAuth(options = {}) {
        return this.request('supabase-proxy', {
            action: 'auth_check',
            auth: options.auth
        });
    }
}

// 전역 인스턴스 생성
window.netlifyAPI = new NetlifyAPI();

// 편의 함수들
window.useNetlifyAPI = function() {
    return window.netlifyAPI;
};

// Supabase 대체 함수들 (기존 코드와 호환성)
window.createNetlifySupabaseClient = function() {
    const api = window.netlifyAPI;
    
    return {
        from: function(table) {
            return {
                select: function(columns = '*') {
                    return {
                        async then(callback) {
                            try {
                                const result = await api.supabaseSelect(table, { select: columns });
                                callback(result);
                            } catch (error) {
                                callback({ data: null, error });
                            }
                        },
                        eq: function(column, value) {
                            return this.filter({ eq: { column, value } });
                        },
                        order: function(column, options = {}) {
                            return this.filter({ order: { column, ascending: options.ascending } });
                        },
                        limit: function(count) {
                            return this.filter({ limit: count });
                        },
                        filter: function(filterObj) {
                            const self = this;
                            return {
                                async then(callback) {
                                    try {
                                        const result = await api.supabaseSelect(table, { 
                                            select: columns, 
                                            filter: filterObj 
                                        });
                                        callback(result);
                                    } catch (error) {
                                        callback({ data: null, error });
                                    }
                                }
                            };
                        }
                    };
                },
                insert: function(data) {
                    return {
                        async then(callback) {
                            try {
                                const result = await api.supabaseInsert(table, data);
                                callback(result);
                            } catch (error) {
                                callback({ data: null, error });
                            }
                        }
                    };
                },
                update: function(values) {
                    return {
                        eq: function(column, value) {
                            return {
                                async then(callback) {
                                    try {
                                        const result = await api.supabaseUpdate(table, values, { [column]: value });
                                        callback(result);
                                    } catch (error) {
                                        callback({ data: null, error });
                                    }
                                }
                            };
                        }
                    };
                },
                delete: function() {
                    return {
                        eq: function(column, value) {
                            return {
                                async then(callback) {
                                    try {
                                        const result = await api.supabaseDelete(table, { [column]: value });
                                        callback(result);
                                    } catch (error) {
                                        callback({ data: null, error });
                                    }
                                }
                            };
                        }
                    };
                }
            };
        }
    };
};

console.log('✅ Netlify API 클라이언트 로드됨');