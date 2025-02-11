import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../services/api'

// --- Inline style objects ---
const macbookAirStyles = {
  backgroundColor: '#fff9e6', // Very soft yellow, almost white
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100vh',
  boxSizing: 'border-box',
  padding: '40px 0',
}

const innerDivStyles = {
  backgroundColor: '#fff9e6', // Updated color
  height: '832px',
  position: 'relative',
  width: '1280px',
}

const categoryDropdownStyles = {
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
  left: '448px',
  position: 'absolute',
  top: '334px',
  width: '384px',
}

const randomThoughtsWrapperStyles = {
  alignItems: 'center',
  alignSelf: 'stretch',
  border: '1px solid #947038',
  borderRadius: '6px',
  display: 'flex',
  gap: '8px',
  height: '39px',
  padding: '7px 15px',
  position: 'relative',
  width: '100%',
}

const inputStyle = {
  color: '#000',
  flex: 1,
  fontFamily: 'Inter-Regular, Helvetica',
  fontSize: '12px',
  fontWeight: 400,
  letterSpacing: 0,
  lineHeight: 'normal',
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
}

const overlapGroupStyles = {
  height: '55px',
  left: '448px',
  position: 'absolute',
  top: '386px',
  width: '384px',
}

const categoryDropdownWrapperStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '384px',
  display: 'flex',
  flexDirection: 'column',
  gap: '7px',
}

const randomThoughtsWrapperStylesPassword = {
  ...randomThoughtsWrapperStyles,
  marginBottom: '8px',
}

const checkboxLabelStyles = {
  color: '#957139',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  marginLeft: '2px',
}

const yayYoureBackStyles = {
  color: '#88632a',
  fontFamily: 'Inria Serif-Bold, Helvetica',
  fontSize: '48px',
  fontWeight: 700,
  position: 'absolute',
  left: '456px',
  top: '240px',
}

const formStyles = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: '0',
  left: '0',
}

const buttonStyles = {
  all: 'unset',
  alignItems: 'center',
  border: '1px solid #947038',
  borderRadius: '46px',
  boxSizing: 'border-box',
  display: 'flex',
  gap: '6px',
  height: '43px',
  justifyContent: 'center',
  left: '448px',
  padding: '12px 16px',
  position: 'absolute',
  top: '468px',
  width: '384px',
  cursor: 'pointer',
}

const newNoteStyles = {
  color: '#947038',
  fontFamily: 'Inter-Bold, Helvetica',
  fontSize: '16px',
  fontWeight: 700,
  letterSpacing: 0,
  lineHeight: 'normal',
  marginTop: '-1px',
  position: 'relative',
  whiteSpace: 'nowrap',
  width: 'fit-content',
}

const errorStyle = {
  color: 'red',
  position: 'absolute',
  left: '448px',
  top: '290px',
  fontFamily: 'Inter-Regular, Helvetica',
}

const linkWrapperStyles = {
  position: 'absolute',
  left: '448px',
  top: '525px',
  width: '384px',
  textAlign: 'center',
}

const linkTextStyle = {
  textDecoration: 'underline',
  fontSize: '12px',
  color: '#947038',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.login({ username: email, password })
      const token = res.data.token
      localStorage.setItem('token', token)

      const { first_name } = res.data.user
      localStorage.setItem('first_name', first_name || '')

      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={macbookAirStyles}>
      <style jsx global>{`
        a,
        a:visited,
        a:hover,
        a:active {
          color: #947038 !important;
        }
      `}</style>

      <div style={innerDivStyles}>
        {error && <p style={errorStyle}>{error}</p>}

        <div style={yayYoureBackStyles}>Yay, You&apos;re Back!</div>

        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={categoryDropdownStyles}>
            <div style={randomThoughtsWrapperStyles}>
              <input
                style={inputStyle}
                placeholder="Email address"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={overlapGroupStyles}>
            <div style={categoryDropdownWrapperStyles}>
              <div style={randomThoughtsWrapperStylesPassword}>
                <input
                  style={inputStyle}
                  placeholder="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <label style={checkboxLabelStyles}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                Show Password
              </label>
            </div>
          </div>

          <button type="submit" style={buttonStyles}>
            <div style={newNoteStyles}>Login</div>
          </button>

          <div style={linkWrapperStyles}>
            <Link href="/signup" style={linkTextStyle}>
              Oops! I’ve never been here before
            </Link>
          </div>
        </form>

        <img
          style={{
            height: '114px',
            objectFit: 'cover',
            position: 'absolute',
            left: '580px',
            top: '94px',
            width: '95px',
          }}
          alt="Plant"
          src="/plant.png"
        />
      </div>
    </div>
  )
}
