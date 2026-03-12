import { Button, Input, Form, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { login } from '../api/users';
// placeholder illustration since figma assets aren't accessible during build
const loginImage = 'https://tackexinh.com/wp-content/uploads/2021/04/hinh-anh-lang-que-viet-nam-06.jpg';

export function Login() {
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        // normalize input: trim and lowercase email
        const normalized = {
            email: values.email.trim().toLowerCase(),
            password: values.password
        };
        console.log('handleLogin values', normalized);
        try {
            const { token, user } = await login(normalized);
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
            message.success('Đăng nhập thành công!');
            // redirect based on role
            if (user.accountType === 'admin') {
                navigate('/users');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('frontend login error', err);
            // show back-end message if available
            message.error(err.message || 'Email hoặc mật khẩu không đúng!');
        }
    };

    const handleClose = () => {
        navigate('/');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20
            }}
            onClick={handleClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    display: 'grid',
                    gridTemplateColumns: '500px 500px',
                    backgroundColor: 'white',
                    borderRadius: 8,
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    maxWidth: 1000,
                    width: '100%'
                }}
            >
                {/* Left Side - Login Form */}
                <div style={{
                    padding: '48px 48px',
                    position: 'relative',
                    backgroundColor: 'white'
                }}>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color: '#2C3E50',
                        marginBottom: 48,
                        marginTop: 0
                    }}>
                        ĐĂNG NHẬP
                    </h1>

                    <Form
                        layout="vertical"
                        onFinish={handleLogin}
                        autoComplete="off"
                    >
                        <Form.Item
                            label={<span style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>Email</span>}
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                size="large"
                                placeholder=""
                                style={{
                                    borderRadius: 4,
                                    fontSize: 15
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontSize: 15, color: '#666', fontWeight: 500 }}>Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            style={{ marginBottom: 16 }}
                        >
                            <Input.Password
                                size="large"
                                type="password"
                                placeholder=""
                                iconRender={(visible) => (
                                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                                )}
                                style={{
                                    borderRadius: 4,
                                    fontSize: 15
                                }}
                            />
                        </Form.Item>

                        <div style={{ marginBottom: 32, textAlign: 'left' }}>
                            <a
                                href="#"
                                style={{
                                    color: '#1890FF',
                                    fontSize: 14,
                                    textDecoration: 'none'
                                }}
                            >
                                Quên mật khẩu?
                            </a>
                        </div>

                        <Form.Item style={{ marginBottom: 32 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                style={{
                                    backgroundColor: '#1890FF',
                                    borderColor: '#1890FF',
                                    height: 50,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    borderRadius: 4
                                }}
                            >
                                ĐĂNG NHẬP
                            </Button>
                        </Form.Item>
                    </Form>

                    <div style={{
                        fontSize: 13,
                        color: '#999',
                        textAlign: 'center',
                        lineHeight: 1.6
                    }}>
                        Website <strong>http://sachso.edu.vn</strong> chuyển sang<br />
                        <strong>https://sachdientu.phuongnam.edu.vn</strong><br />
                        Từ ngày 24/10/2025
                    </div>
                </div>

                {/* Right Side - Illustration */}
                <div style={{
                    background: 'linear-gradient(135deg, #1890FF 0%, #0050B3 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 40
                }}>
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            color: 'white',
                            fontSize: 20,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                    <img
                        src={loginImage}
                        alt="Login Illustration"
                        style={{
                            width: '120%',
                            height: '120%',
                            maxWidth: 1000
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;