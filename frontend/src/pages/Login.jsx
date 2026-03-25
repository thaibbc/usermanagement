import { Button, Input, Form, message, Spin, Layout, Row, Col, Card } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/users';
import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import { useUser } from '../context/UserContext'; // Import useUser thay vì UserContext

const loginImage =
    'https://tackexinh.com/wp-content/uploads/2021/04/hinh-anh-lang-que-viet-nam-06.jpg';

export function Login() {
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();
    const isMobile = useIsMobile(770);
    const { setUser } = useUser(); // Sử dụng useUser hook

    const handleLogin = async (values) => {
        const normalized = {
            email: values.email.trim().toLowerCase(),
            password: values.password
        };

        setLoading(true);

        try {
            const { token, user } = await login(normalized);

            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user, token);

            window.dispatchEvent(new Event('userUpdated'));

            message.success('Đăng nhập thành công!');
            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            message.error(err.message || 'Email hoặc mật khẩu không đúng!');
        } finally {
            setLoading(false);
        }
    };

    const responsiveCss = `
        @media (max-width:780px){
            .login-wrapper{
                padding:16px;
            }
            .login-form-wrapper{
                width:100vw !important;
                max-width:100vw !important;
            }
        }

        @media (max-width:770px){
            .login-form-wrapper{
                width:80vw !important;
                max-width:80vw !important;
                margin: 0 auto;
            }
        }

        @media (max-width:325px){
            .login-wrapper{
                padding:8px;
            }
            .login-form-wrapper{
                width:100vw !important;
                max-width:100vw !important;
            }
            .ant-card{
                width:100%;
            }
        }

        @media (max-width:668px) {
            .close-btn {
                display: none !important;
            }
        }
    `;

    return (
        <Layout
            className="login-wrapper"
            style={{
                minHeight: '100vh',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={() => navigate('/')}
        >
            <style>{responsiveCss}</style>

            <Spin spinning={loading} description="Đang đăng nhập..." size="large">
                <Row
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        background: '#fff',
                        borderRadius: 10,
                        overflow: 'hidden',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                        width: '100%',
                        maxWidth: 1000
                    }}
                >
                    <Button
                        className="close-btn"
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 14,
                            left: 'auto',
                            fontSize: 18,
                            borderRadius: '50%',
                            border: '1px solid #d9d9d9',
                            background: '#fff',
                            zIndex: 1000,
                        }}
                    />

                    {/* LEFT LOGIN FORM */}
                    <Col xs={24} md={12}
                        className="login-container"
                        style={{
                            background: '#f8faff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div className="login-form-wrapper" style={{
                            width: '100%',
                            maxWidth: isMobile ? 480 : 420,
                            margin: '0 auto',
                            padding: isMobile ? '0px' : 0
                        }}>
                            <h1
                                style={{
                                    fontSize: 26,
                                    fontWeight: 700,
                                    color: '#1f3a75',
                                    marginBottom: 24,
                                    textAlign: 'center'
                                }}
                            >
                                ĐĂNG NHẬP
                            </h1>

                            <Card
                                bordered={false}
                                style={{
                                    borderRadius: 10,
                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                                }}
                            >
                                <Form
                                    layout="vertical"
                                    onFinish={handleLogin}
                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input
                                            size="large"
                                            autoComplete="email"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu"
                                        name="password"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                                    >
                                        <Input.Password
                                            size="large"
                                            autoComplete="current-password"
                                            iconRender={(visible) => visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        />
                                    </Form.Item>

                                    <div style={{ marginBottom: 20 }}>
                                        <a
                                            onClick={() => navigate('/forgot-password')}
                                            style={{
                                                color: '#1677ff',
                                                fontSize: 14,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Quên mật khẩu?
                                        </a>
                                    </div>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            block
                                            size="large"
                                            style={{
                                                height: 46,
                                                fontWeight: 600,
                                                borderRadius: 6
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
                                        marginTop: 10
                                    }}
                                >
                                    Website <b>http://sachso.edu.vn</b>
                                    <br />
                                    chuyển sang
                                    <br />
                                    <b>https://sachdientu.phuongnam.edu.vn</b>
                                    <br />
                                    Từ ngày 24/10/2025
                                </div>
                            </Card>
                        </div>
                    </Col>

                    {/* RIGHT IMAGE */}
                    {!isMobile && (
                        <Col md={12}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#eef3ff',
                            }}
                        >
                            <img
                                src={loginImage}
                                alt="login"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Col>
                    )}
                </Row>
            </Spin>
        </Layout>
    );
}

export default Login;