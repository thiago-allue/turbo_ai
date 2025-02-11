import styled from 'styled-components'
import { Input } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'

const StyledPassword = styled(Input.Password)`
  && {
    height: 39px;
    background-color: #fff9e6;
    border: 1px solid #8B6A29;
    border-radius: 6px;
    box-sizing: border-box;

    /* Placeholder styling */
    ::placeholder {
      color: #947038;
      font-family: "Inter-Regular", Helvetica, sans-serif;
      font-size: 12px;
    }
  }
`

export default function InputPasswordCustom({ value, onChange, style }) {
  return (
    <StyledPassword
      value={value}
      onChange={onChange}
      placeholder="Password"
      style={style}
      iconRender={(visible) =>
        visible
          ? <EyeTwoTone twoToneColor="#8B6A29" />
          : <EyeInvisibleOutlined style={{ color: '#8B6A29' }} />
      }
    />
  )
}
