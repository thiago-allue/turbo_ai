import React from 'react';
import { Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

export default function StyledPasswordInput({ value, onChange, style }) {
  return (
    <>
      <style jsx global>{`
        ::placeholder {
          color: #947038;
          font-family: "Inter-Regular", Helvetica, sans-serif;
          font-size: 12px;
        }
      `}</style>
      <Input.Password
        value={value}
        onChange={onChange}
        placeholder="Password"
        style={{
          height: '39px',
          backgroundColor: '#fff9e6',
          border: '1px solid #8B6A29',
          borderRadius: '6px',
          color: '#000000',
          boxSizing: 'border-box',
          ...style
        }}
        iconRender={(visible) =>
          visible
            ? <EyeTwoTone twoToneColor="#8B6A29" />
            : <EyeInvisibleOutlined style={{ color: '#8B6A29' }} />
        }
      />
    </>
  );
}
