import { Button, Input, Form, message, Spin } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/users';
import React from 'react';
import useIsMobile from '../hooks/useIsMobile';

const loginImage =
    'https://tackexinh.com/wp-content/uploads/2021/04/hinh-anh-lang-que-viet-nam-06.jpg';

export function Login() {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const isMobile = useIsMobile(1350);

    const handleLogin = async (values) => {
        const normalized = {
            email: values.email.trim().toLowerCase(),
            password: values.password,
        };

        setLoading(true);

        try {
            const { token, user } = await login(normalized);

            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));

            message.success('Đăng nhập thành công!');

            if (user.accountType === 'admin') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('frontend login error', err);
            message.error(err.message || 'Email hoặc mật khẩu không đúng!');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
            }}
            onClick={handleClose}
        >
            <Spin spinning={loading} tip="Đang đăng nhập..." size="large">
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '600px' : '600px 600px',
                        backgroundColor: 'white',
                        borderRadius: 8,
                        overflow: 'hidden',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        maxWidth: isMobile ? 700 : 1000,
                        width: '100%',
                    }}
                >
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: '#666',
                            fontSize: 20,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: '2px solid #d9d9d9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                        }}
                    />

                    {/* Left Side - Login Form */}
                    <div
                        style={{
                            padding: '48px',
                            backgroundColor: 'white',
                            position: 'relative',
                        }}
                    >

                        <h1
                            style={{
                                fontSize: 32,
                                fontWeight: 700,
                                color: '#2C3E50',
                                marginBottom: 48,
                            }}
                        >
                            ĐĂNG NHẬP
                        </h1>

                        <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                            <Form.Item
                                label={
                                    <span style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>
                                        Email
                                    </span>
                                }
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input size="large" style={{ borderRadius: 4 }} />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>
                                        Mật khẩu
                                    </span>
                                }
                                name="password"
                                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                style={{ marginBottom: 16 }}
                            >
                                <Input.Password
                                    size="large"
                                    iconRender={(visible) =>
                                        visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                    }
                                    style={{ borderRadius: 4 }}
                                />
                            </Form.Item>

                            <div style={{ marginBottom: 32 }}>
                                <a
                                    onClick={() => navigate('/forgot-password')}
                                    style={{
                                        color: '#1890FF',
                                        fontSize: 14,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>

                            <Form.Item style={{ marginBottom: 32 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    disabled={loading}
                                    block
                                    size="large"
                                    style={{
                                        height: 50,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        borderRadius: 4,
                                    }}
                                >
                                    ĐĂNG NHẬP
                                </Button>
                            </Form.Item>
                        </Form>

                        <div
                            style={{
                                fontSize: 13,
                                color: '#999',
                                textAlign: 'center',
                                lineHeight: 1.6,
                            }}
                        >
                            Website <strong>http://sachso.edu.vn</strong> chuyển sang
                            <br />
                            <strong>https://sachdientu.phuongnam.edu.vn</strong>
                            <br />
                            Từ ngày 24/10/2025
                        </div>
                    </div>

                    {/* Right Side - Illustration */}
                    {!isMobile && (
                        <div
                            style={{
                                background: 'linear-gradient(135deg,#1890FF 0%,#0050B3 100%)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 40,
                            }}
                        >

                            <img
                                src={loginImage}
                                alt="Login Illustration"
                                style={{
                                    width: '120%',
                                    height: '120%',
                                    maxWidth: 1000,
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    )}
                </div>
            </Spin>
        </div>
    );
}

export default Login;