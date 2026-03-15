import { useState } from 'react';
import { Button, Space, Layout, Row, Col, Drawer } from 'antd';
import { useNavigate } from 'react-router';
import { HomeOutlined, BookOutlined, MenuOutlined } from '@ant-design/icons';
import useIsMobile from '../hooks/useIsMobile';

export function Home() {
    const navigate = useNavigate();
    const isMobile = useIsMobile(1350);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const heroImage = 'https://images.unsplash.com/photo-1588912914017-923900a34710?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdsaXNoJTIwdGV4dGJvb2slMjBlZHVjYXRpb258ZW58MXx8fHwxNzczMjgxMzQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F9FA' }}>
            <Layout.Header style={{
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                padding: isMobile ? '12px 20px' : '16px 40px'
            }}>
                <Row justify="space-between" align="middle" style={{ maxWidth: 1400, margin: '0 auto' }}>
                    <Col>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 32,
                                height: 32,
                                background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                                borderRadius: 6,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: 'white'
                            }}>
                                <BookOutlined style={{ fontSize: 18, color: 'white' }} />
                            </div>
                            <span style={{
                                fontSize: 20,
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                Sách Điện Tử
                            </span>
                        </div>
                    </Col>

                    <Col>
                        {isMobile ? (
                            <Button
                                type="text"
                                icon={<MenuOutlined style={{ fontSize: 24 }} />}
                                onClick={() => setDrawerOpen(true)}
                            />
                        ) : (
                            <Space size={32}>
                                <a
                                    onClick={() => {
                                        const logged = !!(typeof window !== 'undefined' && localStorage.getItem('authToken'));
                                        navigate(logged ? '/profile' : '/');
                                    }}
                                    style={{
                                        color: '#1890FF',
                                        textDecoration: 'none',
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }}
                                >
                                    <HomeOutlined /> Trang chủ
                                </a>
                                <a
                                    onClick={() => navigate('/')}
                                    style={{
                                        color: '#1890FF',
                                        textDecoration: 'none',
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Phương Nam
                                </a>
                                <a
                                    onClick={() => navigate('/login')}
                                    style={{
                                        color: '#1890FF',
                                        textDecoration: 'none',
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Đăng nhập
                                </a>
                                <a
                                    onClick={() => navigate('/register')}
                                    style={{
                                        color: '#1890FF',
                                        textDecoration: 'none',
                                        fontSize: 15,
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Đăng ký học sinh
                                </a>
                            </Space>
                        )}
                    </Col>
                </Row>
            </Layout.Header>

            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setDrawerOpen(false)}
                open={drawerOpen}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Button block type="text" onClick={() => { setDrawerOpen(false); navigate('/'); }}>
                        Trang chủ
                    </Button>
                    <Button block type="text" onClick={() => { setDrawerOpen(false); navigate('/'); }}>
                        Phương Nam
                    </Button>
                    <Button block type="text" onClick={() => { setDrawerOpen(false); navigate('/login'); }}>
                        Đăng nhập
                    </Button>
                    <Button block type="primary" onClick={() => { setDrawerOpen(false); navigate('/register'); }}>
                        Đăng ký học sinh
                    </Button>
                </Space>
            </Drawer>

            <Layout.Content style={{ padding: 0 }}>
                <Row
                    justify="center"
                    align="middle"
                    style={{
                        maxWidth: 1400,
                        margin: '0 auto',
                        padding: isMobile ? '40px 24px' : '80px 48px'
                    }}
                    gutter={[isMobile ? 24 : 48, 24]}
                >
                    <Col xs={24} md={12}>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                top: -20,
                                left: -20,
                                width: 80,
                                height: 80,
                                backgroundColor: '#E3F2FD',
                                borderRadius: 12,
                                zIndex: 0
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: 40,
                                right: -20,
                                width: 60,
                                height: 60,
                                backgroundColor: '#FFF3E0',
                                borderRadius: 12,
                                zIndex: 0
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: 60,
                                left: 50,
                                width: 20,
                                height: 20,
                                backgroundColor: '#FF5722',
                                borderRadius: 4,
                                zIndex: 0
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: 40,
                                right: 100,
                                width: 25,
                                height: 25,
                                backgroundColor: '#FFC107',
                                borderRadius: '50%',
                                zIndex: 0
                            }} />
                            <div style={{
                                position: 'absolute',
                                top: 120,
                                left: 20,
                                width: 15,
                                height: 15,
                                backgroundColor: '#4CAF50',
                                borderRadius: 4,
                                transform: 'rotate(45deg)',
                                zIndex: 0
                            }} />
                            <div style={{
                                position: 'absolute',
                                bottom: 120,
                                right: 60,
                                width: 18,
                                height: 18,
                                backgroundColor: '#2196F3',
                                borderRadius: 4,
                                zIndex: 0
                            }} />
                            <img
                                src={heroImage}
                                alt="Sách Giáo Khoa"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            />
                        </div>
                    </Col>

                    <Col xs={24} md={12}>
                        <h1 style={{
                            fontSize: 42,
                            fontWeight: 700,
                            color: '#1890FF',
                            marginBottom: 24,
                            lineHeight: 1.3
                        }}>
                            SÁCH GIÁO KHOA TIẾNG ANH
                        </h1>
                        <p style={{
                            fontSize: 16,
                            color: '#666',
                            lineHeight: 1.8,
                            marginBottom: 32
                        }}>
                            Áp dụng phương pháp học tập khoa học mới hệ thống học trực tuyến thông minh, ứng dụng công nghệ 4.0 với trí tuệ nhân tạo. Việc áp dụng phương pháp mới này không những mang lại hiệu quả cao, tiết kiệm thời gian mà còn mang đến tính sáng tạo, tư duy độc lập, sự tìm tòi, nghiên cứu của học sinh.
                        </p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate('/login')}
                            style={{
                                backgroundColor: '#1890FF',
                                borderColor: '#1890FF',
                                height: 48,
                                fontSize: 16,
                                fontWeight: 600,
                                paddingLeft: 32,
                                paddingRight: 32
                            }}
                        >
                            Bắt đầu ngay
                        </Button>
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
    );
}

export default Home;
