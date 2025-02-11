import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../services/api'
import InputPasswordCustom from '../components/InputPasswordCustom'

export default function SignUp() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await api.register({
        first_name: firstName,
        last_name: lastName,
        username: email,
        password
      })
      const token = res.data.token
      localStorage.setItem('token', token)

      const { first_name } = res.data.user
      localStorage.setItem('first_name', first_name || '')

      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <>
      <style>{`
        .sign-up-container {
          background-color: #fff9e6;
          display: flex;
          justify-content: center;
          width: 100%;
          margin-top: 137px;
        }

        .content {
          background-color: #fff9e6;
          position: relative;
          width: 1280px;
          height: 832px;
          font-family: "Inter-Regular", Helvetica, sans-serif;
          color: #947038;
        }

        .cat-image {
          position: absolute;
          top: -7px;
          left: 535px;
          width: 188px;
          height: 134px;
          object-fit: cover;
        }

        .headline {
          position: absolute;
          top: 139px;
          left: 459px;
          font-family: "Inria Serif-Bold", Helvetica, sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #88632a;
        }

        .error-text {
          position: absolute;
          top: 160px;
          left: 480px;
          color: red;
        }

        .form-container {
          position: absolute;
          top: 200px;
          left: 448px;
          width: 384px;
        }

        .name-inputs {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .field-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid #947038;
          border-radius: 6px;
          height: 39px;
          padding: 7px 15px;
          flex: 1;
        }

        .field-wrapper.first-name-field {
          flex: none;
          width: calc(50% - 15px);
        }

        .input-field {
          background: none;
          border: none;
          outline: none;
          flex: 1;
          font-size: 12px;
          color: #000;
        }

        .single-field {
          margin-bottom: 10px;
        }

        .signup-button {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #947038;
          border-radius: 46px;
          padding: 12px 16px;
          width: 350px;
          height: 18px;
          margin-top: 10px;
        }

        .signup-button-text {
          color: #947038;
          font-family: "Inter-Bold", Helvetica, sans-serif;
          font-weight: 700;
          font-size: 16px;
          margin-top: -1px;
        }

        .login-link {
          position: absolute;
          top: 410px;
          left: 448px;
          width: 384px;
          text-align: center;
          text-decoration: underline;
          font-size: 12px;
          color: #947038;
          cursor: pointer;
        }
      `}</style>

      <div className="sign-up-container">
        <div className="content">
          <img className="cat-image" src="/cat.png" alt="Cute cat" />

          <div className="headline">Yay, New Friend!</div>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit} className="form-container">
            <div className="name-inputs">
              <div className="field-wrapper first-name-field">
                <input
                  className="input-field"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="field-wrapper">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="single-field">
              <div className="field-wrapper">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="single-field">
              <InputPasswordCustom
                style={{
                  width: '100%',
                  height: '39px',
                  border: '1px solid #947038',
                  borderRadius: '6px',
                  padding: '7px 15px',
                  boxSizing: 'border-box'
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="signup-button">
              <div className="signup-button-text">Sign Up</div>
            </button>
          </form>

          <Link href="/" legacyBehavior>
            <a className="login-link">We’re already friends!</a>
          </Link>
        </div>
      </div>
    </>
  )
}
