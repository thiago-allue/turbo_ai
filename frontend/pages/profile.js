import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Form, Input, Button, message, Row, Col } from 'antd'
import api from '../services/api'

export default function ProfilePage() {
  const router = useRouter()
  const [form] = Form.useForm()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const res = await api.getProfile()
      form.setFieldsValue({
        email: res.data.username,           // read-only
        firstName: res.data.first_name || '',
        lastName: res.data.last_name || '',
        currentPassword: '',
        newPassword: '',
        repeatNewPassword: ''
      })
    } catch (err) {
      console.error(err)
      message.error('Could not load profile.')
    }
  }

  const onFinish = async (values) => {
    message.destroy()  // clear old messages
    try {
      await api.updateProfile({
        first_name: values.firstName,
        last_name: values.lastName,
        current_password: values.currentPassword,
        new_password: values.newPassword,
        repeat_new_password: values.repeatNewPassword
      })

      // Store the updated first name in localStorage so that the Dashboard
      // "Welcome, {name}" reflects the new name next time we see it.
      const newFirstName = (values.firstName || '').trim()
      localStorage.setItem('first_name', newFirstName)

      message.success('Profile updated successfully.')

      // Clear only the password fields
      form.setFieldsValue({
        currentPassword: '',
        newPassword: '',
        repeatNewPassword: ''
      })
    } catch (err) {
      console.error(err)
      message.error(err.response?.data?.error || 'Failed to update profile.')
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Edit Profile</h1>

      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        style={{ marginTop: 20 }}
      >
        {/* Email => read-only */}
        <Form.Item label='Email (read-only)' name='email'>
          <Input disabled />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='First Name' name='firstName'>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Last Name' name='lastName'>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <hr />

        <Form.Item
          label='Current Password (required to set a new password)'
          name='currentPassword'
        >
          <Input.Password />
        </Form.Item>

        <Form.Item label='New Password' name='newPassword'>
          <Input.Password />
        </Form.Item>

        <Form.Item label='Repeat New Password' name='repeatNewPassword'>
          <Input.Password />
        </Form.Item>

        <div style={{ marginTop: 20 }}>
          <Button type='primary' htmlType='submit'>
            Save Changes
          </Button>
          <Button style={{ marginLeft: 20 }} onClick={handleBack}>
            Back to Dashboard
          </Button>
        </div>
      </Form>
    </div>
  )
}
