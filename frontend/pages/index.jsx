/**
 * Login page for existing users.
 * Allows entering an email and password, with a link to sign up.
 */

import {useState} from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import api from '../services/api'
import InputPasswordCustom from '../components/InputPasswordCustom'

const macbookAirStyles = {
  backgroundColor: '#fff9e6',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100vh',
  boxSizing: 'border-box',
  padding: '40px 0',
}

const innerDivStyles = {
  backgroundColor: '#fff9e6',
  height: '832px',
  position: 'relative',
  width: '1280px',
}

const emailContainerStyles = {
  position: 'absolute',
  top: '334px',
  left: '448px',
  width: '384px',
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #947038',
  borderRadius: '6px',
  height: '39px',
  padding: '7px 15px',
  boxSizing: 'border-box',
}

const passwordContainerStyles = {
  position: 'absolute',
  top: '386px',
  left: '448px',
  width: '384px',
}

const loginButtonStyles = {
  all: 'unset',
  cursor: 'pointer',
  position: 'absolute',
  top: '438px',
  left: '448px',
  width: '384px',
  height: '43px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #947038',
  borderRadius: '46px',
  padding: '12px 16px',
  boxSizing: 'border-box',
}

const loginTextStyles = {
  color: '#947038',
  fontFamily: 'Inter-Bold, Helvetica',
  fontSize: '16px',
  fontWeight: 700,
  marginTop: '-1px',
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
  top: '495px',
  left: '448px',
  width: '384px',
  textAlign: 'center',
}

const linkTextStyle = {
  textDecoration: 'underline',
  fontSize: '12px',
  color: '#947038',
}

const headingStyles = {
  position: 'absolute',
  top: '240px',
  left: '456px',
  color: '#88632a',
  fontFamily: 'Inria Serif-Bold, Helvetica',
  fontSize: '48px',
  fontWeight: 700,
}

export default function LoginPage() {

  // Next.js router for navigation
  const router = useRouter()

  // State for user input
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  /**
   * Handles the login form submission.
   * Calls the API, and on success, sets local storage and navigates to the dashboard.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await api.login({username: email, password})
      const token = res.data.token
      localStorage.setItem('token', token)

      const {first_name} = res.data.user
      localStorage.setItem('first_name', first_name || '')

      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={macbookAirStyles}>
      <style jsx global>{`
        ::placeholder {
          color: #947038;
          font-family: "Inter-Regular", Helvetica, sans-serif;
          font-size: 12px;
        }

        a,
        a:visited,
        a:hover,
        a:active {
          color: #947038 !important;
        }
      `}</style>

      <div style={innerDivStyles}>
        {error && <p style={errorStyle}>{error}</p>}

        <div style={headingStyles}>Yay, You&apos;re Back!</div>

        <form onSubmit={handleSubmit}>
          <div style={emailContainerStyles}>
            <input
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#000',
                fontSize: '12px',
                fontFamily: 'Inter-Regular, Helvetica',
              }}
              placeholder="Email address"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={passwordContainerStyles}>
            <InputPasswordCustom
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" style={loginButtonStyles}>
            <div style={loginTextStyles}>Login</div>
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
            width: '95px',
            objectFit: 'cover',
            position: 'absolute',
            left: '580px',
            top: '94px',
          }}
          alt="Plant"
          src="/plant.png"
        />
      </div>
    </div>
  )
}
