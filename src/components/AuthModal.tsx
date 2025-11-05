'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

type AuthModalProps = {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password)
      
      if (error) throw error
      
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card-bg rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          {isLogin ? '로그인' : '회원가입'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-hover-bg border border-border-color rounded focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          {error && (
            <div className="text-danger text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-text-secondary">
          {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-primary hover:underline"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </p>
      </div>
    </div>
  )
}